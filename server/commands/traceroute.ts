/**
 * traceroute コマンド実行モジュール
 *
 * システムの traceroute コマンドを実行し、結果をリアルタイムでWebSocketクライアントに送信します。
 * 各ホップのIPアドレス、ホスト名、RTTを解析して構造化されたデータとして返します。
 */

import type { ServerWebSocket } from 'bun';

// traceroute の1ホップの情報
interface TracerouteHop {
	hop: number;
	host: string | null;
	ip: string | null;
	times: number[]; // 通常3回の計測
	timeout: boolean;
}

/**
 * ホスト名のバリデーション
 * コマンドインジェクション対策
 */
function isValidHost(host: string): boolean {
	const validPattern = /^[a-zA-Z0-9.\-:]+$/;
	if (host.length === 0 || host.length > 253) {
		return false;
	}
	return validPattern.test(host);
}

/**
 * traceroute の出力行を解析
 * macOS形式: " 1  router.local (192.168.1.1)  1.234 ms  1.456 ms  1.789 ms"
 * Linux形式: " 1  192.168.1.1 (192.168.1.1)  1.234 ms  1.456 ms  1.789 ms"
 * タイムアウト: " 2  * * *"
 */
function parseTracerouteLine(line: string): TracerouteHop | null {
	// 空行やヘッダ行をスキップ
	if (!line.trim() || line.includes('traceroute to')) {
		return null;
	}

	// ホップ番号を取得
	const hopMatch = line.match(/^\s*(\d+)\s+/);
	if (!hopMatch) {
		return null;
	}

	const hop = Number.parseInt(hopMatch[1], 10);

	// タイムアウトの検出（* * *）
	if (line.includes('* * *')) {
		return {
			hop,
			host: null,
			ip: null,
			times: [],
			timeout: true
		};
	}

	// ホスト名とIPアドレスを取得
	// パターン1: hostname (ip) または ip (ip)
	const hostIpMatch = line.match(/^\s*\d+\s+([^\s(]+)\s+\(([^)]+)\)/);
	// パターン2: ip のみ
	const ipOnlyMatch = line.match(/^\s*\d+\s+(\d+\.\d+\.\d+\.\d+)\s+/);

	let host: string | null = null;
	let ip: string | null = null;

	if (hostIpMatch) {
		host = hostIpMatch[1];
		ip = hostIpMatch[2];
		// ホスト名とIPが同じ場合はhostをnullに
		if (host === ip) {
			host = null;
		}
	} else if (ipOnlyMatch) {
		ip = ipOnlyMatch[1];
	}

	// RTT時間を取得（ms単位）
	const timeMatches = line.matchAll(/([\d.]+)\s*ms/g);
	const times: number[] = [];
	for (const match of timeMatches) {
		times.push(Number.parseFloat(match[1]));
	}

	// 部分的なタイムアウト（一部の応答がない）
	const partialTimeout = line.includes('*') && times.length < 3;

	return {
		hop,
		host,
		ip,
		times,
		timeout: times.length === 0
	};
}

/**
 * traceroute コマンドを実行し、結果をWebSocketで送信
 */
export async function executeTraceroute(
	ws: ServerWebSocket<unknown>,
	host: string,
	maxHops: number = 30
): Promise<void> {
	// ホスト名のバリデーション
	if (!isValidHost(host)) {
		ws.send(
			JSON.stringify({
				type: 'traceroute-error',
				data: { error: '無効なホスト名です。英数字、ドット、ハイフンのみ使用できます。' }
			})
		);
		return;
	}

	// maxHops の範囲チェック（1〜64に制限）
	const safeMaxHops = Math.min(Math.max(1, maxHops), 64);

	try {
		// macOSでは traceroute、Linuxでも traceroute を使用
		const proc = Bun.spawn(['traceroute', '-m', String(safeMaxHops), host], {
			stdout: 'pipe',
			stderr: 'pipe'
		});

		const hops: TracerouteHop[] = [];

		// 開始メッセージ
		ws.send(
			JSON.stringify({
				type: 'traceroute-start',
				data: { host, maxHops: safeMaxHops }
			})
		);

		// stdout をリアルタイムで読み取り
		const reader = proc.stdout.getReader();
		const decoder = new TextDecoder();
		let buffer = '';

		while (true) {
			const { done, value } = await reader.read();

			if (done) break;

			buffer += decoder.decode(value, { stream: true });

			// 改行で分割して処理
			const lines = buffer.split('\n');
			buffer = lines.pop() || '';

			for (const line of lines) {
				if (line.trim()) {
					const parsed = parseTracerouteLine(line);

					if (parsed) {
						hops.push(parsed);

						// 各ホップをクライアントに送信
						ws.send(
							JSON.stringify({
								type: 'traceroute-hop',
								data: parsed
							})
						);
					} else if (line.includes('traceroute to')) {
						// ヘッダ行を送信
						ws.send(
							JSON.stringify({
								type: 'traceroute-header',
								data: { line }
							})
						);
					}
				}
			}
		}

		// プロセスの終了を待つ
		const exitCode = await proc.exited;

		// stderr を確認
		const stderrText = await new Response(proc.stderr).text();
		if (stderrText.trim() && exitCode !== 0) {
			ws.send(
				JSON.stringify({
					type: 'traceroute-error',
					data: { error: stderrText.trim() }
				})
			);
		}

		// 完了メッセージ
		ws.send(
			JSON.stringify({
				type: 'traceroute-complete',
				data: {
					host,
					totalHops: hops.length,
					reachedDestination: hops.some((h) => h.ip && !h.timeout),
					exitCode
				}
			})
		);
	} catch (error) {
		ws.send(
			JSON.stringify({
				type: 'traceroute-error',
				data: {
					error:
						error instanceof Error ? error.message : 'traceroute の実行中にエラーが発生しました'
				}
			})
		);
	}
}

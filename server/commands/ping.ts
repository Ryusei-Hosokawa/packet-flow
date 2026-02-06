/**
 * ping コマンド実行モジュール
 *
 * システムの ping コマンドを実行し、結果をリアルタイムでWebSocketクライアントに送信します。
 * セキュリティ対策として、ホスト名のバリデーションを行います。
 */

import type { ServerWebSocket } from 'bun';

// ping の結果を解析した構造
interface PingResult {
	type: 'ping-line' | 'ping-complete' | 'ping-error';
	data: {
		line?: string;
		host?: string;
		seq?: number;
		ttl?: number;
		time?: number;
		success?: boolean;
		summary?: PingSummary;
		error?: string;
	};
}

interface PingSummary {
	transmitted: number;
	received: number;
	lossPercent: number;
	minTime?: number;
	avgTime?: number;
	maxTime?: number;
}

/**
 * ホスト名のバリデーション
 * コマンドインジェクション対策として、許可された文字のみを受け入れます
 */
function isValidHost(host: string): boolean {
	// ホスト名またはIPアドレスとして有効な文字のみ許可
	// - 英数字
	// - ドット（.）
	// - ハイフン（-）
	// - コロン（:）IPv6用
	const validPattern = /^[a-zA-Z0-9.\-:]+$/;

	// 長さチェック（253文字以下）
	if (host.length === 0 || host.length > 253) {
		return false;
	}

	return validPattern.test(host);
}

/**
 * ping の出力行を解析
 * 例: "64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=4.52 ms"
 */
function parsePingLine(line: string): Partial<PingResult['data']> | null {
	// 応答行の解析
	const responseMatch = line.match(
		/(\d+) bytes from ([^:]+): icmp_seq=(\d+) ttl=(\d+) time=([\d.]+) ms/
	);

	if (responseMatch) {
		return {
			host: responseMatch[2],
			seq: Number.parseInt(responseMatch[3], 10),
			ttl: Number.parseInt(responseMatch[4], 10),
			time: Number.parseFloat(responseMatch[5]),
			success: true
		};
	}

	// タイムアウトの検出
	if (line.includes('Request timeout') || line.includes('timed out')) {
		const seqMatch = line.match(/icmp_seq[=\s](\d+)/);
		return {
			seq: seqMatch ? Number.parseInt(seqMatch[1], 10) : undefined,
			success: false
		};
	}

	return null;
}

/**
 * ping の統計情報を解析
 * 例: "4 packets transmitted, 4 packets received, 0.0% packet loss"
 * 例: "round-trip min/avg/max/stddev = 4.123/5.456/7.890/1.234 ms"
 */
function parsePingSummary(lines: string[]): PingSummary | null {
	let summary: Partial<PingSummary> = {};

	for (const line of lines) {
		// パケット統計
		const statsMatch = line.match(/(\d+) packets transmitted, (\d+) (?:packets )?received, ([\d.]+)% packet loss/);
		if (statsMatch) {
			summary.transmitted = Number.parseInt(statsMatch[1], 10);
			summary.received = Number.parseInt(statsMatch[2], 10);
			summary.lossPercent = Number.parseFloat(statsMatch[3]);
		}

		// RTT統計
		const rttMatch = line.match(/min\/avg\/max\/\w+ = ([\d.]+)\/([\d.]+)\/([\d.]+)/);
		if (rttMatch) {
			summary.minTime = Number.parseFloat(rttMatch[1]);
			summary.avgTime = Number.parseFloat(rttMatch[2]);
			summary.maxTime = Number.parseFloat(rttMatch[3]);
		}
	}

	if (summary.transmitted !== undefined && summary.received !== undefined) {
		return summary as PingSummary;
	}

	return null;
}

/**
 * ping コマンドを実行し、結果をWebSocketで送信
 */
export async function executePing(
	ws: ServerWebSocket<unknown>,
	host: string,
	count: number = 4
): Promise<void> {
	// ホスト名のバリデーション
	if (!isValidHost(host)) {
		ws.send(
			JSON.stringify({
				type: 'ping-error',
				data: { error: '無効なホスト名です。英数字、ドット、ハイフンのみ使用できます。' }
			})
		);
		return;
	}

	// count の範囲チェック（1〜20に制限）
	const safeCount = Math.min(Math.max(1, count), 20);

	try {
		// ping コマンドを実行
		const proc = Bun.spawn(['ping', '-c', String(safeCount), host], {
			stdout: 'pipe',
			stderr: 'pipe'
		});

		const allLines: string[] = [];

		// 開始メッセージ
		ws.send(
			JSON.stringify({
				type: 'ping-start',
				data: { host, count: safeCount }
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
			buffer = lines.pop() || ''; // 最後の不完全な行はバッファに残す

			for (const line of lines) {
				if (line.trim()) {
					allLines.push(line);

					// 行を解析
					const parsed = parsePingLine(line);

					// 各行をクライアントに送信
					ws.send(
						JSON.stringify({
							type: 'ping-line',
							data: {
								line,
								...parsed
							}
						})
					);
				}
			}
		}

		// 残りのバッファを処理
		if (buffer.trim()) {
			allLines.push(buffer);
		}

		// プロセスの終了を待つ
		const exitCode = await proc.exited;

		// stderr を確認
		const stderrText = await new Response(proc.stderr).text();
		if (stderrText.trim()) {
			ws.send(
				JSON.stringify({
					type: 'ping-error',
					data: { error: stderrText.trim() }
				})
			);
		}

		// 統計情報を解析して送信
		const summary = parsePingSummary(allLines);

		ws.send(
			JSON.stringify({
				type: 'ping-complete',
				data: {
					host,
					exitCode,
					summary
				}
			})
		);
	} catch (error) {
		ws.send(
			JSON.stringify({
				type: 'ping-error',
				data: {
					error: error instanceof Error ? error.message : 'ping の実行中にエラーが発生しました'
				}
			})
		);
	}
}

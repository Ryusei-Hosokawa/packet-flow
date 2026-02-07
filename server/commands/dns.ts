/**
 * DNS 解決モジュール
 *
 * nslookup または dig コマンドを使用してDNS解決を行い、結果をWebSocketで送信します。
 */

import type { ServerWebSocket } from 'bun';

// DNSレコードの型
interface DNSRecord {
	type: string; // A, AAAA, CNAME, MX, NS, TXT など
	value: string;
	ttl?: number;
	priority?: number; // MXレコード用
}

interface DNSResult {
	domain: string;
	records: DNSRecord[];
	nameServers?: string[];
	queryTime?: number;
}

/**
 * ドメイン名のバリデーション
 */
function isValidDomain(domain: string): boolean {
	const validPattern = /^[a-zA-Z0-9.\-]+$/;
	if (domain.length === 0 || domain.length > 253) {
		return false;
	}
	return validPattern.test(domain);
}

/**
 * nslookup の出力を解析
 */
function parseNslookupOutput(output: string, domain: string): DNSResult {
	const lines = output.split('\n');
	const records: DNSRecord[] = [];
	const nameServers: string[] = [];

	let inAnswerSection = false;

	for (const line of lines) {
		// サーバー情報
		if (line.includes('Server:')) {
			const match = line.match(/Server:\s+(.+)/);
			if (match) {
				nameServers.push(match[1].trim());
			}
		}

		// Non-authoritative answer の後がレコード情報
		if (line.includes('Non-authoritative answer') || line.includes('Authoritative answer')) {
			inAnswerSection = true;
			continue;
		}

		if (inAnswerSection) {
			// IPv4アドレス (A record)
			const addressMatch = line.match(/Address:\s+(\d+\.\d+\.\d+\.\d+)/);
			if (addressMatch) {
				records.push({
					type: 'A',
					value: addressMatch[1]
				});
			}

			// IPv6アドレス (AAAA record)
			const ipv6Match = line.match(/Address:\s+([0-9a-fA-F:]+)/);
			if (ipv6Match && ipv6Match[1].includes(':')) {
				records.push({
					type: 'AAAA',
					value: ipv6Match[1]
				});
			}

			// CNAME
			const cnameMatch = line.match(/canonical name\s*=\s*(.+)/i);
			if (cnameMatch) {
				records.push({
					type: 'CNAME',
					value: cnameMatch[1].trim().replace(/\.$/, '')
				});
			}

			// Name pattern for various records
			const nameMatch = line.match(/Name:\s+(.+)/);
			if (nameMatch && !records.some((r) => r.value === nameMatch[1].trim())) {
				// This is usually followed by Address, so we skip it
			}
		}
	}

	return {
		domain,
		records,
		nameServers: nameServers.length > 0 ? nameServers : undefined
	};
}

/**
 * dig コマンドの出力を解析（より詳細な情報が取得可能）
 * +noall +answer オプション使用時の出力形式:
 * google.com.		123	IN	A	142.250.199.46
 */
function parseDigOutput(output: string, domain: string): DNSResult {
	const lines = output.split('\n');
	const records: DNSRecord[] = [];
	let queryTime: number | undefined;

	for (const line of lines) {
		// Query time
		const queryTimeMatch = line.match(/Query time:\s+(\d+)\s+msec/);
		if (queryTimeMatch) {
			queryTime = Number.parseInt(queryTimeMatch[1], 10);
			continue;
		}

		// コメント行やセクションヘッダをスキップ
		if (line.startsWith(';') || line.includes('SECTION') || !line.trim()) {
			continue;
		}

		// dig の出力形式: domain TTL IN TYPE VALUE
		const parts = line.trim().split(/\s+/);
		if (parts.length >= 5 && parts[2] === 'IN') {
			const ttl = Number.parseInt(parts[1], 10);
			const recordType = parts[3];
			const value = parts.slice(4).join(' ').replace(/\.$/, '');

			if (recordType === 'MX') {
				const priority = Number.parseInt(parts[4], 10);
				records.push({
					type: recordType,
					value: parts.slice(5).join(' ').replace(/\.$/, ''),
					ttl,
					priority
				});
			} else {
				records.push({
					type: recordType,
					value,
					ttl
				});
			}
		}
	}

	return {
		domain,
		records,
		queryTime
	};
}

/**
 * DNS解決を実行
 */
export async function executeDNS(
	ws: ServerWebSocket<unknown>,
	domain: string,
	recordType: string = 'A'
): Promise<void> {
	// ドメイン名のバリデーション
	if (!isValidDomain(domain)) {
		ws.send(
			JSON.stringify({
				type: 'dns-error',
				data: { error: '無効なドメイン名です。英数字、ドット、ハイフンのみ使用できます。' }
			})
		);
		return;
	}

	// レコードタイプのバリデーション
	const validTypes = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'ANY'];
	const safeRecordType = validTypes.includes(recordType.toUpperCase())
		? recordType.toUpperCase()
		: 'A';

	try {
		// 開始メッセージ
		ws.send(
			JSON.stringify({
				type: 'dns-start',
				data: { domain, recordType: safeRecordType }
			})
		);

		// dig コマンドを試行、なければ nslookup を使用
		let result: DNSResult;
		let usesDig = false;

		try {
			// dig を使用（より詳細な情報が取得可能）
			const digProc = Bun.spawn(['dig', '+noall', '+answer', '+stats', domain, safeRecordType], {
				stdout: 'pipe',
				stderr: 'pipe'
			});

			const digOutput = await new Response(digProc.stdout).text();
			const digExitCode = await digProc.exited;

			if (digExitCode === 0 && digOutput.trim()) {
				result = parseDigOutput(digOutput, domain);
				usesDig = true;
			} else {
				throw new Error('dig failed, falling back to nslookup');
			}
		} catch {
			// nslookup にフォールバック
			const nslookupProc = Bun.spawn(['nslookup', domain], {
				stdout: 'pipe',
				stderr: 'pipe'
			});

			const nslookupOutput = await new Response(nslookupProc.stdout).text();
			const nslookupExitCode = await nslookupProc.exited;

			if (nslookupExitCode !== 0) {
				const stderrText = await new Response(nslookupProc.stderr).text();
				throw new Error(stderrText || 'DNS解決に失敗しました');
			}

			result = parseNslookupOutput(nslookupOutput, domain);
		}

		// 結果を送信
		ws.send(
			JSON.stringify({
				type: 'dns-complete',
				data: {
					...result,
					recordType: safeRecordType,
					tool: usesDig ? 'dig' : 'nslookup'
				}
			})
		);
	} catch (error) {
		ws.send(
			JSON.stringify({
				type: 'dns-error',
				data: {
					error: error instanceof Error ? error.message : 'DNS解決中にエラーが発生しました'
				}
			})
		);
	}
}

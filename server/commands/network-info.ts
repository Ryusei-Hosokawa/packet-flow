/**
 * ネットワーク情報取得モジュール
 *
 * ローカルマシンのネットワーク情報（IP、インターフェース、デフォルトゲートウェイなど）を取得します。
 */

import type { ServerWebSocket } from 'bun';
import { networkInterfaces } from 'node:os';

// ネットワークインターフェースの情報
interface NetworkInterface {
	name: string;
	mac: string;
	ipv4?: string;
	ipv4Netmask?: string;
	ipv6?: string;
	ipv6Netmask?: string;
	internal: boolean;
}

// ネットワーク情報全体
interface NetworkInfo {
	hostname: string;
	interfaces: NetworkInterface[];
	defaultGateway?: string;
	publicIP?: string;
	dnsServers?: string[];
}

/**
 * デフォルトゲートウェイを取得（macOS/Linux）
 */
async function getDefaultGateway(): Promise<string | undefined> {
	try {
		// macOS
		const proc = Bun.spawn(['route', '-n', 'get', 'default'], {
			stdout: 'pipe',
			stderr: 'pipe'
		});

		const output = await new Response(proc.stdout).text();
		const match = output.match(/gateway:\s+(\S+)/);
		if (match) {
			return match[1];
		}
	} catch {
		// Linux fallback
		try {
			const proc = Bun.spawn(['ip', 'route', 'show', 'default'], {
				stdout: 'pipe',
				stderr: 'pipe'
			});

			const output = await new Response(proc.stdout).text();
			const match = output.match(/via\s+(\S+)/);
			if (match) {
				return match[1];
			}
		} catch {
			// Could not determine default gateway
		}
	}
	return undefined;
}

/**
 * DNSサーバーを取得
 */
async function getDNSServers(): Promise<string[]> {
	const servers: string[] = [];

	try {
		// macOS/Linux: /etc/resolv.conf を読む
		const proc = Bun.spawn(['cat', '/etc/resolv.conf'], {
			stdout: 'pipe',
			stderr: 'pipe'
		});

		const output = await new Response(proc.stdout).text();
		const lines = output.split('\n');

		for (const line of lines) {
			const match = line.match(/^nameserver\s+(\S+)/);
			if (match) {
				servers.push(match[1]);
			}
		}
	} catch {
		// Could not read DNS servers
	}

	return servers;
}

/**
 * パブリックIPを取得
 */
async function getPublicIP(): Promise<string | undefined> {
	try {
		// 外部サービスを使ってパブリックIPを取得
		const response = await fetch('https://api.ipify.org?format=json', {
			signal: AbortSignal.timeout(5000)
		});

		if (response.ok) {
			const data = (await response.json()) as { ip: string };
			return data.ip;
		}
	} catch {
		// Could not fetch public IP
	}
	return undefined;
}

/**
 * ネットワーク情報を取得して送信
 */
export async function executeNetworkInfo(ws: ServerWebSocket<unknown>): Promise<void> {
	try {
		// 開始メッセージ
		ws.send(
			JSON.stringify({
				type: 'network-info-start',
				data: {}
			})
		);

		// ホスト名を取得
		const hostnameProc = Bun.spawn(['hostname'], {
			stdout: 'pipe',
			stderr: 'pipe'
		});
		const hostname = (await new Response(hostnameProc.stdout).text()).trim();

		// ネットワークインターフェースを取得
		const interfaces: NetworkInterface[] = [];
		const netInterfaces = networkInterfaces();

		for (const [name, addrs] of Object.entries(netInterfaces)) {
			if (!addrs) continue;

			const iface: NetworkInterface = {
				name,
				mac: '',
				internal: false
			};

			for (const addr of addrs) {
				if (addr.mac && addr.mac !== '00:00:00:00:00:00') {
					iface.mac = addr.mac;
				}
				iface.internal = addr.internal;

				if (addr.family === 'IPv4') {
					iface.ipv4 = addr.address;
					iface.ipv4Netmask = addr.netmask;
				} else if (addr.family === 'IPv6') {
					// リンクローカルアドレス以外を優先
					if (!addr.address.startsWith('fe80::') || !iface.ipv6) {
						iface.ipv6 = addr.address;
						iface.ipv6Netmask = addr.netmask;
					}
				}
			}

			// MACアドレスまたはIPがあるインターフェースのみ追加
			if (iface.mac || iface.ipv4 || iface.ipv6) {
				interfaces.push(iface);
			}
		}

		// 各種情報を並行して取得
		const [defaultGateway, dnsServers, publicIP] = await Promise.all([
			getDefaultGateway(),
			getDNSServers(),
			getPublicIP()
		]);

		const info: NetworkInfo = {
			hostname,
			interfaces,
			defaultGateway,
			publicIP,
			dnsServers: dnsServers.length > 0 ? dnsServers : undefined
		};

		// 完了メッセージ
		ws.send(
			JSON.stringify({
				type: 'network-info-complete',
				data: info
			})
		);
	} catch (error) {
		ws.send(
			JSON.stringify({
				type: 'network-info-error',
				data: {
					error:
						error instanceof Error ? error.message : 'ネットワーク情報の取得中にエラーが発生しました'
				}
			})
		);
	}
}

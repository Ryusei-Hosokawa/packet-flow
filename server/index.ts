/**
 * PacketFlow バックエンドサーバー
 *
 * Bun の組み込み WebSocket を使用してフロントエンドと通信します。
 * システムコマンド（ping, traceroute など）を実行し、結果をリアルタイムで送信します。
 */

import { executePing } from './commands/ping';
import { executeTraceroute } from './commands/traceroute';
import { executeDNS } from './commands/dns';
import { executeNetworkInfo } from './commands/network-info';

// WebSocket メッセージの型定義
interface WSMessage {
	type: 'ping' | 'traceroute' | 'dns' | 'network-info' | 'echo' | 'broadcast';
	payload?: {
		host?: string;
		domain?: string;
		count?: number;
		maxHops?: number;
		recordType?: string;
		message?: string;
		timestamp?: number; // クライアントからのタイムスタンプ
	};
}

// 接続中のクライアント管理
const clients = new Set<WebSocket>();

// 全クライアントにブロードキャスト
function broadcastToAll(message: object) {
	const data = JSON.stringify(message);
	for (const client of clients) {
		try {
			(client as unknown as { send: (data: string) => void }).send(data);
		} catch {
			// 送信失敗したクライアントは無視
		}
	}
}

// 送信者以外にブロードキャスト
function broadcastToOthers(sender: WebSocket, message: object) {
	const data = JSON.stringify(message);
	for (const client of clients) {
		if (client !== sender) {
			try {
				(client as unknown as { send: (data: string) => void }).send(data);
			} catch {
				// 送信失敗したクライアントは無視
			}
		}
	}
}

// サーバー設定
const PORT = 3001;

const server = Bun.serve({
	port: PORT,

	// HTTP リクエストのハンドラー（WebSocket アップグレード用）
	fetch(req, server) {
		// WebSocket へのアップグレードを試みる
		const success = server.upgrade(req);
		if (success) {
			// upgrade が成功した場合、HTTP レスポンスは不要
			return undefined;
		}

		// 通常の HTTP リクエストには簡単なレスポンスを返す
		return new Response('PacketFlow WebSocket Server. Connect via WebSocket.', {
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		});
	},

	// WebSocket ハンドラー
	websocket: {
		// クライアントが接続したとき
		open(ws) {
			console.log('Client connected');
			clients.add(ws as unknown as WebSocket);
			ws.send(JSON.stringify({
				type: 'connected',
				message: 'Welcome to PacketFlow Server',
				clientCount: clients.size
			}));
			// 他のクライアントに通知
			broadcastToOthers(ws as unknown as WebSocket, {
				type: 'client-joined',
				clientCount: clients.size
			});
		},

		// メッセージを受信したとき
		async message(ws, message) {
			try {
				const data: WSMessage = JSON.parse(message.toString());
				console.log('Received:', data);

				switch (data.type) {
					case 'ping':
						if (data.payload?.host) {
							await executePing(ws, data.payload.host, data.payload.count ?? 4);
						}
						break;

					case 'traceroute':
						if (data.payload?.host) {
							await executeTraceroute(ws, data.payload.host, data.payload.maxHops ?? 30);
						}
						break;

					case 'dns':
						if (data.payload?.domain) {
							await executeDNS(ws, data.payload.domain, data.payload.recordType ?? 'A');
						}
						break;

					case 'network-info':
						await executeNetworkInfo(ws);
						break;

					case 'echo':
						// エコー: 送信者に即座に返す（クライアントのタイムスタンプをそのまま返す）
						ws.send(JSON.stringify({
							type: 'echo-response',
							timestamp: data.payload?.timestamp, // クライアントのタイムスタンプをエコー
							originalMessage: data.payload?.message
						}));
						break;

					case 'broadcast':
						// ブロードキャスト: 全クライアントに送信
						broadcastToAll({
							type: 'broadcast-message',
							timestamp: Date.now(),
							message: data.payload?.message,
							clientCount: clients.size
						});
						break;

					default:
						ws.send(JSON.stringify({ type: 'error', message: `Unknown command: ${data.type}` }));
				}
			} catch (error) {
				console.error('Error processing message:', error);
				ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
			}
		},

		// クライアントが切断したとき
		close(ws) {
			console.log('Client disconnected');
			clients.delete(ws as unknown as WebSocket);
			// 他のクライアントに通知
			broadcastToAll({
				type: 'client-left',
				clientCount: clients.size
			});
		}
	}
});

console.log(`PacketFlow Server running on ws://localhost:${PORT}`);

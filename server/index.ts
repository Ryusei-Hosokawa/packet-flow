/**
 * PacketFlow バックエンドサーバー
 *
 * Bun の組み込み WebSocket を使用してフロントエンドと通信します。
 * システムコマンド（ping, traceroute など）を実行し、結果をリアルタイムで送信します。
 */

import { executePing } from './commands/ping';
import { executeTraceroute } from './commands/traceroute';

// WebSocket メッセージの型定義
interface WSMessage {
	type: 'ping' | 'traceroute' | 'dns';
	payload: {
		host: string;
		count?: number;
		maxHops?: number;
	};
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
			ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to PacketFlow Server' }));
		},

		// メッセージを受信したとき
		async message(ws, message) {
			try {
				const data: WSMessage = JSON.parse(message.toString());
				console.log('Received:', data);

				switch (data.type) {
					case 'ping':
						await executePing(ws, data.payload.host, data.payload.count ?? 4);
						break;

					case 'traceroute':
						await executeTraceroute(ws, data.payload.host, data.payload.maxHops ?? 30);
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
		}
	}
});

console.log(`PacketFlow Server running on ws://localhost:${PORT}`);

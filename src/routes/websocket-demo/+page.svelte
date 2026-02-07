<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Term from '$lib/components/ui/Term.svelte';

	// 状態管理
	let isConnected = $state(false);
	let clientCount = $state(0);
	let messageInput = $state('');
	let messages = $state<Message[]>([]);
	let latencyHistory = $state<number[]>([]);
	let ws: WebSocket | null = null;

	interface Message {
		id: number;
		type: 'sent' | 'received' | 'system' | 'broadcast';
		content: string;
		timestamp: number;
		latency?: number;
	}

	let messageId = 0;

	function connect() {
		try {
			ws = new WebSocket('ws://localhost:3001');

			ws.onopen = () => {
				isConnected = true;
				addMessage('system', 'サーバーに接続しました');
			};

			ws.onclose = () => {
				isConnected = false;
				addMessage('system', 'サーバーから切断されました');
			};

			ws.onerror = () => {
				addMessage('system', '接続エラーが発生しました');
			};

			ws.onmessage = (event) => {
				handleMessage(JSON.parse(event.data));
			};
		} catch {
			addMessage('system', 'WebSocket接続に失敗しました');
		}
	}

	function disconnect() {
		if (ws) {
			ws.close();
			ws = null;
		}
	}

	function handleMessage(data: {
		type: string;
		message?: string;
		clientCount?: number;
		originalMessage?: string;
		timestamp?: number;
		serverProcessingTime?: number;
	}) {
		switch (data.type) {
			case 'connected':
				clientCount = data.clientCount ?? 1;
				break;

			case 'client-joined':
			case 'client-left':
				clientCount = data.clientCount ?? 0;
				addMessage('system', `接続中のクライアント: ${clientCount}`);
				break;

			case 'echo-response':
				if (data.timestamp) {
					const latency = Date.now() - data.timestamp;
					latencyHistory = [...latencyHistory.slice(-19), latency];
					addMessage('received', `Echo: ${data.originalMessage}`, latency);
				}
				break;

			case 'broadcast-message':
				addMessage('broadcast', data.message ?? '');
				break;
		}
	}

	function addMessage(type: Message['type'], content: string, latency?: number) {
		messages = [
			...messages,
			{
				id: messageId++,
				type,
				content,
				timestamp: Date.now(),
				latency
			}
		].slice(-50); // 最新50件のみ保持
	}

	function sendEcho() {
		if (!ws || !messageInput.trim()) return;

		const msg = messageInput.trim();
		addMessage('sent', `Echo: ${msg}`);

		ws.send(
			JSON.stringify({
				type: 'echo',
				payload: {
					message: msg,
					timestamp: Date.now() // クライアントのタイムスタンプを送信
				}
			})
		);

		messageInput = '';
	}

	function sendBroadcast() {
		if (!ws || !messageInput.trim()) return;

		const msg = messageInput.trim();
		addMessage('sent', `Broadcast: ${msg}`);

		ws.send(
			JSON.stringify({
				type: 'broadcast',
				payload: { message: msg }
			})
		);

		messageInput = '';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendEcho();
		}
	}

	// 平均レイテンシー計算
	let averageLatency = $derived(
		latencyHistory.length > 0
			? Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length)
			: 0
	);

	onMount(() => {
		connect();
	});

	onDestroy(() => {
		disconnect();
	});
</script>

<svelte:head>
	<title>WebSocket デモ - PacketFlow</title>
</svelte:head>

<div class="mx-auto w-full py-8">
	<h1 class="mb-2 text-2xl font-bold sm:text-3xl">WebSocket リアルタイム通信デモ</h1>
	<p class="mb-6 text-muted-foreground">
		WebSocketによる双方向リアルタイム通信を体験しましょう
	</p>

	<!-- 接続状態パネル -->
	<div class="mb-6 rounded-lg border border-border bg-card p-4">
		<div class="flex flex-wrap items-center gap-4">
			<div class="flex items-center gap-2">
				<span
					class="h-3 w-3 rounded-full {isConnected ? 'bg-green-500' : 'bg-red-500'}"
					aria-hidden="true"
				></span>
				<span class="text-sm">
					{isConnected ? 'サーバー接続中' : 'サーバー未接続'}
				</span>
			</div>

			{#if isConnected}
				<div class="text-sm text-muted-foreground">
					接続クライアント数: <span class="font-bold text-foreground">{clientCount}</span>
				</div>

				<div class="text-sm text-muted-foreground">
					平均レイテンシー: <span class="font-bold text-foreground">{averageLatency}ms</span>
				</div>

				<button
					onclick={disconnect}
					class="ml-auto rounded-md bg-muted px-3 py-1 text-sm hover:bg-muted/80"
				>
					切断
				</button>
			{:else}
				<button
					onclick={connect}
					class="ml-auto rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
				>
					接続
				</button>
			{/if}
		</div>
	</div>

	<!-- メッセージエリア -->
	<div class="mb-6 grid gap-6 lg:grid-cols-2">
		<!-- 送信フォーム -->
		<div class="rounded-lg border border-border bg-card p-4">
			<h2 class="mb-3 font-semibold">メッセージ送信</h2>

			<div class="mb-3">
				<input
					type="text"
					bind:value={messageInput}
					onkeydown={handleKeydown}
					disabled={!isConnected}
					placeholder="メッセージを入力..."
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
				/>
			</div>

			<div class="flex gap-2">
				<button
					onclick={sendEcho}
					disabled={!isConnected || !messageInput.trim()}
					class="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				>
					Echo（自分に返信）
				</button>
				<button
					onclick={sendBroadcast}
					disabled={!isConnected || !messageInput.trim()}
					class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
				>
					Broadcast（全員に送信）
				</button>
			</div>

			<p class="mt-2 text-xs text-muted-foreground">
				Enter キーでEcho送信。複数のブラウザタブを開いてBroadcastを試してみましょう。
			</p>
		</div>

		<!-- レイテンシーグラフ -->
		<div class="rounded-lg border border-border bg-card p-4">
			<h2 class="mb-3 font-semibold">レイテンシー（往復時間）</h2>

			<div class="flex h-24 items-end gap-1">
				{#each latencyHistory as latency, i}
					<div
						class="flex-1 rounded-t bg-primary transition-all duration-200"
						style="height: {Math.min(100, latency)}%"
						title="{latency}ms"
					></div>
				{/each}
				{#if latencyHistory.length === 0}
					<p class="w-full text-center text-sm text-muted-foreground">
						Echoを送信するとレイテンシーが表示されます
					</p>
				{/if}
			</div>

			{#if latencyHistory.length > 0}
				<div class="mt-2 flex justify-between text-xs text-muted-foreground">
					<span>最小: {Math.min(...latencyHistory)}ms</span>
					<span>平均: {averageLatency}ms</span>
					<span>最大: {Math.max(...latencyHistory)}ms</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- メッセージログ -->
	<div class="rounded-lg border border-border bg-card p-4">
		<h2 class="mb-3 font-semibold">メッセージログ</h2>

		<div class="h-64 overflow-y-auto rounded-lg bg-muted/50 p-3">
			{#if messages.length === 0}
				<p class="text-center text-sm text-muted-foreground">メッセージはまだありません</p>
			{:else}
				<div class="space-y-2">
					{#each messages as message (message.id)}
						<div
							class="flex items-start gap-2 text-sm {message.type === 'sent'
								? 'text-blue-500'
								: message.type === 'received'
									? 'text-green-500'
									: message.type === 'broadcast'
										? 'text-purple-500'
										: 'text-muted-foreground'}"
						>
							<span class="shrink-0 font-mono text-xs opacity-60">
								{new Date(message.timestamp).toLocaleTimeString()}
							</span>
							<span class="shrink-0">
								{#if message.type === 'sent'}[送信]
								{:else if message.type === 'received'}[受信]
								{:else if message.type === 'broadcast'}[全員]
								{:else}[システム]{/if}
							</span>
							<span class="flex-1">{message.content}</span>
							{#if message.latency !== undefined}
								<span class="shrink-0 text-xs opacity-60">{message.latency}ms</span>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- 学習ポイント -->
	<div class="mt-6 rounded-lg border border-dashed border-border bg-background p-4 sm:p-6">
		<h3 class="mb-3 text-sm font-semibold">WebSocketについて</h3>
		<div class="space-y-3 text-sm text-muted-foreground">
			<p>
				<strong>WebSocket</strong
				>は、クライアントとサーバー間で双方向のリアルタイム通信を可能にするプロトコルです。HTTPとは異なり、一度接続を確立すると、サーバーからクライアントへのプッシュ通知も可能になります。
			</p>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="rounded bg-muted p-3">
					<p class="mb-1 font-medium text-foreground">HTTP vs WebSocket</p>
					<ul class="list-inside list-disc space-y-1 text-xs">
						<li>HTTP: リクエスト-レスポンス型（毎回接続）</li>
						<li>WebSocket: 常時接続（双方向通信可能）</li>
					</ul>
				</div>
				<div class="rounded bg-muted p-3">
					<p class="mb-1 font-medium text-foreground">主な用途</p>
					<ul class="list-inside list-disc space-y-1 text-xs">
						<li>チャット・メッセージング</li>
						<li>リアルタイムゲーム</li>
						<li>株価・為替のライブ更新</li>
						<li>コラボレーションツール</li>
					</ul>
				</div>
			</div>

			<p>
				このデモでは、<strong>Echo</strong>（送信したメッセージが自分に返ってくる）と<strong
					>Broadcast</strong
				>（全クライアントにメッセージを送信）の2種類の通信パターンを体験できます。複数のブラウザタブを開いて試してみてください。
			</p>
		</div>
	</div>
</div>

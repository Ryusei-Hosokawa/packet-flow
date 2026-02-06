<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Term from '$lib/components/ui/Term.svelte';

	// 状態管理
	let host = $state('8.8.8.8');
	let count = $state(4);
	let isRunning = $state(false);
	let isConnected = $state(false);
	let results = $state<PingLine[]>([]);
	let summary = $state<PingSummary | null>(null);
	let error = $state<string | null>(null);

	// WebSocket接続
	let ws: WebSocket | null = null;

	interface PingLine {
		line: string;
		seq?: number;
		ttl?: number;
		time?: number;
		success?: boolean;
	}

	interface PingSummary {
		transmitted: number;
		received: number;
		lossPercent: number;
		minTime?: number;
		avgTime?: number;
		maxTime?: number;
	}

	function connect() {
		try {
			ws = new WebSocket('ws://localhost:3001');

			ws.onopen = () => {
				isConnected = true;
				error = null;
				console.log('WebSocket connected');
			};

			ws.onclose = () => {
				isConnected = false;
				isRunning = false;
				console.log('WebSocket disconnected');
			};

			ws.onerror = (e) => {
				console.error('WebSocket error:', e);
				error = 'サーバーに接続できません。バックエンドサーバーが起動しているか確認してください。';
				isConnected = false;
			};

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data) as WSMessage;
				handleMessage(data);
			};
		} catch (e) {
			error = 'WebSocket接続に失敗しました';
		}
	}

	interface WSMessage {
		type: string;
		data?: PingLine & {
			summary?: PingSummary;
			error?: string;
		};
		message?: string;
	}

	function handleMessage(msg: WSMessage) {
		switch (msg.type) {
			case 'connected':
				console.log('Server message:', msg.message);
				break;

			case 'ping-start':
				results = [];
				summary = null;
				error = null;
				isRunning = true;
				break;

			case 'ping-line':
				if (msg.data) {
					results = [...results, msg.data];
				}
				break;

			case 'ping-complete':
				isRunning = false;
				if (msg.data?.summary) {
					summary = msg.data.summary;
				}
				break;

			case 'ping-error':
				isRunning = false;
				if (msg.data?.error) {
					error = msg.data.error;
				}
				break;
		}
	}

	function executePing() {
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			error = 'サーバーに接続されていません';
			return;
		}

		if (!host.trim()) {
			error = 'ホスト名を入力してください';
			return;
		}

		// pingリクエストを送信
		ws.send(
			JSON.stringify({
				type: 'ping',
				payload: {
					host: host.trim(),
					count
				}
			})
		);
	}

	function disconnect() {
		if (ws) {
			ws.close();
			ws = null;
		}
	}

	onMount(() => {
		connect();
	});

	onDestroy(() => {
		disconnect();
	});

	// RTTに基づく色を決定
	function getTimeColor(time: number): string {
		if (time < 50) return 'text-green-500';
		if (time < 100) return 'text-yellow-500';
		if (time < 200) return 'text-orange-500';
		return 'text-red-500';
	}
</script>

<svelte:head>
	<title>Ping ツール - PacketFlow</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<h1 class="mb-2 text-2xl font-bold sm:text-3xl">Ping ツール</h1>
	<p class="mb-6 text-muted-foreground">
		<Term id="icmp">ICMP</Term>を使用してホストへの到達性と<Term id="rtt">RTT</Term
		>（往復時間）を測定します
	</p>

	<!-- 接続状態 -->
	<div class="mb-6 flex items-center gap-2">
		<span
			class="h-3 w-3 rounded-full {isConnected ? 'bg-green-500' : 'bg-red-500'}"
			aria-hidden="true"
		></span>
		<span class="text-sm text-muted-foreground">
			{isConnected ? 'サーバー接続中' : 'サーバー未接続'}
		</span>
		{#if !isConnected}
			<button onclick={connect} class="ml-2 text-sm text-primary hover:underline"> 再接続 </button>
		{/if}
	</div>

	<!-- 入力フォーム -->
	<div class="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-end">
			<div class="flex-1">
				<label for="host" class="mb-2 block text-sm font-medium">
					ホスト名 / <Term id="ip-address">IPアドレス</Term>
				</label>
				<input
					type="text"
					id="host"
					bind:value={host}
					placeholder="例: google.com, 8.8.8.8"
					disabled={isRunning}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
				/>
			</div>

			<div class="w-full sm:w-32">
				<label for="count" class="mb-2 block text-sm font-medium"> 回数 </label>
				<input
					type="number"
					id="count"
					bind:value={count}
					min="1"
					max="20"
					disabled={isRunning}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
				/>
			</div>

			<button
				onclick={executePing}
				disabled={!isConnected || isRunning}
				class="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
			>
				{isRunning ? '実行中...' : 'Ping 実行'}
			</button>
		</div>
	</div>

	<!-- エラー表示 -->
	{#if error}
		<div class="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500">
			{error}
		</div>
	{/if}

	<!-- 結果表示 -->
	{#if results.length > 0 || isRunning}
		<div class="rounded-lg border border-border bg-card">
			<div class="border-b border-border p-4">
				<h2 class="font-semibold">実行結果</h2>
			</div>

			<!-- 結果リスト -->
			<div class="max-h-80 overflow-y-auto p-4 font-mono text-sm">
				{#each results as result, i}
					<div class="mb-2 flex items-center gap-3">
						{#if result.success !== undefined}
							<span
								class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold {result.success
									? 'bg-green-500/20 text-green-500'
									: 'bg-red-500/20 text-red-500'}"
							>
								{result.seq ?? i + 1}
							</span>
						{/if}

						{#if result.success}
							<span class="text-muted-foreground">
								<Term id="ttl">TTL</Term>={result.ttl}
							</span>
							<span class={getTimeColor(result.time ?? 0)}>
								{result.time?.toFixed(2)} ms
							</span>
						{:else if result.success === false}
							<span class="text-red-500">タイムアウト</span>
						{:else}
							<span class="text-muted-foreground">{result.line}</span>
						{/if}
					</div>
				{/each}

				{#if isRunning}
					<div class="flex items-center gap-2 text-muted-foreground">
						<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
						<span>実行中...</span>
					</div>
				{/if}
			</div>

			<!-- 統計情報 -->
			{#if summary}
				<div class="border-t border-border bg-muted/50 p-4">
					<h3 class="mb-3 text-sm font-semibold">統計情報</h3>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
						<div>
							<div class="text-xs text-muted-foreground">送信</div>
							<div class="text-lg font-bold">{summary.transmitted}</div>
						</div>
						<div>
							<div class="text-xs text-muted-foreground">受信</div>
							<div class="text-lg font-bold">{summary.received}</div>
						</div>
						<div>
							<div class="text-xs text-muted-foreground">
								<Term id="packet-loss">パケットロス</Term>
							</div>
							<div
								class="text-lg font-bold {summary.lossPercent > 0 ? 'text-red-500' : 'text-green-500'}"
							>
								{summary.lossPercent}%
							</div>
						</div>
						<div>
							<div class="text-xs text-muted-foreground">平均RTT</div>
							<div class="text-lg font-bold">
								{summary.avgTime?.toFixed(2) ?? '-'} ms
							</div>
						</div>
					</div>

					{#if summary.minTime !== undefined && summary.maxTime !== undefined}
						<div class="mt-4 grid grid-cols-3 gap-4 text-center">
							<div class="rounded bg-background p-2">
								<div class="text-xs text-muted-foreground">最小</div>
								<div class="font-mono text-green-500">{summary.minTime.toFixed(2)} ms</div>
							</div>
							<div class="rounded bg-background p-2">
								<div class="text-xs text-muted-foreground">平均</div>
								<div class="font-mono text-yellow-500">{summary.avgTime?.toFixed(2)} ms</div>
							</div>
							<div class="rounded bg-background p-2">
								<div class="text-xs text-muted-foreground">最大</div>
								<div class="font-mono text-red-500">{summary.maxTime.toFixed(2)} ms</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- 学習ポイント -->
	<div class="mt-8 rounded-lg border border-dashed border-border bg-background p-4 sm:p-6">
		<h3 class="mb-3 text-sm font-semibold">💡 Pingについて学ぼう</h3>
		<div class="space-y-3 text-sm text-muted-foreground">
			<p>
				<strong>Ping</strong>は<Term id="icmp">ICMP</Term
				>（Internet Control Message Protocol）を使用してネットワークの到達性をテストするツールです。
			</p>
			<p>
				<Term id="rtt">RTT</Term>（Round Trip Time）は、パケットがホストに到達して戻ってくるまでの時間です。
				この値が大きいほどネットワーク遅延が大きいことを意味します。
			</p>
			<p>
				<Term id="ttl">TTL</Term>（Time To Live）は、パケットが通過できる<Term id="router"
					>ルーター</Term
				>の最大数です。
				各ルーターを通過するたびに1減少し、0になるとパケットは破棄されます。
			</p>
		</div>
	</div>
</div>

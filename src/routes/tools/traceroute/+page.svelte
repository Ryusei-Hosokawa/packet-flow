<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Term from '$lib/components/ui/Term.svelte';
	import PageLayout from '$lib/components/layout/PageLayout.svelte';

	// 状態管理
	let host = $state('google.com');
	let maxHops = $state(30);
	let isRunning = $state(false);
	let isConnected = $state(false);
	let hops = $state<TracerouteHop[]>([]);
	let headerLine = $state<string | null>(null);
	let error = $state<string | null>(null);
	let reachedDestination = $state(false);

	// WebSocket接続
	let ws: WebSocket | null = null;

	interface TracerouteHop {
		hop: number;
		host: string | null;
		ip: string | null;
		times: number[];
		timeout: boolean;
	}

	interface WSMessage {
		type: string;
		data?: TracerouteHop & {
			line?: string;
			error?: string;
			totalHops?: number;
			reachedDestination?: boolean;
		};
		message?: string;
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

	function handleMessage(msg: WSMessage) {
		switch (msg.type) {
			case 'connected':
				console.log('Server message:', msg.message);
				break;

			case 'traceroute-start':
				hops = [];
				headerLine = null;
				error = null;
				reachedDestination = false;
				isRunning = true;
				break;

			case 'traceroute-header':
				if (msg.data?.line) {
					headerLine = msg.data.line;
				}
				break;

			case 'traceroute-hop':
				if (msg.data) {
					hops = [...hops, msg.data as TracerouteHop];
				}
				break;

			case 'traceroute-complete':
				isRunning = false;
				if (msg.data?.reachedDestination) {
					reachedDestination = msg.data.reachedDestination;
				}
				break;

			case 'traceroute-error':
				isRunning = false;
				if (msg.data?.error) {
					error = msg.data.error;
				}
				break;
		}
	}

	function executeTraceroute() {
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			error = 'サーバーに接続されていません';
			return;
		}

		if (!host.trim()) {
			error = 'ホスト名を入力してください';
			return;
		}

		ws.send(
			JSON.stringify({
				type: 'traceroute',
				payload: {
					host: host.trim(),
					maxHops
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
		if (time < 20) return 'text-green-500';
		if (time < 50) return 'text-yellow-500';
		if (time < 100) return 'text-orange-500';
		return 'text-red-500';
	}

	// 平均RTTを計算
	function getAvgTime(times: number[]): number | null {
		if (times.length === 0) return null;
		return times.reduce((a, b) => a + b, 0) / times.length;
	}
</script>

<svelte:head>
	<title>Traceroute ツール - PacketFlow</title>
</svelte:head>

<PageLayout title="Traceroute ツール">
	{#snippet description()}
		<Term id="packet">パケット</Term>が宛先に到達するまでの経路（<Term id="hop">ホップ</Term
		>）を可視化します
	{/snippet}

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
				<label for="maxHops" class="mb-2 block text-sm font-medium"> 最大ホップ数 </label>
				<input
					type="number"
					id="maxHops"
					bind:value={maxHops}
					min="1"
					max="64"
					disabled={isRunning}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
				/>
			</div>

			<button
				onclick={executeTraceroute}
				disabled={!isConnected || isRunning}
				class="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
			>
				{isRunning ? '実行中...' : 'Traceroute 実行'}
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
	{#if hops.length > 0 || isRunning}
		<div class="rounded-lg border border-border bg-card">
			<div class="border-b border-border p-4">
				<h2 class="font-semibold">経路探索結果</h2>
				{#if headerLine}
					<p class="mt-1 font-mono text-xs text-muted-foreground">{headerLine}</p>
				{/if}
			</div>

			<!-- 経路の可視化 -->
			<div class="p-4">
				<div class="relative">
					<!-- 経路線 -->
					<div class="absolute left-6 top-0 h-full w-0.5 bg-border"></div>

					<!-- 各ホップ -->
					<div class="space-y-3">
						{#each hops as hop, i}
							<div class="relative flex items-start gap-4 pl-12">
								<!-- ホップ番号 -->
								<div
									class="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold {hop.timeout
										? 'bg-muted text-muted-foreground'
										: 'bg-primary/10 text-primary'}"
								>
									{hop.hop}
								</div>

								<!-- ホップ情報 -->
								<div
									class="flex-1 rounded-lg border border-border bg-background p-3 {hop.timeout
										? 'opacity-50'
										: ''}"
								>
									{#if hop.timeout}
										<div class="text-muted-foreground">
											<span class="font-mono">* * *</span>
											<span class="ml-2 text-sm">（応答なし）</span>
										</div>
									{:else}
										<div class="flex flex-wrap items-center gap-2">
											{#if hop.host}
												<span class="font-medium">{hop.host}</span>
											{/if}
											{#if hop.ip}
												<span class="font-mono text-sm text-muted-foreground">
													({hop.ip})
												</span>
											{/if}
										</div>

										<!-- RTT時間 -->
										{#if hop.times.length > 0}
											<div class="mt-2 flex flex-wrap gap-2">
												{#each hop.times as time, j}
													<span
														class="rounded bg-muted px-2 py-1 font-mono text-xs {getTimeColor(
															time
														)}"
													>
														{time.toFixed(2)} ms
													</span>
												{/each}
												{#if getAvgTime(hop.times)}
													<span class="ml-2 text-xs text-muted-foreground">
														平均: {getAvgTime(hop.times)?.toFixed(2)} ms
													</span>
												{/if}
											</div>
										{/if}
									{/if}
								</div>
							</div>
						{/each}

						{#if isRunning}
							<div class="relative flex items-center gap-4 pl-12">
								<div
									class="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-muted"
								>
									<span
										class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
									></span>
								</div>
								<div class="text-sm text-muted-foreground">経路を探索中...</div>
							</div>
						{/if}

						{#if !isRunning && hops.length > 0}
							<div class="relative flex items-center gap-4 pl-12">
								<div
									class="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full {reachedDestination
										? 'bg-green-500/20 text-green-500'
										: 'bg-yellow-500/20 text-yellow-500'}"
								>
									{reachedDestination ? '✓' : '?'}
								</div>
								<div class="text-sm font-medium">
									{reachedDestination
										? '宛先に到達しました'
										: '最大ホップ数に達しました（宛先未到達）'}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- 統計情報 -->
			{#if !isRunning && hops.length > 0}
				<div class="border-t border-border bg-muted/50 p-4">
					<h3 class="mb-3 text-sm font-semibold">統計情報</h3>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
						<div>
							<div class="text-xs text-muted-foreground">総ホップ数</div>
							<div class="text-lg font-bold">{hops.length}</div>
						</div>
						<div>
							<div class="text-xs text-muted-foreground">応答あり</div>
							<div class="text-lg font-bold text-green-500">
								{hops.filter((h) => !h.timeout).length}
							</div>
						</div>
						<div>
							<div class="text-xs text-muted-foreground">タイムアウト</div>
							<div class="text-lg font-bold text-red-500">
								{hops.filter((h) => h.timeout).length}
							</div>
						</div>
						<div>
							<div class="text-xs text-muted-foreground">平均RTT</div>
							<div class="text-lg font-bold">
								{#if hops.filter((h) => h.times.length > 0).length > 0}
									{(
										hops
											.filter((h) => h.times.length > 0)
											.flatMap((h) => h.times)
											.reduce((a, b) => a + b, 0) /
										hops.filter((h) => h.times.length > 0).flatMap((h) => h.times).length
									).toFixed(2)} ms
								{:else}
									-
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- 学習ポイント -->
	<div class="mt-8 rounded-lg border border-dashed border-border bg-background p-4 sm:p-6">
		<h3 class="mb-3 text-sm font-semibold">💡 Tracerouteについて学ぼう</h3>
		<div class="space-y-3 text-sm text-muted-foreground">
			<p>
				<strong>Traceroute</strong>は、<Term id="ttl">TTL</Term
				>（Time To Live）を利用してパケットの経路を調べるツールです。
			</p>
			<p>
				TTLを1から順に増やしながら<Term id="icmp">ICMP</Term
				>パケットを送信します。各<Term id="router">ルーター</Term
				>でTTLが0になるとパケットが破棄され、「Time Exceeded」メッセージが返されます。これにより経路上の各ルーターのアドレスがわかります。
			</p>
			<p>
				<Term id="hop">ホップ</Term
				>数が多いほど、パケットは多くのルーターを経由しています。タイムアウト（* *
				*）は、そのルーターがICMPに応答しない設定になっている可能性があります。
			</p>
		</div>
	</div>
</PageLayout>

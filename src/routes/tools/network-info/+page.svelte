<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Term from '$lib/components/ui/Term.svelte';
	import PageLayout from '$lib/components/layout/PageLayout.svelte';

	// 状態管理
	let isRunning = $state(false);
	let isConnected = $state(false);
	let info = $state<NetworkInfo | null>(null);
	let error = $state<string | null>(null);

	// WebSocket接続
	let ws: WebSocket | null = null;

	interface NetworkInterface {
		name: string;
		mac: string;
		ipv4?: string;
		ipv4Netmask?: string;
		ipv6?: string;
		ipv6Netmask?: string;
		internal: boolean;
	}

	interface NetworkInfo {
		hostname: string;
		interfaces: NetworkInterface[];
		defaultGateway?: string;
		publicIP?: string;
		dnsServers?: string[];
	}

	interface WSMessage {
		type: string;
		data?: NetworkInfo & {
			error?: string;
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

			case 'network-info-start':
				info = null;
				error = null;
				isRunning = true;
				break;

			case 'network-info-complete':
				isRunning = false;
				if (msg.data) {
					info = msg.data as NetworkInfo;
				}
				break;

			case 'network-info-error':
				isRunning = false;
				if (msg.data?.error) {
					error = msg.data.error;
				}
				break;
		}
	}

	function fetchNetworkInfo() {
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			error = 'サーバーに接続されていません';
			return;
		}

		ws.send(
			JSON.stringify({
				type: 'network-info'
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

	// 外部インターフェースのみをフィルタ
	const externalInterfaces = $derived(info?.interfaces.filter((i) => !i.internal) ?? []);
	const internalInterfaces = $derived(info?.interfaces.filter((i) => i.internal) ?? []);
</script>

<svelte:head>
	<title>Network Info - PacketFlow</title>
</svelte:head>

<PageLayout title="Network Info">
	{#snippet description()}
		このマシンの<Term id="ip-address">IPアドレス</Term>やネットワーク設定を表示します
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

	<!-- 取得ボタン -->
	<div class="mb-6">
		<button
			onclick={fetchNetworkInfo}
			disabled={!isConnected || isRunning}
			class="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
		>
			{isRunning ? '取得中...' : 'ネットワーク情報を取得'}
		</button>
	</div>

	<!-- エラー表示 -->
	{#if error}
		<div class="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500">
			{error}
		</div>
	{/if}

	<!-- 結果表示 -->
	{#if info}
		<div class="space-y-6">
			<!-- 基本情報 -->
			<div class="rounded-lg border border-border bg-card">
				<div class="border-b border-border p-4">
					<h2 class="font-semibold">基本情報</h2>
				</div>
				<div class="grid gap-4 p-4 sm:grid-cols-2">
					<div class="rounded-lg bg-muted p-4">
						<div class="text-xs text-muted-foreground">ホスト名</div>
						<div class="mt-1 font-mono text-lg font-bold">{info.hostname}</div>
					</div>
					{#if info.publicIP}
						<div class="rounded-lg bg-muted p-4">
							<div class="text-xs text-muted-foreground">パブリックIP</div>
							<div class="mt-1 font-mono text-lg font-bold">{info.publicIP}</div>
						</div>
					{/if}
					{#if info.defaultGateway}
						<div class="rounded-lg bg-muted p-4">
							<div class="text-xs text-muted-foreground">
								デフォルト<Term id="gateway">ゲートウェイ</Term>
							</div>
							<div class="mt-1 font-mono text-lg font-bold">{info.defaultGateway}</div>
						</div>
					{/if}
					{#if info.dnsServers && info.dnsServers.length > 0}
						<div class="rounded-lg bg-muted p-4">
							<div class="text-xs text-muted-foreground"><Term id="dns">DNS</Term>サーバー</div>
							<div class="mt-1 space-y-1">
								{#each info.dnsServers as dns}
									<div class="font-mono">{dns}</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- 外部インターフェース -->
			{#if externalInterfaces.length > 0}
				<div class="rounded-lg border border-border bg-card">
					<div class="border-b border-border p-4">
						<h2 class="font-semibold">ネットワークインターフェース</h2>
					</div>
					<div class="divide-y divide-border">
						{#each externalInterfaces as iface}
							<div class="p-4">
								<div class="mb-3 flex items-center gap-2">
									<span class="rounded bg-primary/20 px-2 py-1 text-xs font-bold text-primary">
										{iface.name}
									</span>
									{#if iface.mac}
										<span class="font-mono text-xs text-muted-foreground">
											<Term id="mac-address">MAC</Term>: {iface.mac}
										</span>
									{/if}
								</div>
								<div class="grid gap-3 sm:grid-cols-2">
									{#if iface.ipv4}
										<div class="rounded bg-muted p-3">
											<div class="text-xs text-muted-foreground">IPv4</div>
											<div class="font-mono">{iface.ipv4}</div>
											{#if iface.ipv4Netmask}
												<div class="mt-1 text-xs text-muted-foreground">
													<Term id="subnet-mask">サブネット</Term>: {iface.ipv4Netmask}
												</div>
											{/if}
										</div>
									{/if}
									{#if iface.ipv6}
										<div class="rounded bg-muted p-3">
											<div class="text-xs text-muted-foreground">IPv6</div>
											<div class="break-all font-mono text-sm">{iface.ipv6}</div>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- 内部インターフェース（折りたたみ） -->
			{#if internalInterfaces.length > 0}
				<details class="rounded-lg border border-border bg-card">
					<summary class="cursor-pointer p-4 font-semibold">
						内部インターフェース（{internalInterfaces.length}件）
					</summary>
					<div class="divide-y divide-border border-t border-border">
						{#each internalInterfaces as iface}
							<div class="p-4">
								<div class="mb-2 flex items-center gap-2">
									<span class="rounded bg-muted px-2 py-1 text-xs font-bold">
										{iface.name}
									</span>
								</div>
								<div class="text-sm text-muted-foreground">
									{#if iface.ipv4}
										<span class="font-mono">{iface.ipv4}</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</details>
			{/if}
		</div>
	{/if}

	<!-- 学習ポイント -->
	<div class="mt-8 rounded-lg border border-dashed border-border bg-background p-4 sm:p-6">
		<h3 class="mb-3 text-sm font-semibold">💡 ネットワーク設定について学ぼう</h3>
		<div class="space-y-3 text-sm text-muted-foreground">
			<p>
				<strong><Term id="ip-address">IPアドレス</Term></strong
				>は、ネットワーク上の各機器を識別するための番号です。IPv4は32ビット、IPv6は128ビットで表されます。
			</p>
			<p>
				<strong><Term id="mac-address">MACアドレス</Term></strong
				>は、ネットワークカードに固有の物理アドレスです。同一ネットワーク内での通信に使用されます。
			</p>
			<p>
				<strong><Term id="gateway">デフォルトゲートウェイ</Term></strong
				>は、外部ネットワークへの出口となる<Term id="router">ルーター</Term
				>のアドレスです。宛先が同一ネットワーク外の場合、パケットはまずここに送られます。
			</p>
			<p>
				<strong><Term id="subnet-mask">サブネットマスク</Term></strong
				>は、IPアドレスのうちネットワーク部とホスト部を区別するための値です。
			</p>
		</div>
	</div>
</PageLayout>

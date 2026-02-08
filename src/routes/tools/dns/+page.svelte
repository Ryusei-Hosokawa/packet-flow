<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Term from '$lib/components/ui/Term.svelte';
	import PageLayout from '$lib/components/layout/PageLayout.svelte';

	// 状態管理
	let domain = $state('google.com');
	let recordType = $state('A');
	let isRunning = $state(false);
	let isConnected = $state(false);
	let result = $state<DNSResult | null>(null);
	let error = $state<string | null>(null);

	// WebSocket接続
	let ws: WebSocket | null = null;

	interface DNSRecord {
		type: string;
		value: string;
		ttl?: number;
		priority?: number;
	}

	interface DNSResult {
		domain: string;
		recordType: string;
		records: DNSRecord[];
		nameServers?: string[];
		queryTime?: number;
		tool?: string;
	}

	interface WSMessage {
		type: string;
		data?: DNSResult & {
			error?: string;
		};
		message?: string;
	}

	const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT'];

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

			case 'dns-start':
				result = null;
				error = null;
				isRunning = true;
				break;

			case 'dns-complete':
				isRunning = false;
				if (msg.data) {
					result = msg.data as DNSResult;
				}
				break;

			case 'dns-error':
				isRunning = false;
				if (msg.data?.error) {
					error = msg.data.error;
				}
				break;
		}
	}

	function executeDNS() {
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			error = 'サーバーに接続されていません';
			return;
		}

		if (!domain.trim()) {
			error = 'ドメイン名を入力してください';
			return;
		}

		ws.send(
			JSON.stringify({
				type: 'dns',
				payload: {
					domain: domain.trim(),
					recordType
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

	// レコードタイプに応じた色
	function getRecordColor(type: string): string {
		const colors: Record<string, string> = {
			A: 'bg-blue-500/20 text-blue-500',
			AAAA: 'bg-purple-500/20 text-purple-500',
			CNAME: 'bg-green-500/20 text-green-500',
			MX: 'bg-orange-500/20 text-orange-500',
			NS: 'bg-cyan-500/20 text-cyan-500',
			TXT: 'bg-yellow-500/20 text-yellow-500'
		};
		return colors[type] || 'bg-muted text-muted-foreground';
	}

	// レコードタイプの説明
	function getRecordDescription(type: string): string {
		const descriptions: Record<string, string> = {
			A: 'IPv4アドレス',
			AAAA: 'IPv6アドレス',
			CNAME: '別名（エイリアス）',
			MX: 'メールサーバー',
			NS: 'ネームサーバー',
			TXT: 'テキスト情報'
		};
		return descriptions[type] || type;
	}
</script>

<svelte:head>
	<title>DNS Lookup - PacketFlow</title>
</svelte:head>

<PageLayout title="DNS Lookup">
	{#snippet description()}
		<Term id="dns">DNS</Term>を使用してドメイン名から<Term id="ip-address">IPアドレス</Term
		>などの情報を取得します
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
				<label for="domain" class="mb-2 block text-sm font-medium"> ドメイン名 </label>
				<input
					type="text"
					id="domain"
					bind:value={domain}
					placeholder="例: google.com, example.org"
					disabled={isRunning}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
				/>
			</div>

			<div class="w-full sm:w-40">
				<label for="recordType" class="mb-2 block text-sm font-medium"> レコードタイプ </label>
				<select
					id="recordType"
					bind:value={recordType}
					disabled={isRunning}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
				>
					{#each recordTypes as type}
						<option value={type}>{type} - {getRecordDescription(type)}</option>
					{/each}
				</select>
			</div>

			<button
				onclick={executeDNS}
				disabled={!isConnected || isRunning}
				class="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
			>
				{isRunning ? '検索中...' : 'DNS 検索'}
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
	{#if result}
		<div class="rounded-lg border border-border bg-card">
			<div class="border-b border-border p-4">
				<h2 class="font-semibold">検索結果: {result.domain}</h2>
				<p class="mt-1 text-xs text-muted-foreground">
					使用ツール: {result.tool || 'nslookup'}
					{#if result.queryTime}
						| クエリ時間: {result.queryTime}ms
					{/if}
				</p>
			</div>

			<!-- レコード一覧 -->
			<div class="p-4">
				{#if result.records.length === 0}
					<p class="text-muted-foreground">レコードが見つかりませんでした</p>
				{:else}
					<div class="space-y-3">
						{#each result.records as record}
							<div class="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
								<span class="rounded px-2 py-1 text-xs font-bold {getRecordColor(record.type)}">
									{record.type}
								</span>
								<div class="flex-1">
									<p class="font-mono text-sm">{record.value}</p>
									<div class="mt-1 flex gap-3 text-xs text-muted-foreground">
										{#if record.ttl !== undefined}
											<span><Term id="ttl">TTL</Term>: {record.ttl}秒</span>
										{/if}
										{#if record.priority !== undefined}
											<span>優先度: {record.priority}</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- ネームサーバー -->
			{#if result.nameServers && result.nameServers.length > 0}
				<div class="border-t border-border bg-muted/50 p-4">
					<h3 class="mb-2 text-sm font-semibold">使用したネームサーバー</h3>
					<div class="flex flex-wrap gap-2">
						{#each result.nameServers as ns}
							<span class="rounded bg-muted px-2 py-1 font-mono text-xs">{ns}</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- 学習ポイント -->
	<div class="mt-8 rounded-lg border border-dashed border-border bg-background p-4 sm:p-6">
		<h3 class="mb-3 text-sm font-semibold">💡 DNSについて学ぼう</h3>
		<div class="space-y-3 text-sm text-muted-foreground">
			<p>
				<strong><Term id="dns">DNS</Term></strong>（Domain Name
				System）は、ドメイン名をIPアドレスに変換する「インターネットの電話帳」です。
			</p>
			<div class="grid gap-2 sm:grid-cols-2">
				<div class="rounded bg-muted p-2">
					<strong>Aレコード</strong>: ドメイン → IPv4アドレス
				</div>
				<div class="rounded bg-muted p-2">
					<strong>AAAAレコード</strong>: ドメイン → IPv6アドレス
				</div>
				<div class="rounded bg-muted p-2">
					<strong>CNAMEレコード</strong>: ドメインの別名（エイリアス）
				</div>
				<div class="rounded bg-muted p-2">
					<strong>MXレコード</strong>: メールサーバーのアドレス
				</div>
				<div class="rounded bg-muted p-2">
					<strong>NSレコード</strong>: 権威ネームサーバー
				</div>
				<div class="rounded bg-muted p-2">
					<strong>TXTレコード</strong>: 任意のテキスト情報
				</div>
			</div>
			<p>
				<Term id="ttl">TTL</Term
				>（Time To Live）は、DNSレコードがキャッシュされる時間を秒単位で示します。
			</p>
		</div>
	</div>
</PageLayout>

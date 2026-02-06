<script lang="ts">
	const topics = [
		{
			title: '3-Way Handshake',
			titleJa: '3ウェイハンドシェイク',
			description: 'TCP接続確立の過程をステップバイステップのアニメーションで学ぶ',
			href: '/handshake'
		},
		{
			title: 'OSI / TCP-IP Model',
			titleJa: 'OSI/TCP-IPモデル',
			description: '7層と4層のネットワークモデルを比較しながら理解する',
			href: '/osi-model'
		},
		{
			title: 'Packet Structure',
			titleJa: 'パケット構造',
			description: 'IP/TCP/UDPヘッダの各フィールドをインタラクティブに図解',
			href: '/packet-structure'
		},
		{
			title: 'Encapsulation',
			titleJa: 'カプセル化',
			description: 'データが各層でヘッダを付与される過程をアニメーションで可視化',
			href: '/encapsulation'
		},
		{
			title: 'TCP vs UDP',
			titleJa: 'TCP vs UDP比較',
			description: '2つのトランスポート層プロトコルの違いとユースケースを比較',
			href: '/tcp-vs-udp'
		}
	];
</script>

<svelte:head>
	<title>PacketFlow - TCP/IPプロトコル可視化ツール</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
	<!-- ヒーローセクション -->
	<section class="py-8 text-center sm:py-12 md:py-16">
		<h1 class="mb-2 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
			PacketFlow
		</h1>
		<p class="mb-3 text-lg text-muted-foreground sm:text-xl">
			TCP/IPプロトコルをインタラクティブに学ぶ
		</p>
		<p class="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
			ネットワーク通信の仕組みを、アニメーションと図解で直感的に理解できる学習ツールです。
		</p>
	</section>

	<!-- トピックグリッド -->
	<section class="mb-12">
		<h2 class="mb-1 text-xl font-semibold sm:text-2xl">Learning Topics</h2>
		<p class="mb-6 text-sm text-muted-foreground">Phase 1: フロントエンド教育コンテンツ</p>

		<div class="flex flex-col gap-3">
			{#each topics as topic, index}
				<a
					href={topic.href}
					class="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:translate-x-1 hover:border-foreground sm:gap-4 sm:p-5"
				>
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground group-hover:bg-foreground group-hover:text-background sm:h-10 sm:w-10 sm:text-base transition-all duration-200"
					>
						{index + 1}
					</div>
					<div class="min-w-0 flex-1">
						<h3 class="text-base font-semibold text-foreground sm:text-lg">{topic.title}</h3>
						<p class="text-xs text-muted-foreground">{topic.titleJa}</p>
						<p class="mt-1 text-sm leading-snug text-muted-foreground">{topic.description}</p>
					</div>
					<div
						class="shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-foreground"
					>
						<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 10h10M11 6l4 4-4 4" />
						</svg>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- フッター -->
	<footer class="border-t border-border pt-8 text-center text-sm text-muted-foreground">
		<p>Built for learning TCP/IP protocols</p>
	</footer>
</div>

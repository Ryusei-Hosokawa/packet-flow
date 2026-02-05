<script lang="ts">
	const topics = [
		{
			title: '3-Way Handshake',
			description: 'TCP接続確立の3ウェイハンドシェイクをアニメーションで学ぶ',
			href: '/handshake',
			phase: 1
		},
		{
			title: 'Packet Structure',
			description: 'IP/TCP/UDPヘッダの構造をインタラクティブに図解',
			href: '/packet-structure',
			phase: 1
		},
		{
			title: 'OSI Model',
			description: 'OSI参照モデルとTCP/IPモデルの対比図解',
			href: '/osi-model',
			phase: 1
		},
		{
			title: 'TCP vs UDP',
			description: 'TCPとUDPの違いを比較デモで理解する',
			href: '/tcp-vs-udp',
			phase: 1
		}
	];
</script>

<div class="min-h-screen">
	<header class="border-b border-border py-8">
		<div class="mx-auto max-w-5xl px-6">
			<h1 class="text-4xl font-bold tracking-tight">PacketFlow</h1>
			<p class="mt-2 text-lg text-muted-foreground">
				TCP/IPプロトコルのインタラクティブ可視化ツール
			</p>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-6 py-12">
		<h2 class="mb-8 text-2xl font-semibold">Learning Topics</h2>
		<div class="grid gap-6 sm:grid-cols-2">
			{#each topics as topic}
				<a
					href={topic.href}
					class="group rounded-lg border border-border p-6 transition-colors hover:border-primary hover:bg-accent"
				>
					<h3 class="text-xl font-semibold group-hover:text-primary">
						{topic.title}
					</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						{topic.description}
					</p>
					<span class="mt-3 inline-block text-xs text-muted-foreground">
						Phase {topic.phase}
					</span>
				</a>
			{/each}
		</div>
	</main>
</div>

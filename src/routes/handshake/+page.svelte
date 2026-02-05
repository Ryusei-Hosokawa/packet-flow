<script lang="ts">
	import HandshakeAnimation from '$lib/components/visualizations/handshake/HandshakeAnimation.svelte';
</script>

<svelte:head>
	<title>3-Way Handshake | PacketFlow</title>
</svelte:head>

<div class="min-h-screen">
	<header class="border-b border-border py-8">
		<div class="mx-auto max-w-5xl px-6">
			<nav class="mb-4">
				<a href="/" class="text-sm text-muted-foreground hover:text-foreground">
					← Back to Home
				</a>
			</nav>
			<h1 class="text-4xl font-bold tracking-tight">3-Way Handshake</h1>
			<p class="mt-2 text-lg text-muted-foreground">
				TCP接続確立の3ウェイハンドシェイクをアニメーションで学ぶ
			</p>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-6 py-12">
		<HandshakeAnimation />
	</main>
</div>

<script lang="ts">
	import OSIModelVisualization from '$lib/components/visualizations/osi-model/OSIModelVisualization.svelte';
</script>

<svelte:head>
	<title>OSI / TCP-IP Model | PacketFlow</title>
</svelte:head>

<div class="min-h-screen">
	<header class="border-b border-border py-8">
		<div class="mx-auto max-w-5xl px-6">
			<nav class="mb-4">
				<a href="/" class="text-sm text-muted-foreground hover:text-foreground"> ← Back to Home </a>
			</nav>
			<h1 class="text-4xl font-bold tracking-tight">OSI / TCP-IP Model</h1>
			<p class="mt-2 text-lg text-muted-foreground">
				ネットワーク通信の階層モデルをインタラクティブに学ぶ
			</p>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-6 py-12">
		<OSIModelVisualization />
	</main>
</div>

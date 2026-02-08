<script lang="ts">
	import OSIModelVisualization from '$lib/components/visualizations/osi-model/OSIModelVisualization.svelte';
	import PageLayout from '$lib/components/layout/PageLayout.svelte';
</script>

<svelte:head>
	<title>OSI / TCP-IP Model | PacketFlow</title>
</svelte:head>

<PageLayout title="OSI / TCP-IP Model">
	{#snippet description()}
		ネットワーク通信の階層モデルをインタラクティブに学ぶ
	{/snippet}
	<OSIModelVisualization />
</PageLayout>

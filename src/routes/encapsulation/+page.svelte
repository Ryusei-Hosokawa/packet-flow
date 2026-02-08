<script lang="ts">
	import EncapsulationVisualization from '$lib/components/visualizations/encapsulation/EncapsulationVisualization.svelte';
	import PageLayout from '$lib/components/layout/PageLayout.svelte';
</script>

<svelte:head>
	<title>Encapsulation | PacketFlow</title>
</svelte:head>

<PageLayout title="Encapsulation">
	{#snippet description()}
		データが各層でヘッダを付与される過程をアニメーションで学ぶ
	{/snippet}
	<EncapsulationVisualization />
</PageLayout>

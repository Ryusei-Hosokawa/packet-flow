<script lang="ts">
	import ComparisonVisualization from '$lib/components/visualizations/comparison/ComparisonVisualization.svelte';
	import PageLayout from '$lib/components/layout/PageLayout.svelte';
</script>

<svelte:head>
	<title>TCP vs UDP | PacketFlow</title>
</svelte:head>

<PageLayout
	title="TCP vs UDP"
	subtitle="2つのトランスポート層プロトコルの違いを比較して学ぶ"
>
	<ComparisonVisualization />
</PageLayout>

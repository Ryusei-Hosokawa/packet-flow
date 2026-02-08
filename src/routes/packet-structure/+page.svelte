<script lang="ts">
	import PacketStructure from '$lib/components/visualizations/packet/PacketStructure.svelte';
	import PageLayout from '$lib/components/layout/PageLayout.svelte';
</script>

<svelte:head>
	<title>Packet Structure | PacketFlow</title>
</svelte:head>

<PageLayout title="Packet Structure">
	{#snippet description()}
		IP/TCP/UDPヘッダの構造をインタラクティブに学ぶ
	{/snippet}
	<PacketStructure />
</PageLayout>

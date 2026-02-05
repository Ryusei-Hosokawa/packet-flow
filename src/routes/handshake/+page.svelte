<script lang="ts">
	import HandshakeAnimation from '$lib/components/visualizations/handshake/HandshakeAnimation.svelte';
	import PageLayout from '$lib/components/layout/PageLayout.svelte';
</script>

<svelte:head>
	<title>3-Way Handshake | PacketFlow</title>
</svelte:head>

<PageLayout title="3-Way Handshake" subtitle="TCP接続確立の3ウェイハンドシェイクをアニメーションで学ぶ">
	<HandshakeAnimation />
</PageLayout>

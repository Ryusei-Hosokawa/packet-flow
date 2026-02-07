<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/layout/Navigation.svelte';
	import { themeStore } from '$lib/stores/themeStore.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		themeStore.initialize();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative flex max-w-6xl px-6 mx-auto min-h-screen flex-col">
	<Navigation />
	<div class="flex-1">
		{@render children()}
	</div>
</div>

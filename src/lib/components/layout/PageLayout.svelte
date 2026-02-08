<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description: Snippet;
		children: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<div class="py-8">
	<h1 class="mb-2 text-2xl font-bold sm:text-3xl">{title}</h1>
	<p class="mb-6 text-muted-foreground">
		{@render description()}
	</p>
	{@render children()}
</div>

<script lang="ts">
	interface Props {
		title: string;
		subtitle: string;
	}

	let { title, subtitle, children } = $props<Props & { children: any }>();
</script>

<div class="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
	<header class="mb-8 border-b border-border py-6 sm:py-8">
		<h1 class="mb-2 text-2xl font-bold sm:text-3xl">{title}</h1>
		<p class="text-sm text-muted-foreground sm:text-base">{subtitle}</p>
	</header>

	<main>
		{@render children()}
	</main>
</div>

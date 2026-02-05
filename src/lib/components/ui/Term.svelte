<script lang="ts">
	import { getTerm, getRelatedTerms, type GlossaryTerm } from '$lib/data/glossary';

	interface Props {
		/** 用語のキー（glossary.tsで定義されたキー） */
		id: string;
		/** 表示テキスト（省略時は用語名を使用） */
		children?: any;
	}

	let { id, children }: Props = $props();

	const term = $derived(getTerm(id));
	const relatedTerms = $derived(getRelatedTerms(id));

	let isOpen = $state(false);
	let popoverRef = $state<HTMLDivElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);

	function toggle() {
		isOpen = !isOpen;
	}

	function close() {
		isOpen = false;
	}

	// クリック外で閉じる
	function handleClickOutside(event: MouseEvent) {
		if (
			popoverRef &&
			triggerRef &&
			!popoverRef.contains(event.target as Node) &&
			!triggerRef.contains(event.target as Node)
		) {
			close();
		}
	}

	// Escキーで閉じる
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeydown);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if term}
	<span class="relative inline-block">
		<button
			bind:this={triggerRef}
			type="button"
			onclick={toggle}
			class="cursor-help border-b border-dashed border-primary/50 text-primary transition-colors hover:border-primary hover:text-primary/80"
			aria-expanded={isOpen}
			aria-haspopup="dialog"
		>
			{#if children}
				{@render children()}
			{:else}
				{term.termJa ?? term.term}
			{/if}
		</button>

		{#if isOpen}
			<div
				bind:this={popoverRef}
				role="dialog"
				aria-labelledby="term-title-{id}"
				class="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-lg border border-border bg-popover p-4 shadow-lg sm:w-80"
			>
				<!-- 矢印 -->
				<div
					class="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-border bg-popover"
				></div>

				<!-- ヘッダー -->
				<div class="mb-2 flex items-start justify-between gap-2">
					<div>
						<h4 id="term-title-{id}" class="font-semibold text-foreground">
							{term.termJa ?? term.term}
						</h4>
						{#if term.fullName}
							<p class="text-xs text-muted-foreground">{term.fullName}</p>
						{/if}
					</div>
					<button
						type="button"
						onclick={close}
						class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						aria-label="閉じる"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- 短い説明 -->
				<p class="mb-3 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
					{term.short}
				</p>

				<!-- 詳細説明 -->
				<p class="text-sm leading-relaxed text-foreground">
					{term.description}
				</p>

				<!-- 関連用語 -->
				{#if relatedTerms.length > 0}
					<div class="mt-3 border-t border-border pt-3">
						<p class="mb-1.5 text-xs font-medium text-muted-foreground">関連用語:</p>
						<div class="flex flex-wrap gap-1.5">
							{#each relatedTerms as related}
								<span class="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
									{related.termJa ?? related.term}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</span>
{:else}
	<!-- 用語が見つからない場合はそのまま表示 -->
	{#if children}
		{@render children()}
	{:else}
		{id}
	{/if}
{/if}

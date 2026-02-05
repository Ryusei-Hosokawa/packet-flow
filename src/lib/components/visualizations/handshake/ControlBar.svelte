<script lang="ts">
	import { handshakeStore } from '$lib/stores/handshakeStore.svelte';

	const speeds = [0.5, 1, 2] as const;
</script>

<div class="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-border bg-card p-3 sm:gap-4 sm:p-4">
	<!-- 再生/一時停止 -->
	<button
		onclick={() => handshakeStore.togglePlay()}
		class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-primary text-primary-foreground transition-colors hover:opacity-90"
		aria-label={handshakeStore.isPlaying ? '一時停止' : '再生'}
	>
		{#if handshakeStore.isPlaying}
			<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<rect x="6" y="4" width="4" height="16" />
				<rect x="14" y="4" width="4" height="16" />
			</svg>
		{:else}
			<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
				<polygon points="5,3 19,12 5,21" />
			</svg>
		{/if}
	</button>

	<!-- ステップ戻る -->
	<button
		onclick={() => handshakeStore.prev()}
		disabled={!handshakeStore.canGoPrev()}
		class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
		aria-label="前のステップ"
	>
		<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<polyline points="15,18 9,12 15,6" />
		</svg>
	</button>

	<!-- ステップ進む -->
	<button
		onclick={() => handshakeStore.next()}
		disabled={!handshakeStore.canGoNext()}
		class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
		aria-label="次のステップ"
	>
		<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<polyline points="9,6 15,12 9,18" />
		</svg>
	</button>

	<!-- リセット -->
	<button
		onclick={() => handshakeStore.reset()}
		class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted"
		aria-label="リセット"
	>
		<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<polyline points="1,4 1,10 7,10" />
			<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
		</svg>
	</button>

	<!-- 区切り線 -->
	<div class="hidden h-8 w-px bg-border sm:block"></div>

	<!-- 速度選択 -->
	<div class="flex items-center gap-2">
		<span class="hidden text-sm text-muted-foreground sm:inline">速度:</span>
		{#each speeds as s}
			<button
				onclick={() => handshakeStore.setSpeed(s)}
				class="cursor-pointer rounded border-none px-2 py-1 text-sm transition-colors {handshakeStore.speed ===
				s
					? 'bg-primary text-primary-foreground'
					: 'bg-muted text-muted-foreground hover:bg-accent'}"
			>
				{s}x
			</button>
		{/each}
	</div>

	<!-- 区切り線 -->
	<div class="hidden h-8 w-px bg-border sm:block"></div>

	<!-- ステップ表示 -->
	<span class="text-sm text-muted-foreground">
		Step {handshakeStore.stepIndex + 1} / {handshakeStore.totalSteps}
	</span>
</div>

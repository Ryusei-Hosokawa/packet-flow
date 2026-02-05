<script lang="ts">
	import { handshakeStore } from '$lib/stores/handshakeStore.svelte';

	const speeds = [0.5, 1, 2] as const;
</script>

<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 1rem; padding: 1rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--card);">
	<!-- 再生/一時停止 -->
	<button
		onclick={() => handshakeStore.togglePlay()}
		style="display: flex; width: 2.5rem; height: 2.5rem; align-items: center; justify-content: center; border-radius: 9999px; background: var(--primary); color: var(--primary-foreground); border: none; cursor: pointer;"
		aria-label={handshakeStore.isPlaying ? '一時停止' : '再生'}
	>
		{#if handshakeStore.isPlaying}
			<svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24">
				<rect x="6" y="4" width="4" height="16" />
				<rect x="14" y="4" width="4" height="16" />
			</svg>
		{:else}
			<svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24">
				<polygon points="5,3 19,12 5,21" />
			</svg>
		{/if}
	</button>

	<!-- ステップ戻る -->
	<button
		onclick={() => handshakeStore.prev()}
		disabled={!handshakeStore.canGoPrev()}
		style="display: flex; width: 2.5rem; height: 2.5rem; align-items: center; justify-content: center; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--background); cursor: pointer;"
		class="disabled:opacity-50 disabled:cursor-not-allowed"
		aria-label="前のステップ"
	>
		<svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<polyline points="15,18 9,12 15,6" />
		</svg>
	</button>

	<!-- ステップ進む -->
	<button
		onclick={() => handshakeStore.next()}
		disabled={!handshakeStore.canGoNext()}
		style="display: flex; width: 2.5rem; height: 2.5rem; align-items: center; justify-content: center; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--background); cursor: pointer;"
		class="disabled:opacity-50 disabled:cursor-not-allowed"
		aria-label="次のステップ"
	>
		<svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<polyline points="9,6 15,12 9,18" />
		</svg>
	</button>

	<!-- リセット -->
	<button
		onclick={() => handshakeStore.reset()}
		style="display: flex; width: 2.5rem; height: 2.5rem; align-items: center; justify-content: center; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--background); cursor: pointer;"
		aria-label="リセット"
	>
		<svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<polyline points="1,4 1,10 7,10" />
			<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
		</svg>
	</button>

	<!-- 区切り線 -->
	<div style="width: 1px; height: 2rem; background: var(--border);"></div>

	<!-- 速度選択 -->
	<div style="display: flex; align-items: center; gap: 0.5rem;">
		<span style="font-size: 0.875rem; color: var(--muted-foreground);">速度:</span>
		{#each speeds as s}
			<button
				onclick={() => handshakeStore.setSpeed(s)}
				style="padding: 0.25rem 0.5rem; font-size: 0.875rem; border-radius: 0.25rem; border: none; cursor: pointer; background: {handshakeStore.speed === s ? 'var(--primary)' : 'var(--muted)'}; color: {handshakeStore.speed === s ? 'var(--primary-foreground)' : 'var(--muted-foreground)'};"
			>
				{s}x
			</button>
		{/each}
	</div>

	<!-- ステップ表示 -->
	<div style="width: 1px; height: 2rem; background: var(--border);"></div>
	<span style="font-size: 0.875rem; color: var(--muted-foreground);">
		Step {handshakeStore.stepIndex + 1} / {handshakeStore.totalSteps}
	</span>
</div>

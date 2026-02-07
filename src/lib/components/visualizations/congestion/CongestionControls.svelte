<script lang="ts">
	import { congestionStore } from '$lib/stores/congestionStore.svelte';

	// 再生/一時停止アイコン
	const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" /></svg>`;
	const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" /></svg>`;
	const resetIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clip-rule="evenodd" /></svg>`;
	const prevIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" /></svg>`;
	const nextIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" /></svg>`;

	type Scenario = 'normal' | 'loss' | 'timeout';
	let selectedScenario = $state<Scenario>('loss');

	function handleScenarioChange(scenario: Scenario) {
		selectedScenario = scenario;
		congestionStore.setScenario(scenario);
	}
</script>

<div class="space-y-4">
	<!-- シナリオ選択 -->
	<div class="flex flex-wrap gap-2">
		<span class="text-sm font-medium text-muted-foreground">シナリオ:</span>
		<button
			onclick={() => handleScenarioChange('normal')}
			class="rounded-md px-3 py-1 text-sm transition-colors {selectedScenario === 'normal'
				? 'bg-primary text-primary-foreground'
				: 'bg-muted hover:bg-muted/80'}"
		>
			通常
		</button>
		<button
			onclick={() => handleScenarioChange('loss')}
			class="rounded-md px-3 py-1 text-sm transition-colors {selectedScenario === 'loss'
				? 'bg-primary text-primary-foreground'
				: 'bg-muted hover:bg-muted/80'}"
		>
			パケットロス
		</button>
		<button
			onclick={() => handleScenarioChange('timeout')}
			class="rounded-md px-3 py-1 text-sm transition-colors {selectedScenario === 'timeout'
				? 'bg-primary text-primary-foreground'
				: 'bg-muted hover:bg-muted/80'}"
		>
			タイムアウト
		</button>
	</div>

	<!-- 再生コントロール -->
	<div class="flex items-center justify-center gap-2">
		<button
			onclick={congestionStore.reset}
			class="rounded-lg bg-muted p-2 transition-colors hover:bg-muted/80"
			aria-label="リセット"
		>
			{@html resetIcon}
		</button>

		<button
			onclick={congestionStore.prevStep}
			disabled={congestionStore.currentStepIndex === 0}
			class="rounded-lg bg-muted p-2 transition-colors hover:bg-muted/80 disabled:opacity-50"
			aria-label="前のステップ"
		>
			{@html prevIcon}
		</button>

		<button
			onclick={congestionStore.togglePlay}
			class="rounded-lg bg-primary p-3 text-primary-foreground transition-colors hover:bg-primary/90"
			aria-label={congestionStore.isPlaying ? '一時停止' : '再生'}
		>
			{@html congestionStore.isPlaying ? pauseIcon : playIcon}
		</button>

		<button
			onclick={congestionStore.nextStep}
			disabled={congestionStore.currentStepIndex >= congestionStore.totalSteps - 1}
			class="rounded-lg bg-muted p-2 transition-colors hover:bg-muted/80 disabled:opacity-50"
			aria-label="次のステップ"
		>
			{@html nextIcon}
		</button>
	</div>

	<!-- 速度調整 -->
	<div class="flex items-center justify-center gap-3">
		<span class="text-sm text-muted-foreground">速度:</span>
		{#each [0.5, 1, 2] as speed}
			<button
				onclick={() => congestionStore.setSpeed(speed)}
				class="rounded px-2 py-1 text-sm transition-colors {congestionStore.speed === speed
					? 'bg-accent text-accent-foreground'
					: 'text-muted-foreground hover:bg-muted'}"
			>
				{speed}x
			</button>
		{/each}
	</div>

	<!-- 進捗バー -->
	<div class="flex items-center gap-3">
		<span class="text-sm text-muted-foreground">
			{congestionStore.currentStepIndex + 1} / {congestionStore.totalSteps}
		</span>
		<div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
			<div
				class="h-full bg-primary transition-all duration-300"
				style="width: {((congestionStore.currentStepIndex + 1) / congestionStore.totalSteps) *
					100}%"
			></div>
		</div>
	</div>
</div>

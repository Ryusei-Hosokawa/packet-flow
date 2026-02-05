<script lang="ts">
	import {
		encapsulationStore,
		ENCAPSULATION_LAYERS
	} from '$lib/stores/encapsulationStore.svelte';
	import DataBlock from './DataBlock.svelte';

	const speeds = [0.5, 1, 2] as const;
</script>

<div class="space-y-6">
	<!-- 方向切り替えタブ -->
	<div class="flex w-fit flex-wrap gap-2 rounded-lg bg-muted p-1">
		<button
			type="button"
			onclick={() => encapsulationStore.setDirection('encapsulation')}
			class="rounded-md border-none px-2 py-2 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-sm {encapsulationStore.direction ===
			'encapsulation'
				? 'bg-background text-foreground shadow-sm'
				: 'bg-transparent text-muted-foreground'}"
		>
			カプセル化（送信側）
		</button>
		<button
			type="button"
			onclick={() => encapsulationStore.setDirection('decapsulation')}
			class="rounded-md border-none px-2 py-2 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-sm {encapsulationStore.direction ===
			'decapsulation'
				? 'bg-background text-foreground shadow-sm'
				: 'bg-transparent text-muted-foreground'}"
		>
			非カプセル化（受信側）
		</button>
	</div>

	<!-- メインビジュアル -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
		<!-- 左: 層の流れ -->
		<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
			<h3 class="mb-4 text-center text-sm font-semibold sm:text-base">
				{encapsulationStore.direction === 'encapsulation' ? '送信時の流れ ↓' : '受信時の流れ ↑'}
			</h3>

			<div class="flex flex-col gap-2">
				{#each encapsulationStore.direction === 'encapsulation' ? ENCAPSULATION_LAYERS : [...ENCAPSULATION_LAYERS].reverse() as layer, index}
					{@const isActive =
						encapsulationStore.currentStep === layer.id ||
						(encapsulationStore.currentStep === 'complete' &&
							encapsulationStore.direction === 'encapsulation')}
					{@const isPassed =
						encapsulationStore.direction === 'encapsulation'
							? ENCAPSULATION_LAYERS.findIndex((l) => l.id === layer.id) <
								ENCAPSULATION_LAYERS.findIndex(
									(l) => l.id === encapsulationStore.currentStep
								)
							: ENCAPSULATION_LAYERS.findIndex((l) => l.id === layer.id) >
								ENCAPSULATION_LAYERS.findIndex(
									(l) => l.id === encapsulationStore.currentStep
								)}

					<div
						class="flex items-center gap-2 rounded-lg p-2 transition-all duration-300 sm:gap-3 sm:p-3"
						style="border: 2px solid {isActive
							? layer.color
							: isPassed
								? layer.color + '60'
								: 'var(--border)'}; background: {isActive
							? layer.color + '20'
							: isPassed
								? layer.color + '10'
								: 'var(--background)'};"
					>
						<span
							class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white sm:h-8 sm:w-8"
							style="background: {layer.color};"
						>
							{encapsulationStore.direction === 'encapsulation'
								? index + 1
								: ENCAPSULATION_LAYERS.length - index}
						</span>
						<div class="min-w-0 flex-1">
							<div class="text-xs font-semibold sm:text-sm">{layer.nameJa}</div>
							<div class="text-xs text-muted-foreground">
								{encapsulationStore.direction === 'encapsulation'
									? `+ ${layer.headerName}`
									: `- ${layer.headerName}`}
							</div>
						</div>
						<span
							class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:py-1 sm:text-xs"
							style="background: {layer.color}20; color: {layer.color};"
						>
							{layer.pdu}
						</span>
					</div>

					{#if index < ENCAPSULATION_LAYERS.length - 1}
						<div class="flex justify-center">
							<span class="text-muted-foreground">
								{encapsulationStore.direction === 'encapsulation' ? '↓' : '↑'}
							</span>
						</div>
					{/if}
				{/each}
			</div>
		</div>

		<!-- 右: データブロック可視化 -->
		<div class="flex flex-col gap-4">
			<div class="flex min-h-[250px] items-center justify-center rounded-lg border border-border bg-card p-4 sm:min-h-[300px] sm:p-6">
				{#key encapsulationStore.currentStep}
					<DataBlock
						layers={encapsulationStore.activeHeaders}
						currentLayerId={encapsulationStore.currentLayerData?.id ?? null}
						direction={encapsulationStore.direction}
					/>
				{/key}
			</div>

			<!-- 現在のステップ説明 -->
			<div class="rounded-lg border border-border bg-muted p-4">
				{#if encapsulationStore.currentStep === 'complete'}
					<h4 class="mb-2 text-sm font-semibold">
						{encapsulationStore.direction === 'encapsulation'
							? 'カプセル化完了'
							: '非カプセル化完了'}
					</h4>
					<p class="text-xs leading-relaxed text-muted-foreground">
						{encapsulationStore.direction === 'encapsulation'
							? 'すべての層でヘッダが追加され、物理的な信号として送信準備が整いました。'
							: 'すべてのヘッダが取り除かれ、元のアプリケーションデータが取り出されました。'}
					</p>
				{:else if encapsulationStore.currentLayerData}
					<h4 class="mb-2 text-sm font-semibold">
						{encapsulationStore.currentLayerData.nameJa}
					</h4>
					<p class="text-xs leading-relaxed text-muted-foreground">
						{encapsulationStore.currentLayerData.description}
					</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- コントロールバー -->
	<div class="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-border bg-card p-3 sm:gap-4 sm:p-4">
		<!-- 再生/一時停止 -->
		<button
			onclick={() => encapsulationStore.togglePlay()}
			class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-primary text-primary-foreground transition-colors hover:opacity-90"
			aria-label={encapsulationStore.isPlaying ? '一時停止' : '再生'}
		>
			{#if encapsulationStore.isPlaying}
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
			onclick={() => encapsulationStore.prev()}
			disabled={!encapsulationStore.canGoPrev()}
			class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
			aria-label="前のステップ"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<polyline points="15,18 9,12 15,6" />
			</svg>
		</button>

		<!-- ステップ進む -->
		<button
			onclick={() => encapsulationStore.next()}
			disabled={!encapsulationStore.canGoNext()}
			class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
			aria-label="次のステップ"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<polyline points="9,6 15,12 9,18" />
			</svg>
		</button>

		<!-- リセット -->
		<button
			onclick={() => encapsulationStore.reset()}
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
					onclick={() => encapsulationStore.setSpeed(s)}
					class="cursor-pointer rounded border-none px-2 py-1 text-sm transition-colors {encapsulationStore.speed ===
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
			Step {encapsulationStore.stepIndex + 1} / {encapsulationStore.totalSteps}
		</span>
	</div>
</div>

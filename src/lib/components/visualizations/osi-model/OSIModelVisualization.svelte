<script lang="ts">
	import { osiModelStore, OSI_LAYERS, TCPIP_LAYERS } from '$lib/stores/osiModelStore.svelte';
	import type { OSILayerNumber, TCPIPLayerNumber } from '$lib/types/network';
	import LayerBox from './LayerBox.svelte';
	import LayerDetails from './LayerDetails.svelte';

	const isComparison = $derived(osiModelStore.selectedModel === 'comparison');
</script>

<div class="space-y-6">
	<!-- モデル切り替えタブ -->
	<div class="flex w-fit flex-wrap gap-2 rounded-lg bg-muted p-1">
		<button
			type="button"
			onclick={() => osiModelStore.setModel('osi')}
			class="rounded-md border-none px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 {osiModelStore.selectedModel ===
			'osi'
				? 'bg-background text-foreground shadow-sm'
				: 'bg-transparent text-muted-foreground'}"
		>
			OSI参照モデル
		</button>
		<button
			type="button"
			onclick={() => osiModelStore.setModel('tcpip')}
			class="rounded-md border-none px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 {osiModelStore.selectedModel ===
			'tcpip'
				? 'bg-background text-foreground shadow-sm'
				: 'bg-transparent text-muted-foreground'}"
		>
			TCP/IPモデル
		</button>
		<button
			type="button"
			onclick={() => osiModelStore.setModel('comparison')}
			class="rounded-md border-none px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 {osiModelStore.selectedModel ===
			'comparison'
				? 'bg-background text-foreground shadow-sm'
				: 'bg-transparent text-muted-foreground'}"
		>
			比較表示
		</button>
	</div>

	<!-- メインコンテンツ -->
	{#if isComparison}
		<!-- 比較表示モード -->
		<div class="flex flex-col gap-6">
			<!-- 両モデル並列表示 -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
				<!-- OSIモデル -->
				<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
					<h3 class="mb-4 text-center text-sm font-semibold sm:text-base">OSI参照モデル（7層）</h3>
					<div class="flex flex-col gap-2">
						{#each OSI_LAYERS as layer}
							<LayerBox
								number={layer.number}
								name={layer.name}
								nameJa={layer.nameJa}
								color={layer.color}
								isSelected={osiModelStore.selectedOSILayer === layer.number}
								isHighlighted={osiModelStore.mappedOSILayers.includes(layer.number)}
								onclick={() => osiModelStore.selectOSILayer(layer.number as OSILayerNumber)}
							/>
						{/each}
					</div>
				</div>

				<!-- TCP/IPモデル -->
				<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
					<h3 class="mb-4 text-center text-sm font-semibold sm:text-base">TCP/IPモデル（4層）</h3>
					<div class="flex flex-col gap-2">
						{#each TCPIP_LAYERS as layer}
							{@const heightMultiplier = layer.osiMapping.length}
							<div class="flex items-center" style="height: {heightMultiplier * 3.5}rem;">
								<div class="w-full">
									<LayerBox
										number={layer.number}
										name={layer.name}
										nameJa={layer.nameJa}
										color={layer.color}
										isSelected={osiModelStore.selectedTCPIPLayer === layer.number}
										isHighlighted={osiModelStore.mappedTCPIPLayer === layer.number}
										onclick={() =>
											osiModelStore.selectTCPIPLayer(layer.number as TCPIPLayerNumber)}
									/>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- 詳細パネル -->
			<LayerDetails
				osiLayer={osiModelStore.selectedOSILayerData}
				tcpipLayer={osiModelStore.selectedTCPIPLayerData}
			/>

			<!-- マッピング説明 -->
			<div class="rounded-lg border border-border bg-muted p-4">
				<h4 class="mb-3 text-sm font-semibold">OSI ↔ TCP/IP マッピング</h4>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{#each TCPIP_LAYERS as tcpipLayer}
						<div class="flex items-center gap-2 rounded bg-background p-2">
							<span
								class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
								style="background: {tcpipLayer.color};"
							>
								{tcpipLayer.number}
							</span>
							<span class="text-xs font-medium">{tcpipLayer.name}</span>
							<span class="text-xs text-muted-foreground">←</span>
							<span class="text-xs text-muted-foreground">
								OSI {tcpipLayer.osiMapping.join(', ')}
							</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- リセットボタン -->
			<button
				type="button"
				onclick={() => osiModelStore.reset()}
				class="w-fit cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
			>
				選択をリセット
			</button>
		</div>
	{:else}
		<!-- 単一モデル表示モード -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
			<!-- 左: モデル図 -->
			<div class="flex flex-col gap-4">
				{#if osiModelStore.selectedModel === 'osi'}
					<!-- OSIモデル -->
					<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
						<h3 class="mb-4 text-center text-sm font-semibold sm:text-base">
							OSI参照モデル（7層）
						</h3>
						<div class="flex flex-col gap-2">
							{#each OSI_LAYERS as layer}
								<LayerBox
									number={layer.number}
									name={layer.name}
									nameJa={layer.nameJa}
									color={layer.color}
									isSelected={osiModelStore.selectedOSILayer === layer.number}
									isHighlighted={osiModelStore.mappedOSILayers.includes(layer.number)}
									onclick={() => osiModelStore.selectOSILayer(layer.number as OSILayerNumber)}
								/>
							{/each}
						</div>
					</div>
				{:else}
					<!-- TCP/IPモデル -->
					<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
						<h3 class="mb-4 text-center text-sm font-semibold sm:text-base">TCP/IPモデル（4層）</h3>
						<div class="flex flex-col gap-2">
							{#each TCPIP_LAYERS as layer}
								<LayerBox
									number={layer.number}
									name={layer.name}
									nameJa={layer.nameJa}
									color={layer.color}
									isSelected={osiModelStore.selectedTCPIPLayer === layer.number}
									isHighlighted={false}
									onclick={() =>
										osiModelStore.selectTCPIPLayer(layer.number as TCPIPLayerNumber)}
								/>
							{/each}
						</div>
					</div>
				{/if}

				<!-- リセットボタン -->
				<button
					type="button"
					onclick={() => osiModelStore.reset()}
					class="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
				>
					選択をリセット
				</button>
			</div>

			<!-- 右: 詳細パネル -->
			<div>
				<LayerDetails
					osiLayer={osiModelStore.selectedOSILayerData}
					tcpipLayer={osiModelStore.selectedTCPIPLayerData}
				/>

				<!-- モデル比較の説明 -->
				<div class="mt-4 rounded-lg border border-border bg-muted p-4">
					<h4 class="mb-2 text-sm font-semibold">OSI vs TCP/IP</h4>
					<p class="text-xs leading-relaxed text-muted-foreground">
						OSI参照モデルは理論的な標準モデル（7層）で、TCP/IPモデルは実際のインターネットで使われる実用的なモデル（4層）です。
						TCP/IPのアプリケーション層はOSIの上位3層（5-7）を、ネットワークインターフェース層は下位2層（1-2）を統合しています。
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

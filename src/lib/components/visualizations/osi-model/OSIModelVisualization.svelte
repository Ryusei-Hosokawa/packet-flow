<script lang="ts">
	import { osiModelStore, OSI_LAYERS, TCPIP_LAYERS } from '$lib/stores/osiModelStore.svelte';
	import type { OSILayerNumber, TCPIPLayerNumber } from '$lib/types/network';
	import LayerBox from './LayerBox.svelte';
	import LayerDetails from './LayerDetails.svelte';

	const isComparison = $derived(osiModelStore.selectedModel === 'comparison');
</script>

<div class="space-y-6">
	<!-- モデル切り替えタブ -->
	<div
		style="display: flex; gap: 0.5rem; padding: 0.25rem; border-radius: 0.5rem; background: var(--muted); width: fit-content;"
	>
		<button
			type="button"
			onclick={() => osiModelStore.setModel('osi')}
			style="padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; background: {osiModelStore.selectedModel ===
			'osi'
				? 'var(--background)'
				: 'transparent'}; color: {osiModelStore.selectedModel === 'osi'
				? 'var(--foreground)'
				: 'var(--muted-foreground)'}; box-shadow: {osiModelStore.selectedModel === 'osi'
				? '0 1px 3px rgba(0,0,0,0.1)'
				: 'none'};"
		>
			OSI参照モデル
		</button>
		<button
			type="button"
			onclick={() => osiModelStore.setModel('tcpip')}
			style="padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; background: {osiModelStore.selectedModel ===
			'tcpip'
				? 'var(--background)'
				: 'transparent'}; color: {osiModelStore.selectedModel === 'tcpip'
				? 'var(--foreground)'
				: 'var(--muted-foreground)'}; box-shadow: {osiModelStore.selectedModel === 'tcpip'
				? '0 1px 3px rgba(0,0,0,0.1)'
				: 'none'};"
		>
			TCP/IPモデル
		</button>
		<button
			type="button"
			onclick={() => osiModelStore.setModel('comparison')}
			style="padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; background: {osiModelStore.selectedModel ===
			'comparison'
				? 'var(--background)'
				: 'transparent'}; color: {osiModelStore.selectedModel === 'comparison'
				? 'var(--foreground)'
				: 'var(--muted-foreground)'}; box-shadow: {osiModelStore.selectedModel === 'comparison'
				? '0 1px 3px rgba(0,0,0,0.1)'
				: 'none'};"
		>
			比較表示
		</button>
	</div>

	<!-- メインコンテンツ -->
	{#if isComparison}
		<!-- 比較表示モード -->
		<div style="display: flex; flex-direction: column; gap: 1.5rem;">
			<!-- 両モデル並列表示 -->
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
				<!-- OSIモデル -->
				<div
					style="padding: 1.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--card);"
				>
					<h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; text-align: center;">
						OSI参照モデル（7層）
					</h3>
					<div style="display: flex; flex-direction: column; gap: 0.5rem;">
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
				<div
					style="padding: 1.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--card);"
				>
					<h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; text-align: center;">
						TCP/IPモデル（4層）
					</h3>
					<div style="display: flex; flex-direction: column; gap: 0.5rem;">
						{#each TCPIP_LAYERS as layer}
							{@const heightMultiplier = layer.osiMapping.length}
							<div
								style="height: {heightMultiplier * 3.5}rem; display: flex; align-items: center;"
							>
								<div style="width: 100%;">
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
			<div
				style="padding: 1rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--muted);"
			>
				<h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem;">
					OSI ↔ TCP/IP マッピング
				</h4>
				<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
					{#each TCPIP_LAYERS as tcpipLayer}
						<div
							style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 0.25rem; background: var(--background);"
						>
							<span
								style="display: flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; border-radius: 9999px; background: {tcpipLayer.color}; color: white; font-size: 0.75rem; font-weight: bold;"
							>
								{tcpipLayer.number}
							</span>
							<span style="font-size: 0.75rem; font-weight: 500;">{tcpipLayer.name}</span>
							<span style="font-size: 0.75rem; color: var(--muted-foreground);">←</span>
							<span style="font-size: 0.75rem; color: var(--muted-foreground);">
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
				style="padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--background); font-size: 0.875rem; cursor: pointer; width: fit-content;"
			>
				選択をリセット
			</button>
		</div>
	{:else}
		<!-- 単一モデル表示モード -->
		<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
			<!-- 左: モデル図 -->
			<div style="display: flex; flex-direction: column; gap: 1rem;">
				{#if osiModelStore.selectedModel === 'osi'}
					<!-- OSIモデル -->
					<div
						style="padding: 1.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--card);"
					>
						<h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; text-align: center;">
							OSI参照モデル（7層）
						</h3>
						<div style="display: flex; flex-direction: column; gap: 0.5rem;">
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
					<div
						style="padding: 1.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--card);"
					>
						<h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; text-align: center;">
							TCP/IPモデル（4層）
						</h3>
						<div style="display: flex; flex-direction: column; gap: 0.5rem;">
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
					style="padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--background); font-size: 0.875rem; cursor: pointer;"
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
				<div
					style="margin-top: 1rem; padding: 1rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--muted);"
				>
					<h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">
						OSI vs TCP/IP
					</h4>
					<p style="font-size: 0.75rem; color: var(--muted-foreground); line-height: 1.5;">
						OSI参照モデルは理論的な標準モデル（7層）で、TCP/IPモデルは実際のインターネットで使われる実用的なモデル（4層）です。
						TCP/IPのアプリケーション層はOSIの上位3層（5-7）を、ネットワークインターフェース層は下位2層（1-2）を統合しています。
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

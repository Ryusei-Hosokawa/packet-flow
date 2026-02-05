<script lang="ts">
	import type { EncapsulationLayer } from '$lib/types/animation';

	interface Props {
		layers: EncapsulationLayer[];
		currentLayerId: string | null;
		direction: 'encapsulation' | 'decapsulation';
	}

	let { layers, currentLayerId, direction }: Props = $props();

	// 表示用に逆順（外側から内側へ）
	const displayLayers = $derived([...layers].reverse());
</script>

<div
	style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem;"
>
	{#if displayLayers.length === 0}
		<!-- 元データのみ -->
		<div
			style="display: flex; align-items: center; justify-content: center; padding: 1.5rem 3rem; border-radius: 0.5rem; background: #ef4444; color: white; font-weight: 600; font-size: 1.125rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
		>
			Data
		</div>
		<p style="font-size: 0.875rem; color: var(--muted-foreground); margin-top: 0.5rem;">
			アプリケーションデータ
		</p>
	{:else}
		<!-- カプセル化されたデータ -->
		<div style="position: relative; display: flex; flex-direction: column; align-items: center;">
			{#each displayLayers as layer, index}
				{@const isOuter = index === 0}
				{@const isCurrentLayer = layer.id === currentLayerId}
				<div
					class={isCurrentLayer ? 'pulse-border' : ''}
					style="
						position: relative;
						display: flex;
						align-items: center;
						padding: {0.75 + index * 0.25}rem {1.5 + index * 0.5}rem;
						border: 3px solid {layer.color};
						border-radius: 0.5rem;
						background: {layer.color}15;
						margin-bottom: {index < displayLayers.length - 1 ? '-0.5rem' : '0'};
						z-index: {displayLayers.length - index};
						transition: all 0.3s ease;
					"
				>
					{#if isOuter}
						<!-- 最外層のラベル -->
						<span
							style="position: absolute; top: -0.75rem; left: 0.5rem; padding: 0.125rem 0.5rem; border-radius: 0.25rem; background: {layer.color}; color: white; font-size: 0.625rem; font-weight: 600;"
						>
							{layer.headerName}
						</span>
					{/if}

					{#if index === displayLayers.length - 1}
						<!-- 最内層：Dataラベル -->
						<span style="font-weight: 600; color: #ef4444;">Data</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- PDU名 -->
		<p style="font-size: 0.875rem; color: var(--muted-foreground); margin-top: 1rem;">
			{#if displayLayers.length > 0}
				現在のPDU: <strong style="color: {displayLayers[0].color};">{displayLayers[0].pdu}</strong>
			{/if}
		</p>
	{/if}
</div>

<style>
	@keyframes pulseBorder {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
		}
	}

	.pulse-border {
		animation: pulseBorder 1.5s infinite;
	}
</style>

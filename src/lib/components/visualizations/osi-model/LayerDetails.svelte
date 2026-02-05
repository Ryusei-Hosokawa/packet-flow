<script lang="ts">
	import type { OSILayer, TCPIPLayer } from '$lib/types/network';

	interface Props {
		osiLayer: OSILayer | null;
		tcpipLayer: TCPIPLayer | null;
	}

	let { osiLayer, tcpipLayer }: Props = $props();

	const hasSelection = $derived(osiLayer !== null || tcpipLayer !== null);
</script>

<div
	style="padding: 1.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--card); min-height: 200px;"
>
	{#if !hasSelection}
		<div
			style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 150px; color: var(--muted-foreground);"
		>
			<p>レイヤーをクリックして詳細を表示</p>
		</div>
	{:else}
		<div style="display: flex; flex-direction: column; gap: 1.5rem;">
			{#if osiLayer}
				<div>
					<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
						<span
							style="display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 9999px; background: {osiLayer.color}; color: white; font-weight: bold;"
						>
							{osiLayer.number}
						</span>
						<div>
							<h3 style="font-size: 1.125rem; font-weight: 600;">{osiLayer.name}</h3>
							<p style="font-size: 0.875rem; color: var(--muted-foreground);">{osiLayer.nameJa}</p>
						</div>
						<span
							style="margin-left: auto; padding: 0.25rem 0.5rem; border-radius: 0.25rem; background: var(--muted); font-size: 0.75rem; color: var(--muted-foreground);"
						>
							OSI Layer {osiLayer.number}
						</span>
					</div>

					<p style="font-size: 0.875rem; color: var(--foreground); line-height: 1.6;">
						{osiLayer.description}
					</p>

					<div style="display: grid; gap: 1rem; margin-top: 1rem;">
						<div>
							<h4
								style="font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); margin-bottom: 0.5rem;"
							>
								主なプロトコル
							</h4>
							<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
								{#each osiLayer.protocols as protocol}
									<span
										style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; background: {osiLayer.color}20; color: {osiLayer.color}; font-size: 0.75rem; font-weight: 500;"
									>
										{protocol}
									</span>
								{/each}
							</div>
						</div>

						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
							<div>
								<h4
									style="font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); margin-bottom: 0.5rem;"
								>
									PDU（データ単位）
								</h4>
								<span
									style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; background: var(--muted); font-size: 0.75rem;"
								>
									{osiLayer.pdu}
								</span>
							</div>

							{#if osiLayer.devices.length > 0}
								<div>
									<h4
										style="font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); margin-bottom: 0.5rem;"
									>
										関連機器
									</h4>
									<div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
										{#each osiLayer.devices as device}
											<span
												style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; background: var(--muted); font-size: 0.75rem;"
											>
												{device}
											</span>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			{#if tcpipLayer && !osiLayer}
				<div>
					<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
						<span
							style="display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 9999px; background: {tcpipLayer.color}; color: white; font-weight: bold;"
						>
							{tcpipLayer.number}
						</span>
						<div>
							<h3 style="font-size: 1.125rem; font-weight: 600;">{tcpipLayer.name}</h3>
							<p style="font-size: 0.875rem; color: var(--muted-foreground);">
								{tcpipLayer.nameJa}
							</p>
						</div>
						<span
							style="margin-left: auto; padding: 0.25rem 0.5rem; border-radius: 0.25rem; background: var(--muted); font-size: 0.75rem; color: var(--muted-foreground);"
						>
							TCP/IP Layer {tcpipLayer.number}
						</span>
					</div>

					<p style="font-size: 0.875rem; color: var(--foreground); line-height: 1.6;">
						{tcpipLayer.description}
					</p>

					<div style="display: grid; gap: 1rem; margin-top: 1rem;">
						<div>
							<h4
								style="font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); margin-bottom: 0.5rem;"
							>
								主なプロトコル
							</h4>
							<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
								{#each tcpipLayer.protocols as protocol}
									<span
										style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; background: {tcpipLayer.color}20; color: {tcpipLayer.color}; font-size: 0.75rem; font-weight: 500;"
									>
										{protocol}
									</span>
								{/each}
							</div>
						</div>

						<div>
							<h4
								style="font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); margin-bottom: 0.5rem;"
							>
								対応するOSI層
							</h4>
							<div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
								{#each tcpipLayer.osiMapping as layerNum}
									<span
										style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; background: var(--muted); font-size: 0.75rem;"
									>
										Layer {layerNum}
									</span>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

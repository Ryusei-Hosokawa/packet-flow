<script lang="ts">
	import { packetLossStore } from '$lib/stores/packetLossStore.svelte';

	const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" /></svg>`;
	const stopIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clip-rule="evenodd" /></svg>`;
	const resetIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clip-rule="evenodd" /></svg>`;

	function handleLossRateChange(event: Event) {
		const value = parseFloat((event.target as HTMLInputElement).value);
		packetLossStore.setLossRate(value / 100);
	}

	function handlePacketCountChange(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		packetLossStore.setTotalPackets(value);
	}

	function togglePlay() {
		if (packetLossStore.isPlaying) {
			packetLossStore.stop();
		} else {
			packetLossStore.play();
		}
	}
</script>

<div class="space-y-4">
	<!-- 再生コントロール -->
	<div class="flex items-center justify-center gap-3">
		<button
			onclick={packetLossStore.reset}
			disabled={packetLossStore.isPlaying}
			class="rounded-lg bg-muted p-2 transition-colors hover:bg-muted/80 disabled:opacity-50"
			aria-label="リセット"
		>
			{@html resetIcon}
		</button>

		<button
			onclick={togglePlay}
			class="rounded-lg bg-primary p-3 text-primary-foreground transition-colors hover:bg-primary/90"
			aria-label={packetLossStore.isPlaying ? '停止' : '再生'}
		>
			{@html packetLossStore.isPlaying ? stopIcon : playIcon}
		</button>
	</div>

	<!-- パラメータ設定 -->
	<div class="space-y-3">
		<div>
			<div class="mb-1 flex items-center justify-between">
				<label for="lossRate" class="text-sm font-medium">パケットロス率</label>
				<span class="text-sm text-muted-foreground">{Math.round(packetLossStore.config.lossRate * 100)}%</span>
			</div>
			<input
				id="lossRate"
				type="range"
				min="0"
				max="50"
				value={packetLossStore.config.lossRate * 100}
				onchange={handleLossRateChange}
				disabled={packetLossStore.isPlaying}
				class="w-full accent-primary disabled:opacity-50"
			/>
		</div>

		<div>
			<div class="mb-1 flex items-center justify-between">
				<label for="packetCount" class="text-sm font-medium">送信パケット数</label>
				<span class="text-sm text-muted-foreground">{packetLossStore.config.totalPackets}</span>
			</div>
			<input
				id="packetCount"
				type="range"
				min="5"
				max="20"
				value={packetLossStore.config.totalPackets}
				onchange={handlePacketCountChange}
				disabled={packetLossStore.isPlaying}
				class="w-full accent-primary disabled:opacity-50"
			/>
		</div>
	</div>

	<!-- 統計 -->
	<div class="grid grid-cols-3 gap-2 rounded-lg bg-muted p-3 text-center">
		<div>
			<p class="text-lg font-bold text-green-500">{packetLossStore.stats.delivered}</p>
			<p class="text-xs text-muted-foreground">配達済</p>
		</div>
		<div>
			<p class="text-lg font-bold text-red-500">{packetLossStore.stats.lost}</p>
			<p class="text-xs text-muted-foreground">ロスト</p>
		</div>
		<div>
			<p class="text-lg font-bold text-amber-500">{packetLossStore.stats.retransmit}</p>
			<p class="text-xs text-muted-foreground">再送</p>
		</div>
	</div>
</div>

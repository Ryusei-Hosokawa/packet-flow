<script lang="ts">
	import type { Packet, Ack } from '$lib/stores/packetLossStore.svelte';

	interface Props {
		packets: Packet[];
		acks: Ack[];
	}

	let { packets, acks }: Props = $props();

	// レイアウト定数（パーセント）
	const LEFT_EDGE = 12; // 送信者の右端
	const RIGHT_EDGE = 88; // 受信者の左端
	const TRAVEL_DISTANCE = RIGHT_EDGE - LEFT_EDGE; // 移動距離

	// パケットの位置を計算（パーセント）
	function getPacketPosition(progress: number): number {
		return LEFT_EDGE + (progress / 100) * TRAVEL_DISTANCE;
	}

	// ACKの位置を計算（パーセント）
	function getAckPosition(progress: number): number {
		return RIGHT_EDGE - (progress / 100) * TRAVEL_DISTANCE;
	}
</script>

<div class="relative h-64 w-full overflow-hidden rounded-lg bg-muted/50">
	<!-- 背景線 -->
	<svg class="absolute inset-0 h-full w-full">
		<!-- 送信線 -->
		<line x1="10%" y1="112" x2="90%" y2="112" stroke="currentColor" stroke-opacity="0.2" stroke-width="2" stroke-dasharray="4" />
		<!-- ACK線 -->
		<line x1="10%" y1="152" x2="90%" y2="152" stroke="currentColor" stroke-opacity="0.2" stroke-width="2" stroke-dasharray="4" />
	</svg>

	<!-- 矢印（送信方向 →） -->
	<div class="absolute top-28 -translate-y-1/2 text-foreground/30" style="left: 90%;">
		<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
			<polygon points="12,6 0,0 0,12" />
		</svg>
	</div>

	<!-- 矢印（ACK方向 ←） -->
	<div class="absolute top-38 -translate-y-1/2 text-foreground/30" style="left: 10%;">
		<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" class="-translate-x-full">
			<polygon points="0,6 12,0 12,12" />
		</svg>
	</div>

	<!-- 送信者 -->
	<div class="absolute left-4 top-1/2 -translate-y-1/2">
		<div class="flex h-20 w-14 flex-col items-center justify-center rounded-lg border-2 border-primary bg-card">
			<span class="text-2xl">💻</span>
			<span class="mt-1 text-xs font-medium">送信者</span>
		</div>
	</div>

	<!-- 受信者 -->
	<div class="absolute right-4 top-1/2 -translate-y-1/2">
		<div class="flex h-20 w-14 flex-col items-center justify-center rounded-lg border-2 border-green-500 bg-card">
			<span class="text-2xl">🖥️</span>
			<span class="mt-1 text-xs font-medium">受信者</span>
		</div>
	</div>

	<!-- パケット -->
	{#each packets as packet (packet.id)}
		{@const position = getPacketPosition(packet.progress)}
		<div
			class="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md text-xs font-bold text-white shadow-md transition-all duration-75
				{packet.status === 'sending' ? 'bg-blue-500' : ''}
				{packet.status === 'retransmitting' ? 'bg-amber-500' : ''}
				{packet.status === 'delivered' ? 'bg-green-500' : ''}
				{packet.status === 'lost' ? 'bg-red-500 opacity-50' : ''}
				{packet.status === 'acked' ? 'bg-green-500 opacity-30' : ''}"
			style="left: {position}%; top: 112px;"
		>
			{#if packet.status === 'lost'}
				✕
			{:else}
				{packet.sequenceNumber}
			{/if}
		</div>
	{/each}

	<!-- ACK -->
	{#each acks as ack (ack.id)}
		{@const position = getAckPosition(ack.progress)}
		{#if ack.progress < 100}
			<div
				class="absolute flex h-6 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded border-2 border-green-500 bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300"
				style="left: {position}%; top: 152px;"
			>
				ACK{ack.ackNumber}
			</div>
		{/if}
	{/each}

	<!-- 凡例 -->
	<div class="absolute bottom-2 left-2 flex flex-wrap gap-3 text-xs">
		<div class="flex items-center gap-1">
			<span class="h-3 w-3 rounded bg-blue-500"></span>
			<span>送信中</span>
		</div>
		<div class="flex items-center gap-1">
			<span class="h-3 w-3 rounded bg-amber-500"></span>
			<span>再送</span>
		</div>
		<div class="flex items-center gap-1">
			<span class="h-3 w-3 rounded bg-green-500"></span>
			<span>配達済</span>
		</div>
		<div class="flex items-center gap-1">
			<span class="h-3 w-3 rounded bg-red-500 opacity-50"></span>
			<span>ロスト</span>
		</div>
	</div>
</div>

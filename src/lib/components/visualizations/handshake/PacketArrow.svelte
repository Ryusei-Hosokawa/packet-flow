<script lang="ts">
	import type { HandshakeStep } from '$lib/types/animation';

	interface Props {
		step: HandshakeStep;
	}

	let { step }: Props = $props();

	interface PacketDisplay {
		label: string;
		direction: 'right' | 'left' | 'none';
		color: string;
	}

	const packetInfo: Record<HandshakeStep, PacketDisplay> = {
		idle: { label: '', direction: 'none', color: '' },
		'syn-sent': { label: 'SYN', direction: 'right', color: '#3b82f6' },
		'syn-received': { label: 'SYN+ACK', direction: 'left', color: '#a855f7' },
		'ack-sent': { label: 'ACK', direction: 'right', color: '#22c55e' },
		established: { label: '', direction: 'none', color: '' }
	};

	const packet = $derived(packetInfo[step]);
	const isVisible = $derived(packet.direction !== 'none');
</script>

<div class="relative flex h-16 w-full items-center justify-center sm:h-20">
	<!-- 接続線 -->
	<div class="absolute h-0.5 w-full bg-border"></div>

	{#if isVisible}
		<!-- パケット -->
		<div
			class="absolute flex items-center gap-2 rounded-full px-3 py-2 font-mono text-xs text-white shadow-md sm:px-4 sm:text-sm {packet.direction ===
			'right'
				? 'packet-right'
				: 'packet-left'}"
			style="background: {packet.color};"
		>
			<span>{packet.label}</span>
			<span class="text-base sm:text-lg">{packet.direction === 'right' ? '→' : '←'}</span>
		</div>
	{/if}

	{#if step === 'established'}
		<!-- 接続確立表示 -->
		<div class="pulse absolute rounded-full bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-md sm:px-4 sm:text-base">
			Connected!
		</div>
	{/if}
</div>

<style>
	@keyframes slideRight {
		0% {
			left: 5%;
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			left: 80%;
			opacity: 0;
		}
	}

	@keyframes slideLeft {
		0% {
			right: 5%;
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			right: 80%;
			opacity: 0;
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.packet-right {
		animation: slideRight 1.2s ease-in-out forwards;
	}

	.packet-left {
		animation: slideLeft 1.2s ease-in-out forwards;
	}

	.pulse {
		animation: pulse 2s infinite;
	}
</style>

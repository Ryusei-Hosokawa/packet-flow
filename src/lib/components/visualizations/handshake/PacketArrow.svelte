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

<div style="position: relative; display: flex; align-items: center; justify-content: center; height: 5rem; width: 100%;">
	<!-- 接続線 -->
	<div style="position: absolute; width: 100%; height: 2px; background: var(--border);"></div>

	{#if isVisible}
		<!-- パケット -->
		<div
			class={packet.direction === 'right' ? 'packet-right' : 'packet-left'}
			style="position: absolute; display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 9999px; background: {packet.color}; color: white; font-family: monospace; font-size: 0.875rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
		>
			<span>{packet.label}</span>
			<span style="font-size: 1.125rem;">{packet.direction === 'right' ? '→' : '←'}</span>
		</div>
	{/if}

	{#if step === 'established'}
		<!-- 接続確立表示 -->
		<div
			class="pulse"
			style="position: absolute; padding: 0.5rem 1rem; border-radius: 9999px; background: #22c55e; color: white; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
		>
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
		0%, 100% {
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

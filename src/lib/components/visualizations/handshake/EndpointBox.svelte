<script lang="ts">
	import type { HandshakeStep } from '$lib/types/animation';

	interface Props {
		label: 'Client' | 'Server';
		step: HandshakeStep;
	}

	let { label, step }: Props = $props();

	const clientStates: Record<HandshakeStep, string> = {
		idle: 'CLOSED',
		'syn-sent': 'SYN_SENT',
		'syn-received': 'SYN_SENT',
		'ack-sent': 'ESTABLISHED',
		established: 'ESTABLISHED'
	};

	const serverStates: Record<HandshakeStep, string> = {
		idle: 'LISTEN',
		'syn-sent': 'LISTEN',
		'syn-received': 'SYN_RCVD',
		'ack-sent': 'SYN_RCVD',
		established: 'ESTABLISHED'
	};

	const state = $derived(label === 'Client' ? clientStates[step] : serverStates[step]);
	const isEstablished = $derived(state === 'ESTABLISHED');
</script>

<div
	class="flex h-28 w-24 flex-col items-center justify-center rounded-lg border-2 transition-all duration-300 sm:h-32 sm:w-28 {isEstablished
		? 'border-green-500 bg-green-500/10'
		: 'border-border bg-card'}"
>
	<span class="text-base font-bold sm:text-lg">{label}</span>
	<span
		class="mt-2 rounded px-2 py-1 font-mono text-xs transition-all duration-300 {isEstablished
			? 'bg-green-500/20 text-green-500'
			: 'bg-muted text-muted-foreground'}"
	>
		{state}
	</span>
</div>

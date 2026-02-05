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
	style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 7rem; height: 8rem; border-radius: 0.5rem; border: 2px solid {isEstablished ? '#22c55e' : 'var(--border)'}; background: {isEstablished ? 'rgba(34, 197, 94, 0.1)' : 'var(--card)'}; transition: all 0.3s;"
>
	<span style="font-size: 1.125rem; font-weight: bold;">{label}</span>
	<span
		style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-family: monospace; background: {isEstablished ? 'rgba(34, 197, 94, 0.2)' : 'var(--muted)'}; color: {isEstablished ? '#22c55e' : 'var(--muted-foreground)'}; transition: all 0.3s;"
	>
		{state}
	</span>
</div>

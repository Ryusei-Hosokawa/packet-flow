<script lang="ts">
	import type { EventLog } from '$lib/stores/packetLossStore.svelte';

	interface Props {
		logs: EventLog[];
	}

	let { logs }: Props = $props();

	function getLogColor(type: EventLog['type']): string {
		switch (type) {
			case 'send':
				return 'text-blue-500';
			case 'deliver':
				return 'text-green-500';
			case 'loss':
				return 'text-red-500';
			case 'ack':
				return 'text-emerald-500';
			case 'retransmit':
				return 'text-amber-500';
			case 'timeout':
				return 'text-red-400';
			default:
				return 'text-muted-foreground';
		}
	}

	function getLogIcon(type: EventLog['type']): string {
		switch (type) {
			case 'send':
				return '→';
			case 'deliver':
				return '✓';
			case 'loss':
				return '✕';
			case 'ack':
				return '←';
			case 'retransmit':
				return '↻';
			case 'timeout':
				return '⏱';
			default:
				return '•';
		}
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString('ja-JP', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			fractionalSecondDigits: 1
		});
	}
</script>

<div class="h-48 overflow-y-auto rounded-lg bg-muted/50 p-3">
	{#if logs.length === 0}
		<p class="text-center text-sm text-muted-foreground">
			シミュレーションを開始するとログが表示されます
		</p>
	{:else}
		<div class="space-y-1">
			{#each [...logs].reverse() as log (log.id)}
				<div class="flex items-start gap-2 text-sm">
					<span class="shrink-0 font-mono text-xs text-muted-foreground">
						{formatTime(log.time)}
					</span>
					<span class="shrink-0 {getLogColor(log.type)}">
						{getLogIcon(log.type)}
					</span>
					<span class="{getLogColor(log.type)}">
						{log.message}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

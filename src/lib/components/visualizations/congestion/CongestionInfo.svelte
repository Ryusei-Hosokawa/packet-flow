<script lang="ts">
	import type { CongestionStep } from '$lib/stores/congestionStore.svelte';
	import Term from '$lib/components/ui/Term.svelte';

	interface Props {
		step: CongestionStep | undefined;
	}

	let { step }: Props = $props();

	// フェーズの表示名と色
	function getPhaseInfo(phase: string): { name: string; color: string; bgColor: string } {
		switch (phase) {
			case 'slow-start':
				return {
					name: 'スロースタート',
					color: 'text-green-500',
					bgColor: 'bg-green-500/20'
				};
			case 'congestion-avoidance':
				return {
					name: '輻輳回避',
					color: 'text-blue-500',
					bgColor: 'bg-blue-500/20'
				};
			case 'fast-recovery':
				return {
					name: '高速回復',
					color: 'text-amber-500',
					bgColor: 'bg-amber-500/20'
				};
			case 'timeout':
				return {
					name: 'タイムアウト',
					color: 'text-red-500',
					bgColor: 'bg-red-500/20'
				};
			default:
				return {
					name: phase,
					color: 'text-muted-foreground',
					bgColor: 'bg-muted'
				};
		}
	}

	// イベントの表示名
	function getEventName(event: string): string {
		switch (event) {
			case 'ack':
				return 'ACK受信';
			case 'loss':
				return '3重複ACK検出';
			case 'timeout':
				return 'タイムアウト発生';
			case 'start':
				return '開始';
			default:
				return event;
		}
	}
</script>

{#if step}
	{@const phaseInfo = getPhaseInfo(step.phase)}
	<div class="rounded-lg border border-border bg-card p-4">
		<!-- フェーズとラウンド -->
		<div class="mb-4 flex items-center justify-between">
			<span class="rounded-md px-3 py-1 text-sm font-bold {phaseInfo.color} {phaseInfo.bgColor}">
				{phaseInfo.name}
			</span>
			<span class="text-sm text-muted-foreground">ラウンド {step.round}</span>
		</div>

		<!-- 現在の値 -->
		<div class="mb-4 grid grid-cols-2 gap-4">
			<div class="rounded-lg bg-muted p-3 text-center">
				<div class="text-2xl font-bold text-primary">{step.cwnd}</div>
				<div class="text-xs text-muted-foreground">
					<Term id="cwnd">cwnd</Term>
				</div>
			</div>
			<div class="rounded-lg bg-muted p-3 text-center">
				<div class="text-2xl font-bold text-amber-500">{step.ssthresh}</div>
				<div class="text-xs text-muted-foreground">
					<Term id="ssthresh">ssthresh</Term>
				</div>
			</div>
		</div>

		<!-- イベントと説明 -->
		<div class="space-y-2">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">イベント:</span>
				<span class="text-sm text-muted-foreground">{getEventName(step.event)}</span>
			</div>
			<p class="text-sm text-muted-foreground">{step.description}</p>
		</div>
	</div>
{/if}

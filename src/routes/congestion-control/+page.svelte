<script lang="ts">
	import { onMount } from 'svelte';
	import { congestionStore } from '$lib/stores/congestionStore.svelte';
	import { CongestionGraph, CongestionControls, CongestionInfo } from '$lib/components/visualizations/congestion';
	import Term from '$lib/components/ui/Term.svelte';

	onMount(() => {
		// ページ読み込み時に初期化
		congestionStore.init();
	});
</script>

<svelte:head>
	<title>輻輳制御シミュレーション - PacketFlow</title>
</svelte:head>

<div class="container mx-auto w-full px-4 py-8">
	<h1 class="mb-2 text-2xl font-bold sm:text-3xl">TCP 輻輳制御シミュレーション</h1>
	<p class="mb-6 text-muted-foreground">
		<Term id="congestion-control">輻輳制御</Term>アルゴリズムの動作を視覚的に理解しましょう
	</p>

	<!-- グラフエリア -->
	<div class="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
		<CongestionGraph
			steps={congestionStore.steps}
			currentIndex={congestionStore.currentStepIndex}
			maxCwnd={congestionStore.config.maxCwnd}
		/>
	</div>

	<!-- コントロール & 情報パネル -->
	<div class="grid gap-6 md:grid-cols-2">
		<!-- コントロール -->
		<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
			<h2 class="mb-4 text-lg font-semibold">コントロール</h2>
			<CongestionControls />
		</div>

		<!-- 現在のステップ情報 -->
		<div>
			<h2 class="mb-4 text-lg font-semibold">現在の状態</h2>
			<CongestionInfo step={congestionStore.currentStep} />
		</div>
	</div>

	<!-- 凡例 -->
	<div class="mt-6 rounded-lg border border-border bg-card p-4 sm:p-6">
		<h2 class="mb-4 text-lg font-semibold">フェーズの説明</h2>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="flex items-start gap-3">
				<span class="mt-1 h-3 w-3 shrink-0 rounded-full bg-green-500"></span>
				<div>
					<p class="font-medium">スロースタート</p>
					<p class="text-sm text-muted-foreground">
						<Term id="cwnd">cwnd</Term>が<Term id="ssthresh">ssthresh</Term
						>に達するまで指数的に増加
					</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<span class="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-500"></span>
				<div>
					<p class="font-medium">輻輳回避</p>
					<p class="text-sm text-muted-foreground">cwndを線形的（+1/RTT）に増加</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<span class="mt-1 h-3 w-3 shrink-0 rounded-full bg-amber-500"></span>
				<div>
					<p class="font-medium">高速回復</p>
					<p class="text-sm text-muted-foreground">3重複ACK検出後、ssthreshまで急速に減少</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<span class="mt-1 h-3 w-3 shrink-0 rounded-full bg-red-500"></span>
				<div>
					<p class="font-medium">タイムアウト</p>
					<p class="text-sm text-muted-foreground">cwnd=1にリセット、スロースタートから再開</p>
				</div>
			</div>
		</div>
	</div>

	<!-- 学習ポイント -->
	<div class="mt-6 rounded-lg border border-dashed border-border bg-background p-4 sm:p-6">
		<h3 class="mb-3 text-sm font-semibold">輻輳制御アルゴリズムについて</h3>
		<div class="space-y-3 text-sm text-muted-foreground">
			<p>
				<strong><Term id="congestion-control">輻輳制御</Term></strong
				>は、ネットワークの混雑を検知して送信量を調整することで、ネットワーク全体の効率を維持する仕組みです。
			</p>
			<div class="rounded bg-muted p-3">
				<p class="mb-2 font-medium text-foreground">主要なアルゴリズム</p>
				<ul class="list-inside list-disc space-y-1">
					<li>
						<strong>スロースタート</strong>: 接続開始時、cwndを1から始めて指数的に増加させます
					</li>
					<li>
						<strong>輻輳回避</strong>: ssthreshに達したら、cwndを線形的に（RTTごとに+1）増加させます
					</li>
					<li>
						<strong>高速再送・高速回復</strong>:
						3つの重複ACKを受信するとパケットロスと判断し、即座に再送を行います
					</li>
				</ul>
			</div>
			<p>
				パケットロスが発生すると、ssthreshを現在のcwndの半分に設定し、cwndを減少させてネットワークの混雑を緩和します。
			</p>
		</div>
	</div>
</div>

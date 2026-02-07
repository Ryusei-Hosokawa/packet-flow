<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { packetLossStore } from '$lib/stores/packetLossStore.svelte';
	import {
		PacketLossVisualization,
		PacketLossControls,
		PacketLossLog
	} from '$lib/components/visualizations/packet-loss';
	import Term from '$lib/components/ui/Term.svelte';

	onMount(() => {
		packetLossStore.init();
	});

	onDestroy(() => {
		packetLossStore.stop();
	});
</script>

<svelte:head>
	<title>パケットロスシミュレーション - PacketFlow</title>
</svelte:head>

<div class="container mx-auto w-full px-4 py-8">
	<h1 class="mb-2 text-2xl font-bold sm:text-3xl">パケットロスシミュレーション</h1>
	<p class="mb-6 text-muted-foreground">
		パケットの送信、損失、<Term id="retransmission">再送</Term>の仕組みを視覚的に理解しましょう
	</p>

	<!-- 可視化エリア -->
	<div class="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
		<PacketLossVisualization packets={packetLossStore.packets} acks={packetLossStore.acks} />
	</div>

	<!-- コントロール & ログ -->
	<div class="mb-6 grid gap-6 md:grid-cols-2">
		<!-- コントロール -->
		<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
			<h2 class="mb-4 text-lg font-semibold">コントロール</h2>
			<PacketLossControls />
		</div>

		<!-- ログ -->
		<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
			<h2 class="mb-4 text-lg font-semibold">イベントログ</h2>
			<PacketLossLog logs={packetLossStore.logs} />
		</div>
	</div>

	<!-- TCPの再送メカニズム説明 -->
	<div class="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
		<h2 class="mb-4 text-lg font-semibold">TCPの再送メカニズム</h2>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<div class="rounded-lg bg-muted p-4">
				<div class="mb-2 flex items-center gap-2">
					<span class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">1</span>
					<h3 class="font-medium">パケット送信</h3>
				</div>
				<p class="text-sm text-muted-foreground">
					送信者がシーケンス番号付きのパケットを送信します。
				</p>
			</div>

			<div class="rounded-lg bg-muted p-4">
				<div class="mb-2 flex items-center gap-2">
					<span class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">2</span>
					<h3 class="font-medium">ACK返信</h3>
				</div>
				<p class="text-sm text-muted-foreground">
					受信者がパケットを受け取ると、<Term id="ack">ACK</Term>を送信者に返します。
				</p>
			</div>

			<div class="rounded-lg bg-muted p-4">
				<div class="mb-2 flex items-center gap-2">
					<span class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">3</span>
					<h3 class="font-medium">パケットロス</h3>
				</div>
				<p class="text-sm text-muted-foreground">
					ネットワークの混雑やエラーでパケットが失われることがあります。
				</p>
			</div>

			<div class="rounded-lg bg-muted p-4">
				<div class="mb-2 flex items-center gap-2">
					<span class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">4</span>
					<h3 class="font-medium">タイムアウト検出</h3>
				</div>
				<p class="text-sm text-muted-foreground">
					ACKが一定時間内に届かないと、パケットロスと判断します。
				</p>
			</div>

			<div class="rounded-lg bg-muted p-4">
				<div class="mb-2 flex items-center gap-2">
					<span class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">5</span>
					<h3 class="font-medium">再送</h3>
				</div>
				<p class="text-sm text-muted-foreground">
					ロストしたパケットを再度送信し、信頼性を確保します。
				</p>
			</div>

			<div class="rounded-lg bg-muted p-4">
				<div class="mb-2 flex items-center gap-2">
					<span class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">6</span>
					<h3 class="font-medium">配達完了</h3>
				</div>
				<p class="text-sm text-muted-foreground">
					最終的にすべてのパケットが正しく届きます。
				</p>
			</div>
		</div>
	</div>

	<!-- 学習ポイント -->
	<div class="rounded-lg border border-dashed border-border bg-background p-4 sm:p-6">
		<h3 class="mb-3 text-sm font-semibold">パケットロスと再送について</h3>
		<div class="space-y-3 text-sm text-muted-foreground">
			<p>
				<strong>パケットロス</strong
				>は、ネットワークの混雑、ルーターのバッファオーバーフロー、物理的なエラーなどで発生します。<Term id="tcp">TCP</Term
				>はこれを検出し、自動的に再送することで信頼性のある通信を実現します。
			</p>

			<div class="rounded bg-muted p-3">
				<p class="mb-2 font-medium text-foreground">再送のトリガー</p>
				<ul class="list-inside list-disc space-y-1">
					<li>
						<strong>タイムアウト</strong>: <Term id="rto">RTO</Term
						>（再送タイムアウト）内にACKが届かない場合
					</li>
					<li>
						<strong>3重複ACK</strong>: 同じACKを3回連続で受信した場合（高速再送）
					</li>
				</ul>
			</div>

			<p>
				パケットロス率が高いと、再送が増えて通信効率が低下します。また、<Term
					id="congestion-control">輻輳制御</Term
				>アルゴリズムはパケットロスをネットワーク混雑のシグナルとして利用し、送信速度を調整します。
			</p>
		</div>
	</div>
</div>

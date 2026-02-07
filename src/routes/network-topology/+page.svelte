<script lang="ts">
	import { onMount } from 'svelte';
	import { topologyStore } from '$lib/stores/topologyStore.svelte';
	import { TopologyGraph, NodeDetails } from '$lib/components/visualizations/topology';
	import Term from '$lib/components/ui/Term.svelte';

	onMount(() => {
		topologyStore.loadPreset('simple');
	});

	function handlePresetChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		topologyStore.loadPreset(select.value);
	}
</script>

<svelte:head>
	<title>ネットワークトポロジー - PacketFlow</title>
</svelte:head>

<div class="container mx-auto w-full px-4 py-8">
	<h1 class="mb-2 text-2xl font-bold sm:text-3xl">ネットワークトポロジー可視化</h1>
	<p class="mb-6 text-muted-foreground">
		ネットワーク構成を視覚的に確認し、パケットの流れをシミュレートします
	</p>

	<!-- コントロールパネル -->
	<div class="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
		<div class="flex items-center gap-2">
			<label for="preset" class="text-sm font-medium">プリセット:</label>
			<select
				id="preset"
				value={topologyStore.currentPreset}
				onchange={handlePresetChange}
				class="rounded-md border border-input bg-background px-3 py-2 text-sm"
			>
				{#each Object.entries(topologyStore.presets) as [id, preset]}
					<option value={id}>{preset.name}</option>
				{/each}
			</select>
		</div>

		<button
			onclick={topologyStore.runDemo}
			disabled={topologyStore.isAnimating}
			class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
		>
			{topologyStore.isAnimating ? 'アニメーション中...' : 'デモ再生'}
		</button>

		{#if topologyStore.isAnimating}
			<button
				onclick={topologyStore.stopAnimation}
				class="rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
			>
				停止
			</button>
		{/if}
	</div>

	<!-- トポロジーグラフ -->
	<div class="mb-6">
		<TopologyGraph
			nodes={topologyStore.nodes}
			links={topologyStore.links}
			packets={topologyStore.packets}
			selectedNodeId={topologyStore.selectedNodeId}
			onNodeSelect={topologyStore.selectNode}
		/>
	</div>

	<!-- ノード詳細 & 凡例 -->
	<div class="grid gap-6 md:grid-cols-2">
		<!-- 選択ノード詳細 -->
		<div>
			<h2 class="mb-3 text-lg font-semibold">ノード詳細</h2>
			<NodeDetails node={topologyStore.selectedNode} />
		</div>

		<!-- 凡例 -->
		<div>
			<h2 class="mb-3 text-lg font-semibold">凡例</h2>
			<div class="rounded-lg border border-border bg-card p-4">
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<div class="flex items-center gap-2">
						<span>💻</span>
						<span class="text-sm">クライアント</span>
					</div>
					<div class="flex items-center gap-2">
						<span>🖥️</span>
						<span class="text-sm">サーバー</span>
					</div>
					<div class="flex items-center gap-2">
						<span>🔀</span>
						<span class="text-sm"><Term id="router">ルーター</Term></span>
					</div>
					<div class="flex items-center gap-2">
						<span>🔌</span>
						<span class="text-sm">スイッチ</span>
					</div>
					<div class="flex items-center gap-2">
						<span>🛡️</span>
						<span class="text-sm">ファイアウォール</span>
					</div>
					<div class="flex items-center gap-2">
						<span>🌐</span>
						<span class="text-sm">インターネット</span>
					</div>
				</div>

				<div class="mt-4 border-t border-border pt-4">
					<p class="mb-2 text-sm font-medium">パケットの種類</p>
					<div class="flex flex-wrap gap-4">
						<div class="flex items-center gap-2">
							<span class="h-3 w-3 rounded-full bg-blue-500"></span>
							<span class="text-sm">リクエスト</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="h-3 w-3 rounded-full bg-green-500"></span>
							<span class="text-sm">レスポンス</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="h-3 w-3 rounded-full bg-amber-500"></span>
							<span class="text-sm">データ</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 学習ポイント -->
	<div class="mt-6 rounded-lg border border-dashed border-border bg-background p-4 sm:p-6">
		<h3 class="mb-3 text-sm font-semibold">ネットワークトポロジーについて</h3>
		<div class="space-y-3 text-sm text-muted-foreground">
			<p>
				<strong>ネットワークトポロジー</strong
				>は、ネットワーク機器の接続構成を示します。物理的な配置と論理的なデータの流れを理解することで、ネットワークの設計やトラブルシューティングに役立ちます。
			</p>
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="rounded bg-muted p-3">
					<p class="mb-1 font-medium text-foreground">ルーティング</p>
					<p>
						<Term id="router">ルーター</Term
						>は宛先<Term id="ip-address">IPアドレス</Term
						>を見て、パケットを次のホップに転送します。
					</p>
				</div>
				<div class="rounded bg-muted p-3">
					<p class="mb-1 font-medium text-foreground">スイッチング</p>
					<p>
						L2スイッチは<Term id="mac-address">MACアドレス</Term
						>を学習し、適切なポートにフレームを転送します。
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

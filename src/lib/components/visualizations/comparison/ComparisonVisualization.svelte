<script lang="ts">
	import {
		comparisonStore,
		COMPARISON_DATA,
		USE_CASES
	} from '$lib/stores/comparisonStore.svelte';
	import Term from '$lib/components/ui/Term.svelte';
</script>

<div class="space-y-6 sm:space-y-8">
	<!-- 概要カード -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
		<!-- TCP概要 -->
		<button
			type="button"
			onclick={() =>
				comparisonStore.selectProtocol(
					comparisonStore.selectedProtocol === 'tcp' ? null : 'tcp'
				)}
			class="cursor-pointer rounded-xl bg-card p-4 text-left transition-all duration-200 sm:p-6 {comparisonStore.selectedProtocol ===
			'tcp'
				? 'border-2 border-foreground'
				: 'border-2 border-border hover:border-foreground/50'}"
		>
			<div class="mb-3 flex items-center gap-3">
				<span class="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background sm:h-12 sm:w-12">
					TCP
				</span>
				<div>
					<h3 class="text-sm font-semibold sm:text-base">Transmission Control Protocol</h3>
					<p class="text-xs text-muted-foreground sm:text-sm">信頼性重視</p>
				</div>
			</div>
			<p class="text-xs leading-relaxed text-muted-foreground sm:text-sm">
				<Term id="three-way-handshake">3ウェイハンドシェイク</Term>による接続確立、<Term
					id="ack">確認応答</Term
				>、<Term id="retransmission">再送制御</Term>により確実にデータを届ける。
			</p>
		</button>

		<!-- UDP概要 -->
		<button
			type="button"
			onclick={() =>
				comparisonStore.selectProtocol(
					comparisonStore.selectedProtocol === 'udp' ? null : 'udp'
				)}
			class="cursor-pointer rounded-xl bg-card p-4 text-left transition-all duration-200 sm:p-6 {comparisonStore.selectedProtocol ===
			'udp'
				? 'border-2 border-foreground'
				: 'border-2 border-border hover:border-foreground/50'}"
		>
			<div class="mb-3 flex items-center gap-3">
				<span class="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-foreground bg-background text-sm font-bold text-foreground sm:h-12 sm:w-12">
					UDP
				</span>
				<div>
					<h3 class="text-sm font-semibold sm:text-base">User Datagram Protocol</h3>
					<p class="text-xs text-muted-foreground sm:text-sm">速度重視</p>
				</div>
			</div>
			<p class="text-xs leading-relaxed text-muted-foreground sm:text-sm">
				<Term id="connectionless">コネクションレス</Term
				>で高速にデータを送信。リアルタイム性が重要な用途に最適。
			</p>
		</button>
	</div>

	<!-- 比較表 -->
	<div class="overflow-x-auto rounded-xl border border-border bg-card">
		<table class="w-full min-w-[400px]">
			<thead>
				<tr class="bg-muted text-sm font-semibold">
					<th class="border-r border-border px-3 py-3 text-left sm:px-4">項目</th>
					<th class="border-r border-border px-3 py-3 text-left sm:px-4">TCP</th>
					<th class="px-3 py-3 text-left sm:px-4">UDP</th>
				</tr>
			</thead>
			<tbody>
				{#each COMPARISON_DATA as item, index}
					<tr
						class="cursor-pointer transition-colors duration-200 {comparisonStore.highlightedCategory ===
						item.category
							? 'bg-muted'
							: index % 2 === 0
								? 'bg-background'
								: 'bg-card'} hover:bg-muted/50"
						onclick={() =>
							comparisonStore.highlightCategory(
								comparisonStore.highlightedCategory === item.category ? null : item.category
							)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								comparisonStore.highlightCategory(
									comparisonStore.highlightedCategory === item.category ? null : item.category
								);
							}
						}}
						tabindex="0"
						role="button"
					>
						<td class="border-r border-border px-3 py-3 text-xs font-medium sm:px-4 sm:text-sm">
							{item.category}
						</td>
						<td
							class="border-r border-border px-3 py-3 text-xs sm:px-4 sm:text-sm {comparisonStore.selectedProtocol ===
								'tcp' || comparisonStore.selectedProtocol === null
								? 'text-foreground'
								: 'text-muted-foreground'}"
						>
							{item.tcp}
						</td>
						<td
							class="px-3 py-3 text-xs sm:px-4 sm:text-sm {comparisonStore.selectedProtocol ===
								'udp' || comparisonStore.selectedProtocol === null
								? 'text-foreground'
								: 'text-muted-foreground'}"
						>
							{item.udp}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- 選択された項目の説明 -->
	{#if comparisonStore.highlightedCategory}
		{@const selectedItem = COMPARISON_DATA.find(
			(item) => item.category === comparisonStore.highlightedCategory
		)}
		{#if selectedItem}
			<div class="rounded-lg border border-border bg-muted p-4">
				<h4 class="mb-2 text-sm font-semibold">{selectedItem.category}について</h4>
				<p class="text-xs leading-relaxed text-muted-foreground sm:text-sm">
					{selectedItem.description}
				</p>
			</div>
		{/if}
	{/if}

	<!-- ユースケース -->
	<div>
		<h3 class="mb-4 text-base font-semibold sm:text-lg">主なユースケース</h3>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
			<!-- TCPユースケース -->
			<div>
				<h4 class="mb-3 text-sm font-semibold">TCP を使用するサービス</h4>
				<div class="flex flex-col gap-2">
					{#each comparisonStore.tcpUseCases as useCase}
						<div
							class="rounded-lg border border-border bg-card p-3 transition-opacity duration-200 {comparisonStore.selectedProtocol ===
							'udp'
								? 'opacity-50'
								: 'opacity-100'}"
						>
							<div class="mb-1 text-sm font-medium">{useCase.name}</div>
							<div class="text-xs text-muted-foreground">{useCase.description}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- UDPユースケース -->
			<div>
				<h4 class="mb-3 text-sm font-semibold">UDP を使用するサービス</h4>
				<div class="flex flex-col gap-2">
					{#each comparisonStore.udpUseCases as useCase}
						<div
							class="rounded-lg border border-border bg-card p-3 transition-opacity duration-200 {comparisonStore.selectedProtocol ===
							'tcp'
								? 'opacity-50'
								: 'opacity-100'}"
						>
							<div class="mb-1 text-sm font-medium">{useCase.name}</div>
							<div class="text-xs text-muted-foreground">{useCase.description}</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- リセットボタン -->
	{#if comparisonStore.selectedProtocol || comparisonStore.highlightedCategory}
		<button
			type="button"
			onclick={() => comparisonStore.reset()}
			class="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
		>
			選択をリセット
		</button>
	{/if}

	<!-- まとめ -->
	<div class="rounded-xl border border-border bg-card p-4 sm:p-6">
		<h3 class="mb-4 text-sm font-semibold sm:text-base">まとめ：どちらを選ぶ？</h3>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="rounded-lg border border-border bg-muted p-4">
				<h4 class="mb-2 font-semibold">TCPを選ぶ場合</h4>
				<ul class="list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
					<li>データの完全性が重要</li>
					<li><Term id="sequence-number">シーケンス番号</Term>による順序制御が必要</li>
					<li>多少の遅延は許容できる</li>
				</ul>
			</div>
			<div class="rounded-lg border border-border bg-muted p-4">
				<h4 class="mb-2 font-semibold">UDPを選ぶ場合</h4>
				<ul class="list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
					<li>リアルタイム性が重要</li>
					<li>多少の<Term id="datagram">データグラム</Term>欠落は許容できる</li>
					<li><Term id="broadcast">ブロードキャスト</Term>が必要</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- 学習ポイント -->
	<div class="rounded-lg border border-dashed border-border bg-background p-3">
		<div class="mb-2 text-xs font-medium text-foreground">💡 学習ポイント</div>
		<p class="text-xs leading-relaxed text-muted-foreground">
			{#if comparisonStore.selectedProtocol === 'tcp'}
				TCPは<Term id="connection-oriented">コネクション型</Term
				>プロトコルで、<Term id="three-way-handshake">3ウェイハンドシェイク</Term
				>で接続を確立します。<Term id="sequence-number">シーケンス番号</Term>と<Term id="ack-number"
					>ACK番号</Term
				>を使ってデータの順序と到達を保証し、<Term id="flow-control">フロー制御</Term
				>や<Term id="congestion-control">輻輳制御</Term>も行います。
			{:else if comparisonStore.selectedProtocol === 'udp'}
				UDPは<Term id="connectionless">コネクションレス型</Term
				>プロトコルで、接続確立なしにすぐデータを送信できます。<Term id="checksum">チェックサム</Term
				>による最低限のエラー検出はありますが、<Term id="retransmission">再送</Term
				>や順序制御は行いません。そのためオーバーヘッドが少なく高速です。
			{:else if comparisonStore.highlightedCategory === '接続方式'}
				TCPの<Term id="connection-oriented">コネクション型</Term
				>通信は、通話のように「もしもし」「はい」とやり取りしてから会話を始めます。UDPの<Term
					id="connectionless">コネクションレス型</Term
				>通信は、郵便のように一方的に送りつけます。
			{:else if comparisonStore.highlightedCategory === '信頼性'}
				TCPは<Term id="ack">確認応答</Term>と<Term id="retransmission">再送制御</Term
				>でデータの到達を保証します。UDPは「送りっぱなし」で、<Term id="packet">パケット</Term
				>が届いたかどうかは上位層のアプリケーションで対応します。
			{:else if comparisonStore.highlightedCategory === '順序制御'}
				TCPは<Term id="sequence-number">シーケンス番号</Term
				>を使って送信順にデータを並べ替えます。ネットワーク経路の違いで順番が入れ替わっても、受信側で正しい順序に復元できます。
			{:else if comparisonStore.highlightedCategory === 'フロー制御'}
				TCPの<Term id="flow-control">フロー制御</Term>は、<Term id="window-size"
					>ウィンドウサイズ</Term
				>を使って受信側の処理能力に合わせてデータ送信量を調整します。受信バッファが溢れるのを防ぎます。
			{:else if comparisonStore.highlightedCategory === '速度'}
				UDPは接続確立や確認応答のオーバーヘッドがないため高速です。<Term id="segment"
					>セグメント</Term
				>あたりのヘッダも8バイトとTCPの20バイト以上に比べて小さくなっています。
			{:else}
				TCPとUDPはどちらも<Term id="transport-layer">トランスポート層</Term>の<Term id="protocol"
					>プロトコル</Term
				>です。<Term id="port">ポート番号</Term
				>を使ってアプリケーションを識別する点は共通ですが、信頼性と速度のトレードオフが異なります。
			{/if}
		</p>
	</div>
</div>

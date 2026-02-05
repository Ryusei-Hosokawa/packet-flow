<script lang="ts">
	import {
		comparisonStore,
		COMPARISON_DATA,
		USE_CASES
	} from '$lib/stores/comparisonStore.svelte';
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
				接続確立、確認応答、再送制御により確実にデータを届ける。
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
				接続確立なしで高速にデータを送信。リアルタイム性が重要な用途に最適。
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
					<li>順序通りに届く必要がある</li>
					<li>多少の遅延は許容できる</li>
				</ul>
			</div>
			<div class="rounded-lg border border-border bg-muted p-4">
				<h4 class="mb-2 font-semibold">UDPを選ぶ場合</h4>
				<ul class="list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
					<li>リアルタイム性が重要</li>
					<li>多少のデータ欠落は許容できる</li>
					<li>ブロードキャストが必要</li>
				</ul>
			</div>
		</div>
	</div>
</div>

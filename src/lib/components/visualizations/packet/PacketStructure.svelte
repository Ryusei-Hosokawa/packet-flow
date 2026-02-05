<script lang="ts">
	import { packetStore } from '$lib/stores/packetStore.svelte';
	import type { HeaderType } from '$lib/types/packet';
	import HeaderFieldComponent from './HeaderField.svelte';
	import FieldDetails from './FieldDetails.svelte';

	// 行ごとにフィールドをグループ化
	const fieldsByRow = $derived(() => {
		const rows: Map<number, typeof packetStore.currentHeader.fields> = new Map();
		for (const field of packetStore.currentHeader.fields) {
			const existing = rows.get(field.row) ?? [];
			rows.set(field.row, [...existing, field]);
		}
		return rows;
	});

	const rowCount = $derived(Math.max(...packetStore.currentHeader.fields.map((f) => f.row)) + 1);

	const headers: { type: HeaderType; label: string }[] = [
		{ type: 'ip', label: 'IPv4' },
		{ type: 'tcp', label: 'TCP' },
		{ type: 'udp', label: 'UDP' }
	];
</script>

<div class="space-y-6">
	<!-- ヘッダタイプ切り替えタブ -->
	<div class="flex w-fit gap-2 rounded-lg bg-muted p-1">
		{#each headers as header}
			<button
				type="button"
				onclick={() => packetStore.setHeader(header.type)}
				class="rounded-md border-none px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 {packetStore.selectedHeader ===
				header.type
					? 'bg-background text-foreground shadow-sm'
					: 'bg-transparent text-muted-foreground'}"
			>
				{header.label}
			</button>
		{/each}
	</div>

	<!-- メインコンテンツ -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
		<!-- 左: ヘッダ図 -->
		<div class="flex flex-col gap-4">
			<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
				<div class="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
					<h3 class="text-sm font-semibold sm:text-base">
						{packetStore.currentHeader.nameJa}
					</h3>
					<span class="text-xs text-muted-foreground">
						{packetStore.currentHeader.totalBits} bits ({packetStore.currentHeader.totalBits / 8} bytes)
					</span>
				</div>

				<!-- ビットスケール（モバイルでは非表示） -->
				<div class="mb-1 hidden px-0.5 md:flex">
					{#each Array(32) as _, i}
						{#if i % 8 === 0}
							<span class="flex-1 text-left text-[10px] text-muted-foreground">
								{i}
							</span>
						{:else if i === 31}
							<span class="flex-1 text-right text-[10px] text-muted-foreground">
								31
							</span>
						{:else}
							<span class="flex-1"></span>
						{/if}
					{/each}
				</div>

				<!-- フィールド図 -->
				<div class="flex flex-col overflow-hidden rounded-md border border-border">
					{#each Array(rowCount) as _, rowIndex}
						{@const rowFields = fieldsByRow().get(rowIndex) ?? []}
						<div class="flex {rowIndex < rowCount - 1 ? 'border-b border-border' : ''}">
							{#each rowFields as field}
								<HeaderFieldComponent
									{field}
									isSelected={packetStore.selectedFieldId === field.id}
									bitsPerRow={packetStore.currentHeader.bitsPerRow}
									onclick={() => packetStore.selectField(field.id)}
								/>
							{/each}
						</div>
					{/each}
				</div>

				<!-- データ部分（オプション） -->
				<div class="mt-2 rounded-md border-2 border-dashed border-border p-4 text-center text-sm text-muted-foreground">
					Data (ペイロード)
				</div>
			</div>

			<!-- リセットボタン -->
			<button
				type="button"
				onclick={() => packetStore.reset()}
				class="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
			>
				選択をリセット
			</button>
		</div>

		<!-- 右: 詳細パネル -->
		<div class="flex flex-col gap-4">
			<FieldDetails field={packetStore.selectedField} />

			<!-- ヘッダの概要 -->
			<div class="rounded-lg border border-border bg-muted p-4">
				<h4 class="mb-2 text-sm font-semibold">
					{packetStore.currentHeader.name} 概要
				</h4>
				{#if packetStore.selectedHeader === 'ip'}
					<p class="text-xs leading-relaxed text-muted-foreground">
						IPv4ヘッダは最小20バイト（オプションなし）で、送信元/宛先IPアドレス、TTL、プロトコル番号などを含みます。
						ネットワーク層で動作し、パケットのルーティングに必要な情報を提供します。
					</p>
				{:else if packetStore.selectedHeader === 'tcp'}
					<p class="text-xs leading-relaxed text-muted-foreground">
						TCPヘッダは最小20バイト（オプションなし）で、ポート番号、シーケンス番号、確認応答番号、フラグなどを含みます。
						トランスポート層で動作し、信頼性のある通信を提供します。
					</p>
				{:else}
					<p class="text-xs leading-relaxed text-muted-foreground">
						UDPヘッダはわずか8バイトで、ポート番号、長さ、チェックサムのみを含みます。
						TCPより軽量で、リアルタイム通信やDNSなど、速度重視の通信に使用されます。
					</p>
				{/if}
			</div>

			<!-- フィールド一覧 -->
			<div class="rounded-lg border border-border bg-card p-4">
				<h4 class="mb-3 text-sm font-semibold">フィールド一覧</h4>
				<div class="flex flex-wrap gap-2">
					{#each packetStore.currentHeader.fields as field}
						<button
							type="button"
							onclick={() => packetStore.selectField(field.id)}
							class="cursor-pointer rounded px-2 py-1 text-xs font-medium transition-all duration-200"
							style="border: 1px solid {packetStore.selectedFieldId === field.id
								? field.color
								: 'transparent'}; background: {field.color}15; color: {field.color};"
						>
							{field.name}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

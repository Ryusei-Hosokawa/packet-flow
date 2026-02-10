<script lang="ts">
	import type { OSILayer, TCPIPLayer } from '$lib/types/network';
	import Term from '$lib/components/ui/Term.svelte';

	interface Props {
		osiLayer: OSILayer | null;
		tcpipLayer: TCPIPLayer | null;
	}

	let { osiLayer, tcpipLayer }: Props = $props();

	const hasSelection = $derived(osiLayer !== null || tcpipLayer !== null);
</script>

<div class="min-h-50 rounded-lg border border-border bg-card p-4 sm:p-6">
	{#if !hasSelection}
		<div class="flex min-h-38 items-center justify-center text-muted-foreground">
			<p>レイヤーをクリックして詳細を表示</p>
		</div>
	{:else}
		<div class="flex flex-col gap-6">
			{#if osiLayer}
				<div>
					<div class="mb-3 flex items-center gap-3">
						<span
							class="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
							style="background: {osiLayer.color};"
						>
							{osiLayer.number}
						</span>
						<div>
							<h3 class="text-base font-semibold sm:text-lg">{osiLayer.name}</h3>
							<p class="text-sm text-muted-foreground">{osiLayer.nameJa}</p>
						</div>
						<span class="ml-auto rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
							OSI Layer {osiLayer.number}
						</span>
					</div>

					<p class="text-sm leading-relaxed text-foreground">
						{osiLayer.description}
					</p>

					<div class="mt-4 grid gap-4">
						<div>
							<h4 class="mb-2 text-xs font-semibold text-muted-foreground">
								主な<Term id="protocol">プロトコル</Term>
							</h4>
							<div class="flex flex-wrap gap-2">
								{#each osiLayer.protocols as protocol}
									<span
										class="rounded px-2 py-1 text-xs font-medium"
										style="background: {osiLayer.color}20; color: {osiLayer.color};"
									>
										{protocol}
									</span>
								{/each}
							</div>
						</div>

						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<h4 class="mb-2 text-xs font-semibold text-muted-foreground">
									<Term id="pdu">PDU</Term>（データ単位）
								</h4>
								<span class="rounded bg-muted px-2 py-1 text-xs">
									{osiLayer.pdu}
								</span>
							</div>

							{#if osiLayer.devices.length > 0}
								<div>
									<h4 class="mb-2 text-xs font-semibold text-muted-foreground">関連機器</h4>
									<div class="flex flex-wrap gap-1">
										{#each osiLayer.devices as device}
											<span class="rounded bg-muted px-2 py-1 text-xs">
												{device}
											</span>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- 学習ポイント -->
					<div class="mt-4 rounded-lg border border-dashed border-border bg-background p-3">
						<div class="mb-2 text-xs font-medium text-foreground">💡 学習ポイント</div>
						<p class="text-xs text-muted-foreground">
							{#if osiLayer.number === 7}
								アプリケーション層は、ユーザーが直接触れるソフトウェア（ブラウザ、メールクライアントなど）が動作する層です。<Term
									id="dns">DNS</Term
								>による名前解決もこの層で行われます。
							{:else if osiLayer.number === 6}
								プレゼンテーション層は、データの表現形式を変換します。暗号化・復号化、圧縮・解凍、文字コード変換などを担当します。
							{:else if osiLayer.number === 5}
								セッション層は、通信の開始から終了までの「会話」を管理します。同期点を設けて、障害時の復旧を容易にします。
							{:else if osiLayer.number === 4}
								トランスポート層は、<Term id="port">ポート番号</Term
								>を使ってアプリケーションを識別し、<Term id="segment">セグメント</Term
								>単位でデータを扱います。<Term id="flow-control">フロー制御</Term
								>もこの層で行われます。
							{:else if osiLayer.number === 3}
								ネットワーク層は、<Term id="ip-address">IPアドレス</Term>を使って<Term id="packet"
									>パケット</Term
								>を宛先まで届けます。<Term id="router">ルーター</Term>がこの層で動作します。
							{:else if osiLayer.number === 2}
								データリンク層は、<Term id="mac-address">MACアドレス</Term>を使って同一ネットワーク内の通信を行います。<Term
									id="frame">フレーム</Term
								>単位でデータを扱います。
							{:else if osiLayer.number === 1}
								物理層は、ビット列を電気信号や光信号に変換して物理的に伝送します。ケーブルの種類や通信速度もこの層で定義されます。
							{/if}
						</p>
					</div>
				</div>
			{/if}

			{#if tcpipLayer && !osiLayer}
				<div>
					<div class="mb-3 flex items-center gap-3">
						<span
							class="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
							style="background: {tcpipLayer.color};"
						>
							{tcpipLayer.number}
						</span>
						<div>
							<h3 class="text-base font-semibold sm:text-lg">{tcpipLayer.name}</h3>
							<p class="text-sm text-muted-foreground">{tcpipLayer.nameJa}</p>
						</div>
						<span class="ml-auto rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
							TCP/IP Layer {tcpipLayer.number}
						</span>
					</div>

					<p class="text-sm leading-relaxed text-foreground">
						{tcpipLayer.description}
					</p>

					<div class="mt-4 grid gap-4">
						<div>
							<h4 class="mb-2 text-xs font-semibold text-muted-foreground">
								主な<Term id="protocol">プロトコル</Term>
							</h4>
							<div class="flex flex-wrap gap-2">
								{#each tcpipLayer.protocols as protocol}
									<span
										class="rounded px-2 py-1 text-xs font-medium"
										style="background: {tcpipLayer.color}20; color: {tcpipLayer.color};"
									>
										{protocol}
									</span>
								{/each}
							</div>
						</div>

						<div>
							<h4 class="mb-2 text-xs font-semibold text-muted-foreground">対応するOSI層</h4>
							<div class="flex flex-wrap gap-1">
								{#each tcpipLayer.osiMapping as layerNum}
									<span class="rounded bg-muted px-2 py-1 text-xs">Layer {layerNum}</span>
								{/each}
							</div>
						</div>
					</div>

					<!-- 学習ポイント -->
					<div class="mt-4 rounded-lg border border-dashed border-border bg-background p-3">
						<div class="mb-2 text-xs font-medium text-foreground">💡 学習ポイント</div>
						<p class="text-xs text-muted-foreground">
							{#if tcpipLayer.number === 4}
								TCP/IPモデルのアプリケーション層は、OSIモデルの上位3層（アプリケーション・プレゼンテーション・セッション）を統合したものです。実用的な観点から、これらは1つの層として扱われます。
							{:else if tcpipLayer.number === 3}
								トランスポート層では、<Term id="connection-oriented">コネクション型</Term
								>のTCPと<Term id="connectionless">コネクションレス型</Term
								>のUDPが使い分けられます。用途に応じて適切な<Term id="protocol">プロトコル</Term
								>を選択します。
							{:else if tcpipLayer.number === 2}
								インターネット層は<Term id="ip-address">IPアドレス</Term
								>を使った経路制御を担当します。<Term id="router">ルーター</Term>がこの層で<Term
									id="packet">パケット</Term
								>の転送先を決定します。
							{:else if tcpipLayer.number === 1}
								ネットワークインターフェース層は、OSIモデルの物理層とデータリンク層を統合しています。<Term
									id="mac-address">MACアドレス</Term
								>による通信と物理的な信号伝送を担当します。
							{/if}
						</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

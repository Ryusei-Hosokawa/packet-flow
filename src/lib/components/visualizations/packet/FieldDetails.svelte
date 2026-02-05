<script lang="ts">
	import type { HeaderField } from '$lib/types/packet';
	import Term from '$lib/components/ui/Term.svelte';

	interface Props {
		field: HeaderField | null;
	}

	let { field }: Props = $props();

	// フィールド名と用語IDのマッピング
	const fieldTermMapping: Record<string, string> = {
		'Source Port': 'port',
		'Destination Port': 'port',
		'Sequence Number': 'sequence-number',
		'Acknowledgment Number': 'ack-number',
		'Window Size': 'window-size',
		Checksum: 'checksum',
		TTL: 'ttl',
		Protocol: 'protocol',
		'Source IP': 'ip-address',
		'Destination IP': 'ip-address',
		Length: 'mtu',
		'Header Checksum': 'checksum',
		'Data Offset': 'pdu',
		Flags: 'syn'
	};

	const termId = $derived(field ? fieldTermMapping[field.name] : null);
</script>

<div class="min-h-[180px] rounded-lg border border-border bg-card p-4 sm:p-6">
	{#if !field}
		<div class="flex min-h-[130px] items-center justify-center text-muted-foreground">
			<p>フィールドをクリックして詳細を表示</p>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			<!-- ヘッダ -->
			<div class="flex items-center gap-3">
				<span
					class="rounded-md px-3 py-2 text-sm font-semibold"
					style="background: {field.color}20; color: {field.color};"
				>
					{field.bits} bits
				</span>
				<div>
					<h3 class="text-base font-semibold sm:text-lg">{field.name}</h3>
					<p class="text-sm text-muted-foreground">{field.nameJa}</p>
				</div>
			</div>

			<!-- 説明 -->
			<p class="text-sm leading-relaxed text-foreground">
				{field.description}
			</p>

			<!-- 詳細情報 -->
			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-md bg-muted p-3">
					<h4 class="mb-1 text-xs font-semibold text-muted-foreground">サイズ</h4>
					<p class="font-mono text-sm">
						{field.bits} bits ({(field.bits / 8).toFixed(field.bits % 8 === 0 ? 0 : 1)} bytes)
					</p>
				</div>
				<div class="rounded-md bg-muted p-3">
					<h4 class="mb-1 text-xs font-semibold text-muted-foreground">値の例</h4>
					<p class="font-mono text-sm">
						{field.example}
					</p>
				</div>
			</div>

			<!-- 学習ポイント（フィールドに応じた説明） -->
			<div class="rounded-lg border border-dashed border-border bg-background p-3">
				<div class="mb-2 text-xs font-medium text-foreground">💡 学習ポイント</div>
				<p class="text-xs leading-relaxed text-muted-foreground">
					{#if field.name === 'Source Port' || field.name === 'Destination Port'}
						<Term id="port">ポート番号</Term
						>は0〜65535の範囲で、アプリケーションを識別します。<Term id="well-known-port"
							>ウェルノウンポート</Term
						>（0〜1023）は特定のサービス用に予約されています。
					{:else if field.name === 'Sequence Number'}
						<Term id="sequence-number">シーケンス番号</Term
						>は送信データの順序を管理します。TCPは<Term id="retransmission">再送</Term
						>と組み合わせて、データの信頼性を保証します。
					{:else if field.name === 'Acknowledgment Number'}
						<Term id="ack-number">ACK番号</Term>は「次に期待するデータの<Term id="sequence-number"
							>シーケンス番号</Term
						>」を示し、どこまでデータを受け取ったかを相手に伝えます。
					{:else if field.name === 'Window Size'}
						<Term id="window-size">ウィンドウサイズ</Term>は<Term id="flow-control">フロー制御</Term
						>に使われ、受信側が処理しきれる量だけデータを送るよう調整します。
					{:else if field.name === 'Checksum'}
						<Term id="checksum">チェックサム</Term
						>は通信中のデータ破損を検出します。受信側で計算した値と比較し、一致しなければパケットは破棄されます。
					{:else if field.name === 'TTL'}
						<Term id="ttl">TTL</Term>は<Term id="router">ルーター</Term
						>を通過するたびに1減少し、0になるとパケットは破棄されます。これにより、ルーティングループを防ぎます。
					{:else if field.name === 'Protocol'}
						<Term id="protocol">プロトコル</Term
						>フィールドは上位層のプロトコルを識別します。TCP=6、UDP=17、ICMP=1などの番号が使われます。
					{:else if field.name === 'Source IP' || field.name === 'Destination IP'}
						<Term id="ip-address">IPアドレス</Term>は32ビット（IPv4）で表され、<Term id="router"
							>ルーター</Term
						>がこの情報を使って<Term id="packet">パケット</Term>を正しい宛先に転送します。
					{:else if field.name === 'Flags'}
						フラグには<Term id="syn">SYN</Term>、<Term id="ack">ACK</Term>、<Term id="fin">FIN</Term
						>、<Term id="rst">RST</Term
						>などがあり、接続の状態を制御します。複数のフラグを同時にONにすることもあります。
					{:else if field.name === 'Data Offset'}
						データオフセットはヘッダの長さを示します。オプションフィールドがある場合、ヘッダサイズは可変になります。
					{:else if field.name === 'Length'}
						UDPの長さフィールドには、ヘッダ（8バイト）とペイロードを合わせた全体のサイズが入ります。
					{:else}
						このフィールドは<Term id="packet">パケット</Term
						>の処理や転送に必要な情報を提供します。
					{/if}
				</p>
			</div>
		</div>
	{/if}
</div>

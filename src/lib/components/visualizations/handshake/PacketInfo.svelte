<script lang="ts">
	import type { HandshakeStep } from '$lib/types/animation';
	import Term from '$lib/components/ui/Term.svelte';

	interface Props {
		step: HandshakeStep;
	}

	let { step }: Props = $props();

	interface StepInfo {
		title: string;
		packet: {
			flags: { SYN: number; ACK: number };
			seq: number;
			ack: number;
		} | null;
	}

	const stepDetails: Record<HandshakeStep, StepInfo> = {
		idle: {
			title: '初期状態',
			packet: null
		},
		'syn-sent': {
			title: 'Step 1: SYN送信',
			packet: {
				flags: { SYN: 1, ACK: 0 },
				seq: 1000,
				ack: 0
			}
		},
		'syn-received': {
			title: 'Step 2: SYN+ACK送信',
			packet: {
				flags: { SYN: 1, ACK: 1 },
				seq: 5000,
				ack: 1001
			}
		},
		'ack-sent': {
			title: 'Step 3: ACK送信',
			packet: {
				flags: { SYN: 0, ACK: 1 },
				seq: 1001,
				ack: 5001
			}
		},
		established: {
			title: '接続確立',
			packet: null
		}
	};

	const info = $derived(stepDetails[step]);
</script>

<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
	<h3 class="text-base font-semibold sm:text-lg">{info.title}</h3>

	<!-- ステップ別の説明（用語ツールチップ付き） -->
	<div class="mt-2 text-sm leading-relaxed text-muted-foreground">
		{#if step === 'idle'}
			<p>
				クライアントは接続待ち、サーバーは<Term id="listen">LISTEN状態</Term
				>で待機しています。再生ボタンを押すか、ステップボタンで進めてください。
			</p>
		{:else if step === 'syn-sent'}
			<p>
				クライアントがサーバーに「接続したい」というリクエストを送信します。<Term id="syn"
					>SYNフラグ</Term
				>をONにし、自分の<Term id="isn">初期シーケンス番号（ISN）</Term>を伝えます。
			</p>
		{:else if step === 'syn-received'}
			<p>
				サーバーがクライアントの<Term id="syn">SYN</Term
				>を受け取り、「OK、接続しましょう」と返答します。<Term id="syn">SYN</Term>と<Term id="ack"
					>ACK</Term
				>の両方をONにし、サーバーの<Term id="isn">初期シーケンス番号</Term
				>と、クライアントのSeq+1を<Term id="ack-number">ACK番号</Term>として返します。
			</p>
		{:else if step === 'ack-sent'}
			<p>
				クライアントがサーバーのSYN+<Term id="ack">ACK</Term
				>を受け取り、最後の確認応答を送ります。これでクライアント側は<Term id="established"
					>接続確立状態</Term
				>になります。
			</p>
		{:else if step === 'established'}
			<p>
				サーバーが<Term id="ack">ACK</Term>を受け取り、両者とも<Term id="established"
					>ESTABLISHED状態</Term
				>になりました。これで<Term id="connection-oriented">TCP接続</Term
				>が確立し、データ通信を開始できます。
			</p>
		{/if}
	</div>

	{#if info.packet}
		<div class="mt-4 rounded-lg bg-muted p-3 sm:p-4">
			<div class="mb-2 text-xs font-medium text-muted-foreground">パケット情報</div>
			<div class="grid gap-2 font-mono text-sm">
				<div class="flex justify-between">
					<span class="text-muted-foreground">
						<Term id="syn">フラグ</Term>:
					</span>
					<span>
						<Term id="syn">SYN</Term>=<span
							class={info.packet.flags.SYN ? 'font-bold text-blue-500' : ''}
							>{info.packet.flags.SYN}</span
						>, <Term id="ack">ACK</Term>=<span
							class={info.packet.flags.ACK ? 'font-bold text-green-500' : ''}
							>{info.packet.flags.ACK}</span
						>
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">
						<Term id="sequence-number">Seq番号</Term>:
					</span>
					<span>{info.packet.seq}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">
						<Term id="ack-number">Ack番号</Term>:
					</span>
					<span>{info.packet.ack}</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- 追加の学習ポイント -->
	<div class="mt-4 rounded-lg border border-dashed border-border bg-background p-3">
		<div class="mb-2 text-xs font-medium text-foreground">💡 学習ポイント</div>
		{#if step === 'idle'}
			<p class="text-xs text-muted-foreground">
				<Term id="three-way-handshake">3ウェイハンドシェイク</Term
				>は、TCPの信頼性を確保するための重要な手順です。この手順により、双方向の通信が可能であることを確認します。
			</p>
		{:else if step === 'syn-sent'}
			<p class="text-xs text-muted-foreground">
				<Term id="isn">ISN（初期シーケンス番号）</Term
				>はセキュリティ上の理由からランダムな値が選ばれます。これにより、過去の接続のパケットが誤って受け入れられることを防ぎます。
			</p>
		{:else if step === 'syn-received'}
			<p class="text-xs text-muted-foreground">
				サーバーは<Term id="ack-number">ACK番号</Term
				>にクライアントのSeq+1を設定します。これは「あなたのシーケンス番号Xまで受け取りました。次はX+1から送ってください」という意味です。
			</p>
		{:else if step === 'ack-sent'}
			<p class="text-xs text-muted-foreground">
				この時点でクライアントは<Term id="established">ESTABLISHED</Term
				>状態になりますが、サーバーはまだACKを受け取っていないため、SYN_RCVD状態のままです。
			</p>
		{:else if step === 'established'}
			<p class="text-xs text-muted-foreground">
				接続確立後、<Term id="sequence-number">シーケンス番号</Term>と<Term id="ack-number"
					>ACK番号</Term
				>を使って、送信したデータが正しく届いたかを確認しながら通信を行います。これが<Term
					id="connection-oriented">TCPの信頼性</Term
				>の基盤です。
			</p>
		{/if}
	</div>
</div>

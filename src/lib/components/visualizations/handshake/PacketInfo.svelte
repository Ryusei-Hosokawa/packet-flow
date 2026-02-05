<script lang="ts">
	import type { HandshakeStep } from '$lib/types/animation';

	interface Props {
		step: HandshakeStep;
	}

	let { step }: Props = $props();

	interface StepInfo {
		title: string;
		description: string;
		packet: {
			flags: { SYN: number; ACK: number };
			seq: number;
			ack: number;
		} | null;
	}

	const stepDetails: Record<HandshakeStep, StepInfo> = {
		idle: {
			title: '初期状態',
			description:
				'クライアントは接続待ち、サーバーはLISTEN状態で待機しています。再生ボタンを押すか、ステップボタンで進めてください。',
			packet: null
		},
		'syn-sent': {
			title: 'Step 1: SYN送信',
			description:
				'クライアントがサーバーに「接続したい」というリクエストを送信します。SYNフラグをONにし、自分の初期シーケンス番号を伝えます。',
			packet: {
				flags: { SYN: 1, ACK: 0 },
				seq: 1000,
				ack: 0
			}
		},
		'syn-received': {
			title: 'Step 2: SYN+ACK送信',
			description:
				'サーバーがクライアントのSYNを受け取り、「OK、接続しましょう」と返答します。SYNとACKの両方をONにし、サーバーの初期シーケンス番号と、クライアントのSeq+1をAck番号として返します。',
			packet: {
				flags: { SYN: 1, ACK: 1 },
				seq: 5000,
				ack: 1001
			}
		},
		'ack-sent': {
			title: 'Step 3: ACK送信',
			description:
				'クライアントがサーバーのSYN+ACKを受け取り、最後の確認応答を送ります。これでクライアント側は接続確立状態になります。',
			packet: {
				flags: { SYN: 0, ACK: 1 },
				seq: 1001,
				ack: 5001
			}
		},
		established: {
			title: '接続確立',
			description:
				'サーバーがACKを受け取り、両者ともESTABLISHED状態になりました。これでTCP接続が確立し、データ通信を開始できます。',
			packet: null
		}
	};

	const info = $derived(stepDetails[step]);
</script>

<div class="rounded-lg border border-border bg-card p-4 sm:p-6">
	<h3 class="text-base font-semibold sm:text-lg">{info.title}</h3>
	<p class="mt-2 text-sm text-muted-foreground">{info.description}</p>

	{#if info.packet}
		<div class="mt-4 grid gap-2 rounded-lg bg-muted p-3 font-mono text-sm sm:p-4">
			<div class="flex justify-between">
				<span class="text-muted-foreground">フラグ:</span>
				<span>
					SYN=<span class={info.packet.flags.SYN ? 'font-bold text-blue-500' : ''}
						>{info.packet.flags.SYN}</span
					>, ACK=<span class={info.packet.flags.ACK ? 'font-bold text-green-500' : ''}
						>{info.packet.flags.ACK}</span
					>
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Seq番号:</span>
				<span>{info.packet.seq}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Ack番号:</span>
				<span>{info.packet.ack}</span>
			</div>
		</div>
	{/if}
</div>

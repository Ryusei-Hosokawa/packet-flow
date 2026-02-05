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

<div style="padding: 1.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--card);">
	<h3 style="font-size: 1.125rem; font-weight: 600;">{info.title}</h3>
	<p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--muted-foreground);">{info.description}</p>

	{#if info.packet}
		<div style="margin-top: 1rem; padding: 1rem; border-radius: 0.5rem; background: var(--muted); font-family: monospace; font-size: 0.875rem;">
			<div style="display: grid; gap: 0.5rem;">
				<div style="display: flex; justify-content: space-between;">
					<span style="color: var(--muted-foreground);">フラグ:</span>
					<span>
						SYN=<span style="color: {info.packet.flags.SYN ? '#3b82f6' : 'inherit'}; font-weight: {info.packet.flags.SYN ? 'bold' : 'normal'};">{info.packet.flags.SYN}</span>,
						ACK=<span style="color: {info.packet.flags.ACK ? '#22c55e' : 'inherit'}; font-weight: {info.packet.flags.ACK ? 'bold' : 'normal'};">{info.packet.flags.ACK}</span>
					</span>
				</div>
				<div style="display: flex; justify-content: space-between;">
					<span style="color: var(--muted-foreground);">Seq番号:</span>
					<span>{info.packet.seq}</span>
				</div>
				<div style="display: flex; justify-content: space-between;">
					<span style="color: var(--muted-foreground);">Ack番号:</span>
					<span>{info.packet.ack}</span>
				</div>
			</div>
		</div>
	{/if}
</div>

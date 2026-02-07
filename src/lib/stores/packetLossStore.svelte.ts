/**
 * パケットロスシミュレーション用ストア
 *
 * パケットの送信、損失、再送を視覚的にシミュレートします。
 */

// パケットの状態
export type PacketStatus = 'sending' | 'delivered' | 'lost' | 'retransmitting' | 'acked';

// パケット
export interface Packet {
	id: number;
	sequenceNumber: number;
	status: PacketStatus;
	attempt: number; // 送信試行回数
	progress: number; // 0-100 (アニメーション進捗)
}

// ACK
export interface Ack {
	id: number;
	ackNumber: number;
	progress: number; // 0-100
}

// シミュレーション設定
export interface PacketLossConfig {
	lossRate: number; // 0-1 (パケットロス率)
	totalPackets: number; // 送信するパケット総数
	transmissionTime: number; // パケット送信時間 (ms)
	rtt: number; // Round Trip Time (ms)
}

// イベントログ
export interface EventLog {
	id: number;
	time: number;
	type: 'send' | 'deliver' | 'loss' | 'ack' | 'retransmit' | 'timeout';
	message: string;
}

const DEFAULT_CONFIG: PacketLossConfig = {
	lossRate: 0.2,
	totalPackets: 10,
	transmissionTime: 1500,
	rtt: 800
};

function createPacketLossStore() {
	let isPlaying = $state(false);
	let config = $state<PacketLossConfig>({ ...DEFAULT_CONFIG });
	let packets = $state<Packet[]>([]);
	let acks = $state<Ack[]>([]);
	let logs = $state<EventLog[]>([]);
	let nextSequenceNumber = $state(1);
	let currentWindow = $state<number[]>([]); // 現在送信中のシーケンス番号
	let deliveredCount = $state(0);
	let lostCount = $state(0);
	let retransmitCount = $state(0);

	let animationFrameId: number | null = null;
	let lastTime = 0;
	let logId = 0;
	let packetId = 0;
	let ackId = 0;

	// ログを追加
	function addLog(type: EventLog['type'], message: string) {
		logs = [
			...logs,
			{
				id: logId++,
				time: Date.now(),
				type,
				message
			}
		].slice(-30); // 最新30件のみ保持
	}

	// パケット送信を開始
	function sendPacket(seqNum: number, isRetransmit = false) {
		const packet: Packet = {
			id: packetId++,
			sequenceNumber: seqNum,
			status: isRetransmit ? 'retransmitting' : 'sending',
			attempt: isRetransmit ? 2 : 1,
			progress: 0
		};
		packets = [...packets, packet];
		currentWindow = [...currentWindow, seqNum];

		if (isRetransmit) {
			addLog('retransmit', `パケット #${seqNum} を再送信`);
			retransmitCount++;
		} else {
			addLog('send', `パケット #${seqNum} を送信`);
		}
	}

	// パケット配達完了
	function deliverPacket(packet: Packet) {
		const willLose = Math.random() < config.lossRate;

		if (willLose) {
			packet.status = 'lost';
			lostCount++;
			addLog('loss', `パケット #${packet.sequenceNumber} がロスト！`);

			// タイムアウト後に再送
			setTimeout(() => {
				if (isPlaying) {
					sendPacket(packet.sequenceNumber, true);
				}
			}, config.rtt * 2);
		} else {
			packet.status = 'delivered';
			deliveredCount++;
			addLog('deliver', `パケット #${packet.sequenceNumber} が到着`);

			// ACKを返す
			setTimeout(() => {
				if (isPlaying) {
					sendAck(packet.sequenceNumber);
				}
			}, 100);
		}

		packets = [...packets];
	}

	// ACK送信
	function sendAck(seqNum: number) {
		const ack: Ack = {
			id: ackId++,
			ackNumber: seqNum,
			progress: 0
		};
		acks = [...acks, ack];
		addLog('ack', `ACK #${seqNum} を送信`);
	}

	// ACK受信完了
	function receiveAck(ack: Ack) {
		// ウィンドウからシーケンス番号を削除
		currentWindow = currentWindow.filter((seq) => seq !== ack.ackNumber);

		// 対応するパケットをacked状態に
		const packet = packets.find(
			(p) => p.sequenceNumber === ack.ackNumber && p.status === 'delivered'
		);
		if (packet) {
			packet.status = 'acked';
			packets = [...packets];
		}

		// 次のパケットを送信
		if (nextSequenceNumber <= config.totalPackets && currentWindow.length < 4) {
			sendPacket(nextSequenceNumber);
			nextSequenceNumber++;
		}
	}

	// アニメーションループ
	function animate(timestamp: number) {
		if (!isPlaying) return;

		const deltaTime = timestamp - lastTime;
		lastTime = timestamp;

		// パケットの進捗を更新
		let packetsUpdated = false;
		for (const packet of packets) {
			if (packet.status === 'sending' || packet.status === 'retransmitting') {
				packet.progress += (deltaTime / config.transmissionTime) * 100;

				if (packet.progress >= 100) {
					packet.progress = 100;
					deliverPacket(packet);
				}
				packetsUpdated = true;
			}
		}
		if (packetsUpdated) {
			packets = [...packets];
		}

		// ACKの進捗を更新
		let acksUpdated = false;
		const completedAcks: Ack[] = [];
		for (const ack of acks) {
			if (ack.progress < 100) {
				ack.progress += (deltaTime / (config.rtt / 2)) * 100;

				if (ack.progress >= 100) {
					ack.progress = 100;
					completedAcks.push(ack);
				}
				acksUpdated = true;
			}
		}
		if (acksUpdated) {
			acks = [...acks];
		}

		// 完了したACKを処理
		for (const ack of completedAcks) {
			receiveAck(ack);
		}

		// 完了したパケットとACKをクリーンアップ
		packets = packets.filter((p) => {
			if (p.status === 'lost' || p.status === 'acked') {
				// 1秒後に削除
				return Date.now() - lastTime < 1000;
			}
			return true;
		});

		acks = acks.filter((a) => a.progress < 100 || Date.now() - lastTime < 500);

		// 終了判定
		const allDelivered =
			deliveredCount >= config.totalPackets &&
			packets.every((p) => p.status === 'delivered' || p.status === 'acked' || p.status === 'lost');

		if (allDelivered && acks.every((a) => a.progress >= 100)) {
			stop();
			addLog('send', `完了！ 配達: ${deliveredCount}, ロスト: ${lostCount}, 再送: ${retransmitCount}`);
			return;
		}

		animationFrameId = requestAnimationFrame(animate);
	}

	// 再生開始
	function play() {
		if (isPlaying) return;

		isPlaying = true;
		lastTime = performance.now();

		// 初期パケット送信（ウィンドウサイズ分）
		const windowSize = Math.min(4, config.totalPackets);
		for (let i = 0; i < windowSize; i++) {
			setTimeout(() => {
				if (isPlaying && nextSequenceNumber <= config.totalPackets) {
					sendPacket(nextSequenceNumber);
					nextSequenceNumber++;
				}
			}, i * 200);
		}

		animationFrameId = requestAnimationFrame(animate);
	}

	// 停止
	function stop() {
		isPlaying = false;
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	// リセット
	function reset() {
		stop();
		packets = [];
		acks = [];
		logs = [];
		nextSequenceNumber = 1;
		currentWindow = [];
		deliveredCount = 0;
		lostCount = 0;
		retransmitCount = 0;
		packetId = 0;
		ackId = 0;
		logId = 0;
	}

	// 設定変更
	function setLossRate(rate: number) {
		config.lossRate = Math.max(0, Math.min(1, rate));
	}

	function setTotalPackets(count: number) {
		config.totalPackets = Math.max(1, Math.min(20, count));
	}

	// 初期化
	function init(cfg?: Partial<PacketLossConfig>) {
		reset();
		config = { ...DEFAULT_CONFIG, ...cfg };
	}

	return {
		get isPlaying() {
			return isPlaying;
		},
		get config() {
			return config;
		},
		get packets() {
			return packets;
		},
		get acks() {
			return acks;
		},
		get logs() {
			return logs;
		},
		get stats() {
			return {
				delivered: deliveredCount,
				lost: lostCount,
				retransmit: retransmitCount,
				total: config.totalPackets
			};
		},
		play,
		stop,
		reset,
		init,
		setLossRate,
		setTotalPackets
	};
}

export const packetLossStore = createPacketLossStore();

import type {
	EncapsulationStep,
	EncapsulationDirection,
	EncapsulationLayer
} from '$lib/types/animation';

// カプセル化の各層データ
export const ENCAPSULATION_LAYERS: EncapsulationLayer[] = [
	{
		id: 'application',
		name: 'Application',
		nameJa: 'アプリケーション層',
		headerName: 'なし',
		pdu: 'Data',
		color: '#ef4444',
		description:
			'ユーザーが送信したいデータ（例：HTTPリクエスト、メール本文など）がここで生成されます。'
	},
	{
		id: 'transport',
		name: 'Transport',
		nameJa: 'トランスポート層',
		headerName: 'TCP/UDPヘッダ',
		pdu: 'Segment',
		color: '#22c55e',
		description:
			'ポート番号、シーケンス番号などを含むTCP/UDPヘッダが追加されます。データは「セグメント」と呼ばれます。'
	},
	{
		id: 'network',
		name: 'Network',
		nameJa: 'ネットワーク層',
		headerName: 'IPヘッダ',
		pdu: 'Packet',
		color: '#3b82f6',
		description:
			'送信元/宛先IPアドレス、TTLなどを含むIPヘッダが追加されます。データは「パケット」と呼ばれます。'
	},
	{
		id: 'datalink',
		name: 'Data Link',
		nameJa: 'データリンク層',
		headerName: 'Ethernetヘッダ + FCS',
		pdu: 'Frame',
		color: '#8b5cf6',
		description:
			'MACアドレスを含むEthernetヘッダと、エラー検出用のFCS（トレーラ）が追加されます。データは「フレーム」と呼ばれます。'
	},
	{
		id: 'physical',
		name: 'Physical',
		nameJa: '物理層',
		headerName: 'プリアンブル',
		pdu: 'Bits',
		color: '#ec4899',
		description:
			'フレームは電気信号、光信号、電波などの物理的な信号に変換され、ケーブルや無線で送信されます。'
	}
];

const STEPS: EncapsulationStep[] = [
	'application',
	'transport',
	'network',
	'datalink',
	'physical',
	'complete'
];

function createEncapsulationStore() {
	let currentStep = $state<EncapsulationStep>('application');
	let direction = $state<EncapsulationDirection>('encapsulation');
	let isPlaying = $state(false);
	let speed = $state(1);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	const stepIndex = $derived(STEPS.indexOf(currentStep));
	const totalSteps = STEPS.length;

	// 現在のステップまでに追加されたヘッダ
	const activeHeaders = $derived(() => {
		if (direction === 'encapsulation') {
			const idx = stepIndex;
			return ENCAPSULATION_LAYERS.slice(0, idx);
		} else {
			// 非カプセル化：逆順
			const idx = ENCAPSULATION_LAYERS.length - stepIndex;
			return ENCAPSULATION_LAYERS.slice(idx);
		}
	});

	// 現在の層のデータ
	const currentLayerData = $derived(
		currentStep === 'complete' ? null : ENCAPSULATION_LAYERS.find((l) => l.id === currentStep)
	);

	function startAutoPlay() {
		if (intervalId) return;
		isPlaying = true;
		intervalId = setInterval(
			() => {
				if (direction === 'encapsulation') {
					if (stepIndex < STEPS.length - 1) {
						currentStep = STEPS[stepIndex + 1];
					} else {
						stopAutoPlay();
					}
				} else {
					if (stepIndex > 0) {
						currentStep = STEPS[stepIndex - 1];
					} else {
						stopAutoPlay();
					}
				}
			},
			1500 / speed
		);
	}

	function stopAutoPlay() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		isPlaying = false;
	}

	return {
		get currentStep() {
			return currentStep;
		},
		get direction() {
			return direction;
		},
		get isPlaying() {
			return isPlaying;
		},
		get speed() {
			return speed;
		},
		get stepIndex() {
			return stepIndex;
		},
		get totalSteps() {
			return totalSteps;
		},
		get activeHeaders() {
			return activeHeaders();
		},
		get currentLayerData() {
			return currentLayerData;
		},

		setDirection(dir: EncapsulationDirection) {
			stopAutoPlay();
			direction = dir;
			if (dir === 'encapsulation') {
				currentStep = 'application';
			} else {
				currentStep = 'complete';
			}
		},

		next() {
			if (direction === 'encapsulation' && stepIndex < STEPS.length - 1) {
				currentStep = STEPS[stepIndex + 1];
			} else if (direction === 'decapsulation' && stepIndex > 0) {
				currentStep = STEPS[stepIndex - 1];
			}
		},

		prev() {
			if (direction === 'encapsulation' && stepIndex > 0) {
				currentStep = STEPS[stepIndex - 1];
			} else if (direction === 'decapsulation' && stepIndex < STEPS.length - 1) {
				currentStep = STEPS[stepIndex + 1];
			}
		},

		togglePlay() {
			if (isPlaying) {
				stopAutoPlay();
			} else {
				// 終了状態からの再生はリセット
				if (direction === 'encapsulation' && currentStep === 'complete') {
					currentStep = 'application';
				} else if (direction === 'decapsulation' && currentStep === 'application') {
					currentStep = 'complete';
				}
				startAutoPlay();
			}
		},

		setSpeed(s: number) {
			speed = s;
			if (isPlaying) {
				stopAutoPlay();
				startAutoPlay();
			}
		},

		reset() {
			stopAutoPlay();
			if (direction === 'encapsulation') {
				currentStep = 'application';
			} else {
				currentStep = 'complete';
			}
		},

		canGoNext() {
			if (direction === 'encapsulation') {
				return stepIndex < STEPS.length - 1;
			}
			return stepIndex > 0;
		},

		canGoPrev() {
			if (direction === 'encapsulation') {
				return stepIndex > 0;
			}
			return stepIndex < STEPS.length - 1;
		}
	};
}

export const encapsulationStore = createEncapsulationStore();

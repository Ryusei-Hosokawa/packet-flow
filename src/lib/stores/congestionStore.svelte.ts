/**
 * 輻輳制御シミュレーション用ストア
 *
 * TCPの輻輳制御アルゴリズム（スロースタート、輻輳回避、高速再送）を
 * 視覚的にシミュレートします。
 */

// 輻輳制御の状態
export type CongestionPhase = 'slow-start' | 'congestion-avoidance' | 'fast-recovery' | 'timeout';

// シミュレーションの1ステップ
export interface CongestionStep {
	round: number;
	cwnd: number; // Congestion Window
	ssthresh: number; // Slow Start Threshold
	phase: CongestionPhase;
	event: 'ack' | 'loss' | 'timeout' | 'start';
	description: string;
}

// シミュレーション設定
interface SimulationConfig {
	initialCwnd: number;
	initialSsthresh: number;
	maxCwnd: number;
	lossRound?: number; // パケットロスが発生するラウンド
	timeoutRound?: number; // タイムアウトが発生するラウンド
}

const DEFAULT_CONFIG: SimulationConfig = {
	initialCwnd: 1,
	initialSsthresh: 16,
	maxCwnd: 32,
	lossRound: 12,
	timeoutRound: undefined
};

function createCongestionStore() {
	let isPlaying = $state(false);
	let speed = $state(1);
	let currentStepIndex = $state(0);
	let steps = $state<CongestionStep[]>([]);
	let config = $state<SimulationConfig>({ ...DEFAULT_CONFIG });
	let intervalId: ReturnType<typeof setInterval> | null = null;

	// シミュレーションを生成
	function generateSimulation(cfg: SimulationConfig = config): CongestionStep[] {
		const result: CongestionStep[] = [];
		let cwnd = cfg.initialCwnd;
		let ssthresh = cfg.initialSsthresh;
		let phase: CongestionPhase = 'slow-start';
		let round = 0;

		// 初期状態
		result.push({
			round: 0,
			cwnd,
			ssthresh,
			phase,
			event: 'start',
			description: `初期状態: cwnd=${cwnd}, ssthresh=${ssthresh}`
		});

		// シミュレーション実行
		while (cwnd < cfg.maxCwnd && round < 30) {
			round++;

			// タイムアウト発生
			if (cfg.timeoutRound && round === cfg.timeoutRound) {
				ssthresh = Math.max(Math.floor(cwnd / 2), 2);
				cwnd = 1;
				phase = 'slow-start';
				result.push({
					round,
					cwnd,
					ssthresh,
					phase: 'timeout',
					event: 'timeout',
					description: `タイムアウト発生！ssthresh=${ssthresh}に設定、cwnd=1にリセット`
				});
				continue;
			}

			// パケットロス発生（3重複ACK）
			if (cfg.lossRound && round === cfg.lossRound) {
				ssthresh = Math.max(Math.floor(cwnd / 2), 2);
				cwnd = ssthresh + 3; // Fast Recovery
				phase = 'fast-recovery';
				result.push({
					round,
					cwnd,
					ssthresh,
					phase,
					event: 'loss',
					description: `3重複ACK検出！ssthresh=${ssthresh}、高速再送・高速回復開始`
				});
				// 次のラウンドで輻輳回避に戻る
				round++;
				cwnd = ssthresh;
				phase = 'congestion-avoidance';
				result.push({
					round,
					cwnd,
					ssthresh,
					phase,
					event: 'ack',
					description: `高速回復完了、輻輳回避フェーズへ（cwnd=${cwnd}）`
				});
				continue;
			}

			// 通常のACK受信
			if (phase === 'slow-start') {
				// スロースタート: cwndを指数的に増加
				cwnd = Math.min(cwnd * 2, cfg.maxCwnd);

				// ssthreshに達したら輻輳回避へ
				if (cwnd >= ssthresh) {
					cwnd = ssthresh;
					phase = 'congestion-avoidance';
					result.push({
						round,
						cwnd,
						ssthresh,
						phase,
						event: 'ack',
						description: `ssthreshに到達、輻輳回避フェーズへ移行`
					});
				} else {
					result.push({
						round,
						cwnd,
						ssthresh,
						phase,
						event: 'ack',
						description: `スロースタート: cwnd=${cwnd}（指数的増加）`
					});
				}
			} else if (phase === 'congestion-avoidance') {
				// 輻輳回避: cwndを線形的に増加
				cwnd = Math.min(cwnd + 1, cfg.maxCwnd);
				result.push({
					round,
					cwnd,
					ssthresh,
					phase,
					event: 'ack',
					description: `輻輳回避: cwnd=${cwnd}（線形増加）`
				});
			}
		}

		return result;
	}

	// シミュレーションを初期化
	function init(cfg?: Partial<SimulationConfig>) {
		stop();
		config = { ...DEFAULT_CONFIG, ...cfg };
		steps = generateSimulation(config);
		currentStepIndex = 0;
	}

	// 再生/一時停止
	function togglePlay() {
		if (isPlaying) {
			stop();
		} else {
			play();
		}
	}

	function play() {
		if (currentStepIndex >= steps.length - 1) {
			currentStepIndex = 0;
		}
		isPlaying = true;
		intervalId = setInterval(() => {
			if (currentStepIndex < steps.length - 1) {
				currentStepIndex++;
			} else {
				stop();
			}
		}, 1000 / speed);
	}

	function stop() {
		isPlaying = false;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	// ステップ操作
	function nextStep() {
		if (currentStepIndex < steps.length - 1) {
			currentStepIndex++;
		}
	}

	function prevStep() {
		if (currentStepIndex > 0) {
			currentStepIndex--;
		}
	}

	function reset() {
		stop();
		currentStepIndex = 0;
	}

	function setSpeed(newSpeed: number) {
		speed = newSpeed;
		if (isPlaying) {
			stop();
			play();
		}
	}

	// シナリオプリセット
	function setScenario(scenario: 'normal' | 'loss' | 'timeout') {
		switch (scenario) {
			case 'normal':
				init({ lossRound: undefined, timeoutRound: undefined });
				break;
			case 'loss':
				init({ lossRound: 12 });
				break;
			case 'timeout':
				init({ timeoutRound: 10, lossRound: undefined });
				break;
		}
	}

	// 初期化
	init();

	return {
		get isPlaying() {
			return isPlaying;
		},
		get speed() {
			return speed;
		},
		get currentStepIndex() {
			return currentStepIndex;
		},
		get steps() {
			return steps;
		},
		get currentStep() {
			return steps[currentStepIndex];
		},
		get totalSteps() {
			return steps.length;
		},
		get config() {
			return config;
		},
		// 現在までのステップ（グラフ表示用）
		get visibleSteps() {
			return steps.slice(0, currentStepIndex + 1);
		},
		togglePlay,
		play,
		stop,
		nextStep,
		prevStep,
		reset,
		setSpeed,
		setScenario,
		init
	};
}

export const congestionStore = createCongestionStore();

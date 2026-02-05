import type { HandshakeStep } from '$lib/types/animation';

const STEPS: HandshakeStep[] = [
	'idle',
	'syn-sent',
	'syn-received',
	'ack-sent',
	'established'
];

export function createHandshakeStore() {
	let currentStep = $state<HandshakeStep>('idle');
	let isPlaying = $state(false);
	let speed = $state(1);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	function getStepIndex(): number {
		return STEPS.indexOf(currentStep);
	}

	function canGoNext(): boolean {
		return getStepIndex() < STEPS.length - 1;
	}

	function canGoPrev(): boolean {
		return getStepIndex() > 0;
	}

	function next() {
		if (canGoNext()) {
			currentStep = STEPS[getStepIndex() + 1];
		} else {
			pause();
		}
	}

	function prev() {
		if (canGoPrev()) {
			currentStep = STEPS[getStepIndex() - 1];
		}
	}

	function reset() {
		pause();
		currentStep = 'idle';
	}

	function play() {
		if (currentStep === 'established') {
			currentStep = 'idle';
		}
		isPlaying = true;
		intervalId = setInterval(
			() => {
				next();
			},
			1500 / speed
		);
	}

	function pause() {
		isPlaying = false;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function togglePlay() {
		if (isPlaying) {
			pause();
		} else {
			play();
		}
	}

	function setSpeed(newSpeed: number) {
		speed = newSpeed;
		if (isPlaying) {
			pause();
			play();
		}
	}

	return {
		get currentStep() {
			return currentStep;
		},
		get isPlaying() {
			return isPlaying;
		},
		get speed() {
			return speed;
		},
		get stepIndex() {
			return getStepIndex();
		},
		get totalSteps() {
			return STEPS.length;
		},
		canGoNext,
		canGoPrev,
		next,
		prev,
		reset,
		play,
		pause,
		togglePlay,
		setSpeed
	};
}

export const handshakeStore = createHandshakeStore();

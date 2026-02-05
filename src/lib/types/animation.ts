export type HandshakeStep =
	| 'idle'
	| 'syn-sent'
	| 'syn-received'
	| 'ack-sent'
	| 'established';

export interface AnimationState {
	currentStep: HandshakeStep;
	isPlaying: boolean;
	speed: number; // 1 = normal, 0.5 = slow, 2 = fast
}

// カプセル化のステップ
export type EncapsulationStep =
	| 'application'
	| 'transport'
	| 'network'
	| 'datalink'
	| 'physical'
	| 'complete';

export type EncapsulationDirection = 'encapsulation' | 'decapsulation';

export interface EncapsulationLayer {
	id: EncapsulationStep;
	name: string;
	nameJa: string;
	headerName: string;
	pdu: string;
	color: string;
	description: string;
}

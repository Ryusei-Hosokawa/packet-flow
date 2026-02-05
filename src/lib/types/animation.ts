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

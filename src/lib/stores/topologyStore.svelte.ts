/**
 * ネットワークトポロジー可視化用ストア
 *
 * ネットワークのノード（機器）とリンク（接続）を管理し、
 * パケットの流れをシミュレートします。
 */

// ノードの種類
export type NodeType = 'client' | 'server' | 'router' | 'switch' | 'firewall' | 'internet';

// ネットワークノード
export interface NetworkNode {
	id: string;
	label: string;
	type: NodeType;
	ip?: string;
	x?: number;
	y?: number;
	fx?: number | null; // 固定X座標（D3用）
	fy?: number | null; // 固定Y座標（D3用）
}

// ネットワークリンク
export interface NetworkLink {
	id: string;
	source: string;
	target: string;
	label?: string;
	bandwidth?: string;
	latency?: number; // ms
}

// パケットアニメーション
export interface PacketAnimation {
	id: string;
	linkId: string;
	progress: number; // 0-1
	direction: 'forward' | 'backward';
	type: 'request' | 'response' | 'data';
}

// トポロジープリセット
export interface TopologyPreset {
	name: string;
	description: string;
	nodes: NetworkNode[];
	links: NetworkLink[];
}

// プリセット定義
const PRESETS: Record<string, TopologyPreset> = {
	simple: {
		name: 'シンプル（クライアント-サーバー）',
		description: 'クライアントとサーバーがルーターを介して接続',
		nodes: [
			{ id: 'client', label: 'クライアント', type: 'client', ip: '192.168.1.10' },
			{ id: 'router1', label: 'ルーター', type: 'router', ip: '192.168.1.1' },
			{ id: 'server', label: 'Webサーバー', type: 'server', ip: '203.0.113.10' }
		],
		links: [
			{ id: 'link1', source: 'client', target: 'router1', bandwidth: '1Gbps', latency: 1 },
			{ id: 'link2', source: 'router1', target: 'server', bandwidth: '100Mbps', latency: 20 }
		]
	},
	home: {
		name: 'ホームネットワーク',
		description: '家庭内LANの典型的な構成',
		nodes: [
			{ id: 'pc', label: 'PC', type: 'client', ip: '192.168.1.10' },
			{ id: 'smartphone', label: 'スマートフォン', type: 'client', ip: '192.168.1.11' },
			{ id: 'router', label: 'ホームルーター', type: 'router', ip: '192.168.1.1' },
			{ id: 'internet', label: 'インターネット', type: 'internet' },
			{ id: 'webserver', label: 'Webサーバー', type: 'server', ip: '93.184.216.34' }
		],
		links: [
			{ id: 'link1', source: 'pc', target: 'router', bandwidth: '1Gbps', latency: 1 },
			{ id: 'link2', source: 'smartphone', target: 'router', bandwidth: '866Mbps', latency: 2 },
			{ id: 'link3', source: 'router', target: 'internet', bandwidth: '100Mbps', latency: 10 },
			{ id: 'link4', source: 'internet', target: 'webserver', bandwidth: '10Gbps', latency: 30 }
		]
	},
	enterprise: {
		name: 'エンタープライズ',
		description: '企業ネットワークの簡略化構成',
		nodes: [
			{ id: 'client1', label: 'クライアントPC', type: 'client', ip: '10.0.1.10' },
			{ id: 'client2', label: 'クライアントPC', type: 'client', ip: '10.0.1.11' },
			{ id: 'switch1', label: 'L2スイッチ', type: 'switch' },
			{ id: 'firewall', label: 'ファイアウォール', type: 'firewall', ip: '10.0.0.1' },
			{ id: 'router', label: 'ルーター', type: 'router', ip: '203.0.113.1' },
			{ id: 'internet', label: 'インターネット', type: 'internet' },
			{ id: 'dmz-server', label: 'DMZサーバー', type: 'server', ip: '203.0.113.10' }
		],
		links: [
			{ id: 'link1', source: 'client1', target: 'switch1', bandwidth: '1Gbps', latency: 0 },
			{ id: 'link2', source: 'client2', target: 'switch1', bandwidth: '1Gbps', latency: 0 },
			{ id: 'link3', source: 'switch1', target: 'firewall', bandwidth: '10Gbps', latency: 1 },
			{ id: 'link4', source: 'firewall', target: 'router', bandwidth: '1Gbps', latency: 1 },
			{ id: 'link5', source: 'router', target: 'internet', bandwidth: '100Mbps', latency: 5 },
			{ id: 'link6', source: 'firewall', target: 'dmz-server', bandwidth: '1Gbps', latency: 1 }
		]
	}
};

function createTopologyStore() {
	let nodes = $state<NetworkNode[]>([]);
	let links = $state<NetworkLink[]>([]);
	let packets = $state<PacketAnimation[]>([]);
	let selectedNodeId = $state<string | null>(null);
	let isAnimating = $state(false);
	let currentPreset = $state<string>('simple');

	let animationIntervalId: ReturnType<typeof setInterval> | null = null;

	// プリセットを読み込み
	function loadPreset(presetId: string) {
		const preset = PRESETS[presetId];
		if (!preset) return;

		stopAnimation();
		nodes = [...preset.nodes];
		links = [...preset.links];
		packets = [];
		selectedNodeId = null;
		currentPreset = presetId;
	}

	// ノードを選択
	function selectNode(nodeId: string | null) {
		selectedNodeId = nodeId;
	}

	// パケットアニメーションを開始
	function startPacketAnimation(fromNodeId: string, toNodeId: string, type: PacketAnimation['type'] = 'request') {
		// fromからtoへの経路を探す（簡易版：直接リンクのみ）
		const link = links.find(
			(l) =>
				(l.source === fromNodeId && l.target === toNodeId) ||
				(l.source === toNodeId && l.target === fromNodeId)
		);

		if (!link) return;

		const direction = link.source === fromNodeId ? 'forward' : 'backward';

		const packet: PacketAnimation = {
			id: `packet-${Date.now()}`,
			linkId: link.id,
			progress: 0,
			direction,
			type
		};

		packets = [...packets, packet];

		// アニメーション更新
		if (!animationIntervalId) {
			isAnimating = true;
			animationIntervalId = setInterval(() => {
				packets = packets
					.map((p) => ({
						...p,
						progress: p.progress + 0.02
					}))
					.filter((p) => p.progress <= 1);

				if (packets.length === 0) {
					stopAnimation();
				}
			}, 16); // 60fps
		}
	}

	// デモアニメーション（複数パケット）
	function runDemo() {
		stopAnimation();
		packets = [];

		// 順番にパケットを送信
		const delays = [0, 500, 1000, 1500, 2000, 2500];
		const animations = [
			{ from: nodes[0]?.id, to: nodes[1]?.id, type: 'request' as const },
			{ from: nodes[1]?.id, to: nodes[2]?.id, type: 'request' as const },
			{ from: nodes[2]?.id, to: nodes[1]?.id, type: 'response' as const },
			{ from: nodes[1]?.id, to: nodes[0]?.id, type: 'response' as const }
		];

		animations.forEach((anim, i) => {
			if (anim.from && anim.to && delays[i] !== undefined) {
				setTimeout(() => {
					startPacketAnimation(anim.from!, anim.to!, anim.type);
				}, delays[i]);
			}
		});
	}

	function stopAnimation() {
		if (animationIntervalId) {
			clearInterval(animationIntervalId);
			animationIntervalId = null;
		}
		isAnimating = false;
	}

	// 初期化
	loadPreset('simple');

	return {
		get nodes() {
			return nodes;
		},
		get links() {
			return links;
		},
		get packets() {
			return packets;
		},
		get selectedNodeId() {
			return selectedNodeId;
		},
		get isAnimating() {
			return isAnimating;
		},
		get currentPreset() {
			return currentPreset;
		},
		get selectedNode() {
			return nodes.find((n) => n.id === selectedNodeId) ?? null;
		},
		get presets() {
			return PRESETS;
		},
		loadPreset,
		selectNode,
		startPacketAnimation,
		runDemo,
		stopAnimation,
		// D3用のノード位置更新
		updateNodePositions(updatedNodes: NetworkNode[]) {
			nodes = updatedNodes;
		}
	};
}

export const topologyStore = createTopologyStore();

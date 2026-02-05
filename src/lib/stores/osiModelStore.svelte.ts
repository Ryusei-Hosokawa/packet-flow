import type {
	OSILayer,
	OSILayerNumber,
	TCPIPLayer,
	TCPIPLayerNumber,
	ModelType
} from '$lib/types/network';

// OSI参照モデルのデータ
export const OSI_LAYERS: OSILayer[] = [
	{
		number: 7,
		name: 'Application',
		nameJa: 'アプリケーション層',
		description:
			'ユーザーが直接触れるアプリケーションにネットワーク機能を提供します。Webブラウザ、メールクライアント、ファイル転送などのサービスがこの層で動作します。',
		protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'POP3', 'IMAP', 'DNS', 'SSH', 'Telnet'],
		pdu: 'データ',
		devices: ['ゲートウェイ', 'ファイアウォール'],
		color: '#ef4444' // red
	},
	{
		number: 6,
		name: 'Presentation',
		nameJa: 'プレゼンテーション層',
		description:
			'データの表現形式を管理します。文字コード変換、データ圧縮、暗号化/復号化などを行い、異なるシステム間でデータを正しく解釈できるようにします。',
		protocols: ['SSL/TLS', 'JPEG', 'MPEG', 'ASCII', 'EBCDIC'],
		pdu: 'データ',
		devices: [],
		color: '#f97316' // orange
	},
	{
		number: 5,
		name: 'Session',
		nameJa: 'セッション層',
		description:
			'通信のセッション（対話）を管理します。接続の確立、維持、終了を制御し、データ交換の同期ポイントを設けます。',
		protocols: ['NetBIOS', 'RPC', 'PPTP'],
		pdu: 'データ',
		devices: [],
		color: '#eab308' // yellow
	},
	{
		number: 4,
		name: 'Transport',
		nameJa: 'トランスポート層',
		description:
			'エンドツーエンドの信頼性のある通信を提供します。データの分割・再構築、フロー制御、エラー検出・訂正を行います。ポート番号でアプリケーションを識別します。',
		protocols: ['TCP', 'UDP', 'SCTP'],
		pdu: 'セグメント/データグラム',
		devices: ['ゲートウェイ'],
		color: '#22c55e' // green
	},
	{
		number: 3,
		name: 'Network',
		nameJa: 'ネットワーク層',
		description:
			'異なるネットワーク間でのデータ転送を担当します。IPアドレスによる論理的なアドレッシングと、最適な経路選択（ルーティング）を行います。',
		protocols: ['IP', 'ICMP', 'ARP', 'RARP', 'OSPF', 'BGP'],
		pdu: 'パケット',
		devices: ['ルーター', 'L3スイッチ'],
		color: '#3b82f6' // blue
	},
	{
		number: 2,
		name: 'Data Link',
		nameJa: 'データリンク層',
		description:
			'同一ネットワーク内での直接接続されたノード間のデータ転送を管理します。MACアドレスによる物理的なアドレッシング、フレーム化、エラー検出を行います。',
		protocols: ['Ethernet', 'Wi-Fi (802.11)', 'PPP', 'HDLC'],
		pdu: 'フレーム',
		devices: ['スイッチ', 'ブリッジ', 'NIC'],
		color: '#8b5cf6' // violet
	},
	{
		number: 1,
		name: 'Physical',
		nameJa: '物理層',
		description:
			'ビット列を電気信号、光信号、電波などの物理的な信号に変換して伝送します。ケーブル、コネクタ、信号の電圧レベルなどを規定します。',
		protocols: ['Ethernet物理層', 'USB', 'Bluetooth', 'DSL'],
		pdu: 'ビット',
		devices: ['リピーター', 'ハブ', 'ケーブル', 'NIC'],
		color: '#ec4899' // pink
	}
];

// TCP/IPモデルのデータ
export const TCPIP_LAYERS: TCPIPLayer[] = [
	{
		number: 4,
		name: 'Application',
		nameJa: 'アプリケーション層',
		description:
			'OSIモデルのアプリケーション層、プレゼンテーション層、セッション層の機能を統合しています。ユーザーアプリケーションに直接サービスを提供します。',
		protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS', 'SSH', 'DHCP'],
		osiMapping: [7, 6, 5],
		color: '#ef4444' // red
	},
	{
		number: 3,
		name: 'Transport',
		nameJa: 'トランスポート層',
		description:
			'OSIモデルのトランスポート層と同等です。TCPによる信頼性のある通信と、UDPによる軽量な通信を提供します。',
		protocols: ['TCP', 'UDP'],
		osiMapping: [4],
		color: '#22c55e' // green
	},
	{
		number: 2,
		name: 'Internet',
		nameJa: 'インターネット層',
		description:
			'OSIモデルのネットワーク層に相当します。IPアドレッシングとルーティングを担当し、異なるネットワーク間でのパケット配送を行います。',
		protocols: ['IP', 'ICMP', 'ARP'],
		osiMapping: [3],
		color: '#3b82f6' // blue
	},
	{
		number: 1,
		name: 'Network Interface',
		nameJa: 'ネットワークインターフェース層',
		description:
			'OSIモデルのデータリンク層と物理層を統合しています。実際の物理的なネットワーク接続とデータの送受信を担当します。',
		protocols: ['Ethernet', 'Wi-Fi', 'PPP'],
		osiMapping: [2, 1],
		color: '#8b5cf6' // violet
	}
];

// レイヤー選択の状態管理
function createOSIModelStore() {
	let selectedModel = $state<ModelType>('osi');
	let selectedOSILayer = $state<OSILayerNumber | null>(null);
	let selectedTCPIPLayer = $state<TCPIPLayerNumber | null>(null);
	let showMapping = $state(true);

	// 選択中のOSI層の詳細
	const selectedOSILayerData = $derived(
		selectedOSILayer ? OSI_LAYERS.find((l) => l.number === selectedOSILayer) : null
	);

	// 選択中のTCP/IP層の詳細
	const selectedTCPIPLayerData = $derived(
		selectedTCPIPLayer ? TCPIP_LAYERS.find((l) => l.number === selectedTCPIPLayer) : null
	);

	// TCP/IP層が選択されたときの対応OSI層
	const mappedOSILayers = $derived(selectedTCPIPLayerData?.osiMapping ?? []);

	// OSI層が選択されたときの対応TCP/IP層
	const mappedTCPIPLayer = $derived(
		selectedOSILayer
			? TCPIP_LAYERS.find((l) => l.osiMapping.includes(selectedOSILayer))?.number ?? null
			: null
	);

	return {
		get selectedModel() {
			return selectedModel;
		},
		get selectedOSILayer() {
			return selectedOSILayer;
		},
		get selectedTCPIPLayer() {
			return selectedTCPIPLayer;
		},
		get showMapping() {
			return showMapping;
		},
		get selectedOSILayerData() {
			return selectedOSILayerData;
		},
		get selectedTCPIPLayerData() {
			return selectedTCPIPLayerData;
		},
		get mappedOSILayers() {
			return mappedOSILayers;
		},
		get mappedTCPIPLayer() {
			return mappedTCPIPLayer;
		},

		setModel(model: ModelType) {
			selectedModel = model;
			selectedOSILayer = null;
			selectedTCPIPLayer = null;
			// 比較モードでは常にマッピングを有効化
			if (model === 'comparison') {
				showMapping = true;
			}
		},

		selectOSILayer(layer: OSILayerNumber | null) {
			selectedOSILayer = layer;
			// 対応するTCP/IP層も自動選択
			if (layer && showMapping) {
				const tcpipLayer = TCPIP_LAYERS.find((l) => l.osiMapping.includes(layer));
				selectedTCPIPLayer = tcpipLayer?.number ?? null;
			} else {
				selectedTCPIPLayer = null;
			}
		},

		selectTCPIPLayer(layer: TCPIPLayerNumber | null) {
			selectedTCPIPLayer = layer;
			// 対応するOSI層の最初の層を選択
			if (layer && showMapping) {
				const tcpipLayerData = TCPIP_LAYERS.find((l) => l.number === layer);
				selectedOSILayer = tcpipLayerData?.osiMapping[0] ?? null;
			} else {
				selectedOSILayer = null;
			}
		},

		toggleMapping() {
			showMapping = !showMapping;
		},

		reset() {
			selectedOSILayer = null;
			selectedTCPIPLayer = null;
		}
	};
}

export const osiModelStore = createOSIModelStore();

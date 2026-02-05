import type { ComparisonItem, UseCaseItem, ProtocolType } from '$lib/types/packet';

// TCP vs UDP 比較データ
export const COMPARISON_DATA: ComparisonItem[] = [
	{
		category: '接続方式',
		tcp: 'コネクション型',
		udp: 'コネクションレス型',
		description:
			'TCPは通信前に3ウェイハンドシェイクで接続を確立します。UDPは接続確立なしでいきなりデータを送信します。'
	},
	{
		category: '信頼性',
		tcp: '高い（到達保証あり）',
		udp: '低い（到達保証なし）',
		description:
			'TCPはACKによる確認応答と再送制御で確実にデータを届けます。UDPは送りっぱなしで、届いたかどうかは保証しません。'
	},
	{
		category: '順序保証',
		tcp: 'あり',
		udp: 'なし',
		description:
			'TCPはシーケンス番号でデータの順序を保証します。UDPは順序がバラバラになる可能性があります。'
	},
	{
		category: 'フロー制御',
		tcp: 'あり（ウィンドウ制御）',
		udp: 'なし',
		description:
			'TCPは受信側の処理能力に合わせて送信量を調整します。UDPは相手の状況を考慮しません。'
	},
	{
		category: '輻輳制御',
		tcp: 'あり',
		udp: 'なし',
		description:
			'TCPはネットワークの混雑状況に応じて送信速度を調整します。UDPは常に一定の速度で送信します。'
	},
	{
		category: 'ヘッダサイズ',
		tcp: '20バイト以上',
		udp: '8バイト固定',
		description:
			'TCPは多機能なため大きなヘッダが必要です。UDPはシンプルなので小さなヘッダで済みます。'
	},
	{
		category: '速度/遅延',
		tcp: '遅め（オーバーヘッド大）',
		udp: '速い（オーバーヘッド小）',
		description:
			'TCPは確認応答や再送の処理があるため遅延が発生します。UDPはそれらがないため高速です。'
	},
	{
		category: '通信形態',
		tcp: '1対1のみ',
		udp: '1対1、1対多、多対多',
		description:
			'TCPは接続を確立するため1対1通信のみ。UDPはブロードキャストやマルチキャストも可能です。'
	}
];

// ユースケースデータ
export const USE_CASES: UseCaseItem[] = [
	{
		protocol: 'tcp',
		name: 'Web (HTTP/HTTPS)',
		nameJa: 'Webブラウジング',
		description: 'Webページの取得は確実にデータが届く必要があるためTCPを使用',
		icon: ''
	},
	{
		protocol: 'tcp',
		name: 'Email (SMTP/POP3/IMAP)',
		nameJa: 'メール送受信',
		description: 'メールは1文字でも欠けると意味が変わるため信頼性が重要',
		icon: ''
	},
	{
		protocol: 'tcp',
		name: 'File Transfer (FTP)',
		nameJa: 'ファイル転送',
		description: 'ファイルは完全に転送される必要があるためTCPを使用',
		icon: ''
	},
	{
		protocol: 'tcp',
		name: 'SSH/Telnet',
		nameJa: 'リモート接続',
		description: 'コマンドの入力は正確に伝わる必要があるためTCPを使用',
		icon: ''
	},
	{
		protocol: 'udp',
		name: 'DNS',
		nameJa: 'ドメイン名解決',
		description: '小さなデータを素早くやり取りするためUDPを使用（失敗したら再試行）',
		icon: ''
	},
	{
		protocol: 'udp',
		name: 'Video Streaming',
		nameJa: '動画配信',
		description: '多少のデータ欠落より遅延のなさが重要なためUDPを使用',
		icon: ''
	},
	{
		protocol: 'udp',
		name: 'VoIP',
		nameJa: 'インターネット電話',
		description: 'リアルタイム性が重要で、少々の音声欠落は許容されるためUDP',
		icon: ''
	},
	{
		protocol: 'udp',
		name: 'Online Gaming',
		nameJa: 'オンラインゲーム',
		description: '低遅延が重要で、古いデータより最新データが優先されるためUDP',
		icon: ''
	},
	{
		protocol: 'udp',
		name: 'DHCP',
		nameJa: 'IPアドレス自動取得',
		description: 'ブロードキャスト通信が必要なためUDPを使用',
		icon: ''
	}
];

// 状態管理
function createComparisonStore() {
	let selectedProtocol = $state<ProtocolType | null>(null);
	let highlightedCategory = $state<string | null>(null);

	const tcpUseCases = $derived(USE_CASES.filter((uc) => uc.protocol === 'tcp'));
	const udpUseCases = $derived(USE_CASES.filter((uc) => uc.protocol === 'udp'));

	return {
		get selectedProtocol() {
			return selectedProtocol;
		},
		get highlightedCategory() {
			return highlightedCategory;
		},
		get tcpUseCases() {
			return tcpUseCases;
		},
		get udpUseCases() {
			return udpUseCases;
		},

		selectProtocol(protocol: ProtocolType | null) {
			selectedProtocol = protocol;
		},

		highlightCategory(category: string | null) {
			highlightedCategory = category;
		},

		reset() {
			selectedProtocol = null;
			highlightedCategory = null;
		}
	};
}

export const comparisonStore = createComparisonStore();

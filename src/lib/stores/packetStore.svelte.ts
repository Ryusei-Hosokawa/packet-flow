import type { HeaderType, HeaderDefinition, HeaderField } from '$lib/types/packet';

// IPv4ヘッダ定義（20バイト = 160ビット、オプションなし）
export const IP_HEADER: HeaderDefinition = {
	type: 'ip',
	name: 'IPv4 Header',
	nameJa: 'IPv4ヘッダ',
	totalBits: 160,
	bitsPerRow: 32,
	fields: [
		{
			id: 'version',
			name: 'Version',
			nameJa: 'バージョン',
			bits: 4,
			row: 0,
			startBit: 0,
			description: 'IPプロトコルのバージョンを示します。IPv4の場合は「4」が入ります。',
			example: '4',
			color: '#ef4444'
		},
		{
			id: 'ihl',
			name: 'IHL',
			nameJa: 'ヘッダ長',
			bits: 4,
			row: 0,
			startBit: 4,
			description:
				'Internet Header Length。ヘッダの長さを32ビット単位で表します。オプションがない場合は5（20バイト）。',
			example: '5',
			color: '#f97316'
		},
		{
			id: 'tos',
			name: 'ToS',
			nameJa: 'サービスタイプ',
			bits: 8,
			row: 0,
			startBit: 8,
			description:
				'Type of Service。パケットの優先度やサービス品質（QoS）を指定します。現在はDSCP/ECNとして使用。',
			example: '0x00',
			color: '#eab308'
		},
		{
			id: 'total-length',
			name: 'Total Length',
			nameJa: '全長',
			bits: 16,
			row: 0,
			startBit: 16,
			description: 'ヘッダとデータを含むパケット全体の長さをバイト単位で表します。最大65535バイト。',
			example: '1500',
			color: '#22c55e'
		},
		{
			id: 'identification',
			name: 'Identification',
			nameJa: '識別子',
			bits: 16,
			row: 1,
			startBit: 0,
			description:
				'フラグメント化されたパケットを再構築するための識別番号。同じパケットのフラグメントは同じ値。',
			example: '0x1234',
			color: '#3b82f6'
		},
		{
			id: 'flags',
			name: 'Flags',
			nameJa: 'フラグ',
			bits: 3,
			row: 1,
			startBit: 16,
			description:
				'フラグメンテーション制御。DF(Don\'t Fragment)、MF(More Fragments)などを指定。',
			example: '010',
			color: '#8b5cf6'
		},
		{
			id: 'fragment-offset',
			name: 'Fragment Offset',
			nameJa: 'フラグメントオフセット',
			bits: 13,
			row: 1,
			startBit: 19,
			description:
				'フラグメント化されたデータの元のパケット内での位置を8バイト単位で表します。',
			example: '0',
			color: '#ec4899'
		},
		{
			id: 'ttl',
			name: 'TTL',
			nameJa: '生存時間',
			bits: 8,
			row: 2,
			startBit: 0,
			description:
				'Time To Live。パケットが通過できるルーターの最大数。各ルーターで1減算され、0になると破棄。',
			example: '64',
			color: '#14b8a6'
		},
		{
			id: 'protocol',
			name: 'Protocol',
			nameJa: 'プロトコル',
			bits: 8,
			row: 2,
			startBit: 8,
			description:
				'上位層のプロトコルを示す番号。TCP=6、UDP=17、ICMP=1。',
			example: '6 (TCP)',
			color: '#f43f5e'
		},
		{
			id: 'header-checksum',
			name: 'Header Checksum',
			nameJa: 'ヘッダチェックサム',
			bits: 16,
			row: 2,
			startBit: 16,
			description: 'ヘッダ部分のみのエラー検出用チェックサム。各ルーターでTTL変更時に再計算。',
			example: '0xABCD',
			color: '#6366f1'
		},
		{
			id: 'source-ip',
			name: 'Source IP Address',
			nameJa: '送信元IPアドレス',
			bits: 32,
			row: 3,
			startBit: 0,
			description: '送信元ホストのIPv4アドレス（32ビット）。',
			example: '192.168.1.100',
			color: '#0ea5e9'
		},
		{
			id: 'dest-ip',
			name: 'Destination IP Address',
			nameJa: '宛先IPアドレス',
			bits: 32,
			row: 4,
			startBit: 0,
			description: '宛先ホストのIPv4アドレス（32ビット）。',
			example: '203.0.113.50',
			color: '#10b981'
		}
	]
};

// TCPヘッダ定義（20バイト = 160ビット、オプションなし）
export const TCP_HEADER: HeaderDefinition = {
	type: 'tcp',
	name: 'TCP Header',
	nameJa: 'TCPヘッダ',
	totalBits: 160,
	bitsPerRow: 32,
	fields: [
		{
			id: 'source-port',
			name: 'Source Port',
			nameJa: '送信元ポート',
			bits: 16,
			row: 0,
			startBit: 0,
			description: '送信元のポート番号（0-65535）。一時ポートは通常49152以上。',
			example: '54321',
			color: '#ef4444'
		},
		{
			id: 'dest-port',
			name: 'Destination Port',
			nameJa: '宛先ポート',
			bits: 16,
			row: 0,
			startBit: 16,
			description: '宛先のポート番号。HTTP=80、HTTPS=443、SSH=22など。',
			example: '443',
			color: '#f97316'
		},
		{
			id: 'sequence-number',
			name: 'Sequence Number',
			nameJa: 'シーケンス番号',
			bits: 32,
			row: 1,
			startBit: 0,
			description:
				'送信データの最初のバイトの番号。接続確立時はISN（初期シーケンス番号）。',
			example: '1000',
			color: '#22c55e'
		},
		{
			id: 'ack-number',
			name: 'Acknowledgment Number',
			nameJa: '確認応答番号',
			bits: 32,
			row: 2,
			startBit: 0,
			description:
				'次に受信を期待するバイトの番号。ACKフラグが1のときのみ有効。',
			example: '5001',
			color: '#3b82f6'
		},
		{
			id: 'data-offset',
			name: 'Data Offset',
			nameJa: 'データオフセット',
			bits: 4,
			row: 3,
			startBit: 0,
			description: 'TCPヘッダの長さを32ビット単位で表します。オプションがない場合は5。',
			example: '5',
			color: '#8b5cf6'
		},
		{
			id: 'reserved',
			name: 'Reserved',
			nameJa: '予約',
			bits: 4,
			row: 3,
			startBit: 4,
			description: '将来の使用のために予約されたフィールド。通常は0。',
			example: '0',
			color: '#6b7280'
		},
		{
			id: 'flags',
			name: 'Flags',
			nameJa: 'フラグ',
			bits: 8,
			row: 3,
			startBit: 8,
			description:
				'制御フラグ。CWR, ECE, URG, ACK, PSH, RST, SYN, FINの8ビット。',
			example: 'SYN=1',
			color: '#ec4899'
		},
		{
			id: 'window-size',
			name: 'Window Size',
			nameJa: 'ウィンドウサイズ',
			bits: 16,
			row: 3,
			startBit: 16,
			description:
				'受信可能なデータ量をバイト単位で通知。フロー制御に使用。',
			example: '65535',
			color: '#14b8a6'
		},
		{
			id: 'checksum',
			name: 'Checksum',
			nameJa: 'チェックサム',
			bits: 16,
			row: 4,
			startBit: 0,
			description: 'ヘッダとデータ、疑似ヘッダを含むエラー検出用チェックサム。',
			example: '0x1234',
			color: '#f43f5e'
		},
		{
			id: 'urgent-pointer',
			name: 'Urgent Pointer',
			nameJa: '緊急ポインタ',
			bits: 16,
			row: 4,
			startBit: 16,
			description: 'URGフラグが1のとき、緊急データの終端位置を示すオフセット。',
			example: '0',
			color: '#6366f1'
		}
	]
};

// UDPヘッダ定義（8バイト = 64ビット）
export const UDP_HEADER: HeaderDefinition = {
	type: 'udp',
	name: 'UDP Header',
	nameJa: 'UDPヘッダ',
	totalBits: 64,
	bitsPerRow: 32,
	fields: [
		{
			id: 'source-port',
			name: 'Source Port',
			nameJa: '送信元ポート',
			bits: 16,
			row: 0,
			startBit: 0,
			description: '送信元のポート番号。省略可能で、応答不要な場合は0。',
			example: '54321',
			color: '#ef4444'
		},
		{
			id: 'dest-port',
			name: 'Destination Port',
			nameJa: '宛先ポート',
			bits: 16,
			row: 0,
			startBit: 16,
			description: '宛先のポート番号。DNS=53、DHCP=67/68など。',
			example: '53',
			color: '#f97316'
		},
		{
			id: 'length',
			name: 'Length',
			nameJa: '長さ',
			bits: 16,
			row: 1,
			startBit: 0,
			description: 'ヘッダ（8バイト）とデータを含む全体の長さをバイト単位で表します。',
			example: '512',
			color: '#22c55e'
		},
		{
			id: 'checksum',
			name: 'Checksum',
			nameJa: 'チェックサム',
			bits: 16,
			row: 1,
			startBit: 16,
			description:
				'エラー検出用チェックサム。IPv4では省略可能（0）、IPv6では必須。',
			example: '0xABCD',
			color: '#3b82f6'
		}
	]
};

export const HEADERS: Record<HeaderType, HeaderDefinition> = {
	ip: IP_HEADER,
	tcp: TCP_HEADER,
	udp: UDP_HEADER
};

// パケット構造の状態管理
function createPacketStore() {
	let selectedHeader = $state<HeaderType>('ip');
	let selectedFieldId = $state<string | null>(null);

	const currentHeader = $derived(HEADERS[selectedHeader]);

	const selectedField = $derived(
		selectedFieldId ? currentHeader.fields.find((f) => f.id === selectedFieldId) ?? null : null
	);

	return {
		get selectedHeader() {
			return selectedHeader;
		},
		get selectedFieldId() {
			return selectedFieldId;
		},
		get currentHeader() {
			return currentHeader;
		},
		get selectedField() {
			return selectedField;
		},

		setHeader(header: HeaderType) {
			selectedHeader = header;
			selectedFieldId = null;
		},

		selectField(fieldId: string | null) {
			selectedFieldId = fieldId;
		},

		reset() {
			selectedFieldId = null;
		}
	};
}

export const packetStore = createPacketStore();

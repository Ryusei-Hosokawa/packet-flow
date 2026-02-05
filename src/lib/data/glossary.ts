/**
 * TCP/IP用語集
 * 専門用語とその詳細な説明を管理
 */

export interface GlossaryTerm {
	/** 用語（英語） */
	term: string;
	/** 用語（日本語） */
	termJa?: string;
	/** 正式名称 */
	fullName?: string;
	/** 短い説明（ツールチップ用） */
	short: string;
	/** 詳細な説明 */
	description: string;
	/** 関連用語 */
	related?: string[];
	/** カテゴリ */
	category: 'tcp' | 'ip' | 'udp' | 'osi' | 'general';
}

export const glossary: Record<string, GlossaryTerm> = {
	// TCP関連
	syn: {
		term: 'SYN',
		fullName: 'Synchronize',
		short: '接続開始を要求するフラグ',
		description:
			'TCP接続の確立を開始するためのフラグです。クライアントが「接続したい」という意思を伝えるために使用します。SYNフラグが立っているパケットには、送信側の初期シーケンス番号（ISN）が含まれています。',
		related: ['ack', 'fin', 'rst'],
		category: 'tcp'
	},
	ack: {
		term: 'ACK',
		fullName: 'Acknowledgment',
		short: '受信確認のフラグ',
		description:
			'データを正しく受信したことを相手に伝えるためのフラグです。ACK番号フィールドには「次に期待するシーケンス番号」が入ります。これにより、どこまでデータを受け取ったかを相手に知らせることができます。',
		related: ['syn', 'sequence-number', 'ack-number'],
		category: 'tcp'
	},
	fin: {
		term: 'FIN',
		fullName: 'Finish',
		short: '接続終了を要求するフラグ',
		description:
			'TCP接続の終了を要求するフラグです。「もう送るデータはありません」という意味で、接続を正常に終了する際に使用します。FINを受け取った側はACKで応答し、自分も送信完了したらFINを送ります。',
		related: ['syn', 'rst'],
		category: 'tcp'
	},
	rst: {
		term: 'RST',
		fullName: 'Reset',
		short: '接続を強制リセットするフラグ',
		description:
			'接続を即座に切断するためのフラグです。異常な状態が発生した場合や、存在しないポートへの接続要求があった場合などに使用されます。RSTを受け取ると、接続は直ちに終了します。',
		related: ['fin'],
		category: 'tcp'
	},
	psh: {
		term: 'PSH',
		fullName: 'Push',
		short: 'データを即座に渡すよう要求するフラグ',
		description:
			'受信したデータをバッファに貯めずに、すぐにアプリケーションに渡すよう要求するフラグです。リアルタイム性が求められる通信（Telnetなど）で使用されます。',
		category: 'tcp'
	},
	urg: {
		term: 'URG',
		fullName: 'Urgent',
		short: '緊急データがあることを示すフラグ',
		description:
			'緊急に処理すべきデータが含まれていることを示すフラグです。緊急ポインタフィールドと組み合わせて使用され、優先的に処理すべきデータの位置を示します。',
		category: 'tcp'
	},
	'sequence-number': {
		term: 'シーケンス番号',
		termJa: 'シーケンス番号',
		fullName: 'Sequence Number',
		short: 'パケットの順序を管理する番号',
		description:
			'送信するデータの各バイトに割り当てられる番号です。TCPは信頼性のある通信を実現するため、この番号を使ってデータの順序を管理します。受信側はこの番号を見て、データを正しい順序に並べ替えることができます。',
		related: ['ack-number', 'isn'],
		category: 'tcp'
	},
	'ack-number': {
		term: 'ACK番号',
		termJa: '確認応答番号',
		fullName: 'Acknowledgment Number',
		short: '次に期待するシーケンス番号',
		description:
			'「次に受け取りたいデータのシーケンス番号」を示します。例えば、ACK番号が1001なら「シーケンス番号1000までのデータは受け取りました。次は1001から送ってください」という意味になります。',
		related: ['sequence-number', 'ack'],
		category: 'tcp'
	},
	isn: {
		term: 'ISN',
		fullName: 'Initial Sequence Number',
		short: '初期シーケンス番号',
		description:
			'TCP接続開始時に使用される最初のシーケンス番号です。セキュリティ上の理由から、予測困難なランダムな値が選ばれます。これにより、過去の接続のパケットが誤って受け入れられることを防ぎます。',
		related: ['sequence-number', 'syn'],
		category: 'tcp'
	},
	'window-size': {
		term: 'ウィンドウサイズ',
		termJa: 'ウィンドウサイズ',
		fullName: 'Window Size',
		short: '受信可能なデータ量を示す値',
		description:
			'受信側が一度に受け取れるデータ量（バイト数）を示します。送信側はこの値を超えてデータを送ることができません。これにより、受信側がデータを処理しきれなくなる（オーバーフロー）を防ぎます。',
		related: ['flow-control'],
		category: 'tcp'
	},
	checksum: {
		term: 'チェックサム',
		termJa: 'チェックサム',
		short: 'データの整合性を確認する値',
		description:
			'データが通信中に破損していないかを確認するための値です。送信側がデータから計算した値を含め、受信側が同じ計算をして一致するか確認します。一致しない場合、データは破損していると判断されます。',
		category: 'general'
	},
	'three-way-handshake': {
		term: '3ウェイハンドシェイク',
		termJa: '3ウェイハンドシェイク',
		fullName: 'Three-Way Handshake',
		short: 'TCP接続確立の手順',
		description:
			'TCPで接続を確立するための3段階の手順です。(1) クライアントがSYNを送信、(2) サーバーがSYN+ACKを返信、(3) クライアントがACKを送信。この手順により、双方向の通信が可能であることを確認し、初期シーケンス番号を交換します。',
		related: ['syn', 'ack', 'established'],
		category: 'tcp'
	},
	established: {
		term: 'ESTABLISHED',
		termJa: '接続確立状態',
		short: 'TCP接続が確立された状態',
		description:
			'3ウェイハンドシェイクが完了し、双方向のデータ通信が可能になった状態です。この状態になると、アプリケーション間でデータの送受信を開始できます。',
		related: ['three-way-handshake', 'listen'],
		category: 'tcp'
	},
	listen: {
		term: 'LISTEN',
		termJa: '待受状態',
		short: '接続要求を待っている状態',
		description:
			'サーバーが特定のポートで接続要求（SYNパケット）を待っている状態です。Webサーバーやメールサーバーなど、クライアントからの接続を受け付けるアプリケーションはこの状態で待機しています。',
		related: ['established', 'syn'],
		category: 'tcp'
	},
	'flow-control': {
		term: 'フロー制御',
		termJa: 'フロー制御',
		fullName: 'Flow Control',
		short: '送受信の速度を調整する仕組み',
		description:
			'送信側と受信側の処理速度の差を吸収するための仕組みです。受信側は「まだこれだけ受け取れます」という情報（ウィンドウサイズ）を送信側に伝え、送信側はそれに応じてデータ送信量を調整します。',
		related: ['window-size', 'congestion-control'],
		category: 'tcp'
	},
	'congestion-control': {
		term: '輻輳制御',
		termJa: '輻輳制御',
		fullName: 'Congestion Control',
		short: 'ネットワーク混雑を避ける仕組み',
		description:
			'ネットワークの混雑（輻輳）を検出し、送信量を調整する仕組みです。パケットロスやRTTの増加を検知すると、送信速度を下げてネットワーク全体の安定性を保ちます。スロースタートやCongestion Avoidanceなどのアルゴリズムが使われます。',
		related: ['flow-control', 'slow-start'],
		category: 'tcp'
	},
	'slow-start': {
		term: 'スロースタート',
		termJa: 'スロースタート',
		fullName: 'Slow Start',
		short: '送信量を徐々に増やすアルゴリズム',
		description:
			'TCP接続開始時に、送信速度を低く始めて徐々に増やしていくアルゴリズムです。ネットワークの容量が分からない状態で大量のデータを送ると混雑を引き起こすため、まず少量から始めて安全な速度を探ります。',
		related: ['congestion-control'],
		category: 'tcp'
	},
	retransmission: {
		term: '再送',
		termJa: '再送',
		fullName: 'Retransmission',
		short: '届かなかったデータを再度送信すること',
		description:
			'ACKが一定時間内に届かない場合、パケットが失われたと判断して同じデータを再度送信することです。これにより、ネットワーク上でパケットが失われても、最終的にはデータが確実に届きます。',
		related: ['ack', 'rto'],
		category: 'tcp'
	},
	rto: {
		term: 'RTO',
		fullName: 'Retransmission Timeout',
		short: '再送までの待ち時間',
		description:
			'ACKを待つ時間の上限です。この時間内にACKが届かなければ、パケットが失われたと判断して再送を行います。RTOはネットワークの遅延状況に応じて動的に調整されます。',
		related: ['retransmission', 'rtt'],
		category: 'tcp'
	},
	rtt: {
		term: 'RTT',
		fullName: 'Round-Trip Time',
		short: 'パケットの往復時間',
		description:
			'パケットを送信してからACKが返ってくるまでの時間です。ネットワークの遅延を測る指標として使われ、RTOの計算にも利用されます。',
		related: ['rto'],
		category: 'tcp'
	},

	// IP関連
	ttl: {
		term: 'TTL',
		fullName: 'Time To Live',
		short: 'パケットの生存時間',
		description:
			'パケットがネットワーク上を転送される回数の上限です。ルーターを通過するたびに1減り、0になるとパケットは破棄されます。これにより、ルーティングループでパケットが永遠に回り続けることを防ぎます。通常は64や128が初期値として使われます。',
		related: ['router', 'hop'],
		category: 'ip'
	},
	'ip-address': {
		term: 'IPアドレス',
		termJa: 'IPアドレス',
		fullName: 'Internet Protocol Address',
		short: 'ネットワーク上の機器を識別する番号',
		description:
			'インターネット上の各機器を一意に識別するための番号です。IPv4では32ビット（例：192.168.1.1）、IPv6では128ビットで表されます。送信元と宛先のIPアドレスを使って、パケットは正しい宛先に届けられます。',
		related: ['subnet-mask', 'gateway'],
		category: 'ip'
	},
	protocol: {
		term: 'プロトコル',
		termJa: 'プロトコル',
		short: '通信の規約・手順',
		description:
			'コンピュータ同士が通信するためのルールや手順の集まりです。お互いが同じプロトコルに従うことで、異なるメーカーの機器でも正しく通信できます。TCP、IP、HTTPなどが代表的なプロトコルです。',
		category: 'general'
	},
	port: {
		term: 'ポート',
		termJa: 'ポート番号',
		fullName: 'Port Number',
		short: 'アプリケーションを識別する番号',
		description:
			'同じコンピュータ上で動いている複数のアプリケーションを区別するための番号（0〜65535）です。IPアドレスが「建物の住所」なら、ポート番号は「部屋番号」のようなものです。例えばHTTPは80番、HTTPSは443番を使用します。',
		related: ['well-known-port'],
		category: 'general'
	},
	'well-known-port': {
		term: 'ウェルノウンポート',
		termJa: 'ウェルノウンポート',
		fullName: 'Well-Known Port',
		short: '予約されたポート番号（0-1023）',
		description:
			'0〜1023番のポート番号で、特定のサービス用に予約されています。例：HTTP(80)、HTTPS(443)、FTP(21)、SSH(22)、SMTP(25)など。これらのポートを使うには管理者権限が必要です。',
		related: ['port'],
		category: 'general'
	},
	router: {
		term: 'ルーター',
		termJa: 'ルーター',
		short: 'パケットの転送経路を決める機器',
		description:
			'異なるネットワーク間でパケットを転送する機器です。パケットの宛先IPアドレスを見て、最適な経路を選んで転送します。家庭用のルーターは、家庭内LANとインターネットを接続する役割を果たしています。',
		related: ['ttl', 'hop', 'gateway'],
		category: 'ip'
	},
	hop: {
		term: 'ホップ',
		termJa: 'ホップ',
		short: 'ルーター間の1回の転送',
		description:
			'パケットがルーターを1つ通過することを「1ホップ」と言います。送信元から宛先までの間に何台のルーターを経由したかを「ホップ数」で表します。tracerouteコマンドで経路上のホップを確認できます。',
		related: ['router', 'ttl'],
		category: 'ip'
	},
	gateway: {
		term: 'ゲートウェイ',
		termJa: 'ゲートウェイ',
		fullName: 'Default Gateway',
		short: '外部ネットワークへの出入口',
		description:
			'自分のネットワークから外部のネットワークへパケットを送る際の出入口となるルーターです。宛先が自分のネットワーク内にない場合、パケットはまずゲートウェイに送られます。',
		related: ['router', 'subnet-mask'],
		category: 'ip'
	},
	'subnet-mask': {
		term: 'サブネットマスク',
		termJa: 'サブネットマスク',
		short: 'ネットワーク部とホスト部を区切る値',
		description:
			'IPアドレスのうち、どの部分がネットワークを示し、どの部分がホスト（個々の機器）を示すかを定義する値です。例えば255.255.255.0なら、最初の24ビットがネットワーク部、残り8ビットがホスト部になります。',
		related: ['ip-address', 'gateway'],
		category: 'ip'
	},
	fragmentation: {
		term: 'フラグメンテーション',
		termJa: '分割',
		short: '大きなパケットを小さく分割すること',
		description:
			'パケットのサイズがネットワークの最大転送単位（MTU）を超える場合、IPレイヤーでパケットを小さく分割します。分割されたパケットは宛先で再構築されます。',
		related: ['mtu'],
		category: 'ip'
	},
	mtu: {
		term: 'MTU',
		fullName: 'Maximum Transmission Unit',
		short: '一度に送れるデータの最大サイズ',
		description:
			'ネットワークで一度に転送できるパケットの最大サイズです。イーサネットでは通常1500バイトです。これを超えるデータは分割（フラグメンテーション）が必要になります。',
		related: ['fragmentation'],
		category: 'ip'
	},

	// UDP関連
	datagram: {
		term: 'データグラム',
		termJa: 'データグラム',
		short: 'UDPで送受信されるデータの単位',
		description:
			'UDPで送受信されるデータの単位です。各データグラムは独立しており、前後のデータグラムとの関連性はありません。届く順序も保証されず、届いたかどうかの確認も行われません。',
		related: ['segment', 'packet'],
		category: 'udp'
	},
	connectionless: {
		term: 'コネクションレス',
		termJa: 'コネクションレス',
		short: '接続確立なしで通信する方式',
		description:
			'事前の接続確立（ハンドシェイク）を行わずにデータを送信する通信方式です。UDPはコネクションレス型プロトコルで、すぐにデータを送れる代わりに、到達確認や順序保証がありません。',
		related: ['connection-oriented'],
		category: 'udp'
	},
	'connection-oriented': {
		term: 'コネクション型',
		termJa: 'コネクション型',
		short: '接続確立後に通信する方式',
		description:
			'通信開始前に接続を確立し、終了時に切断する通信方式です。TCPはコネクション型プロトコルで、3ウェイハンドシェイクで接続を確立してから通信を行います。信頼性は高いですが、接続確立のオーバーヘッドがあります。',
		related: ['connectionless', 'three-way-handshake'],
		category: 'tcp'
	},

	// OSI関連
	encapsulation: {
		term: 'カプセル化',
		termJa: 'カプセル化',
		short: 'データに各層のヘッダを付与すること',
		description:
			'上位層から受け取ったデータに、自分の層のヘッダ（制御情報）を付け加えることです。アプリケーション層のデータは、トランスポート層、ネットワーク層、データリンク層を通過する際に、それぞれヘッダが付与されて最終的にフレームになります。',
		related: ['decapsulation', 'pdu'],
		category: 'osi'
	},
	decapsulation: {
		term: '非カプセル化',
		termJa: '非カプセル化',
		short: '各層でヘッダを取り除くこと',
		description:
			'受信側で、各層がそれぞれのヘッダを取り除いてデータを上位層に渡すことです。カプセル化の逆の処理で、最終的にアプリケーションが元のデータを受け取ります。',
		related: ['encapsulation'],
		category: 'osi'
	},
	pdu: {
		term: 'PDU',
		fullName: 'Protocol Data Unit',
		short: '各層でのデータの呼び方',
		description:
			'各層で扱うデータの単位です。アプリケーション層では「データ」「メッセージ」、トランスポート層では「セグメント」（TCP）/「データグラム」（UDP）、ネットワーク層では「パケット」、データリンク層では「フレーム」と呼びます。',
		related: ['segment', 'packet', 'frame'],
		category: 'osi'
	},
	segment: {
		term: 'セグメント',
		termJa: 'セグメント',
		short: 'TCPでのデータの単位',
		description:
			'トランスポート層（TCP）でのPDUの呼び名です。アプリケーションから受け取ったデータにTCPヘッダを付けたものがセグメントです。',
		related: ['pdu', 'datagram', 'packet'],
		category: 'tcp'
	},
	packet: {
		term: 'パケット',
		termJa: 'パケット',
		short: 'ネットワーク層でのデータの単位',
		description:
			'ネットワーク層（IP）でのPDUの呼び名です。セグメントやデータグラムにIPヘッダを付けたものがパケットです。一般的に、ネットワーク上を流れるデータの塊を指す言葉としても使われます。',
		related: ['pdu', 'segment', 'frame'],
		category: 'ip'
	},
	frame: {
		term: 'フレーム',
		termJa: 'フレーム',
		short: 'データリンク層でのデータの単位',
		description:
			'データリンク層でのPDUの呼び名です。パケットにイーサネットヘッダ（MACアドレスなど）とトレーラ（FCS）を付けたものがフレームです。物理的なネットワーク上を実際に流れるのはこのフレームです。',
		related: ['pdu', 'packet', 'mac-address'],
		category: 'osi'
	},
	'mac-address': {
		term: 'MACアドレス',
		termJa: 'MACアドレス',
		fullName: 'Media Access Control Address',
		short: 'ネットワーク機器の物理的な識別子',
		description:
			'ネットワークインターフェース（LANカードなど）に割り当てられた48ビットの固有の識別子です。IPアドレスが「論理的な住所」なら、MACアドレスは「物理的な識別番号」です。同一ネットワーク内での通信に使用されます。',
		related: ['frame', 'arp'],
		category: 'osi'
	},
	arp: {
		term: 'ARP',
		fullName: 'Address Resolution Protocol',
		short: 'IPアドレスからMACアドレスを調べるプロトコル',
		description:
			'IPアドレスから対応するMACアドレスを取得するためのプロトコルです。同じネットワーク内の機器と通信する際、宛先のMACアドレスが必要になりますが、通常知っているのはIPアドレスだけなので、ARPで問い合わせを行います。',
		related: ['mac-address', 'ip-address'],
		category: 'osi'
	},
	dns: {
		term: 'DNS',
		fullName: 'Domain Name System',
		short: 'ドメイン名をIPアドレスに変換するシステム',
		description:
			'人間が覚えやすいドメイン名（例：www.example.com）を、コンピュータが理解できるIPアドレス（例：93.184.216.34）に変換するシステムです。インターネットの「電話帳」のような役割を果たしています。',
		related: ['ip-address'],
		category: 'general'
	},
	broadcast: {
		term: 'ブロードキャスト',
		termJa: 'ブロードキャスト',
		short: '同一ネットワーク内の全端末に一斉送信',
		description:
			'ネットワーク上のすべての機器に同時にデータを送信する通信方式です。宛先を個別に指定せず、ネットワーク全体に「放送」します。ARPやDHCPなどで使用されます。UDPはブロードキャストをサポートしていますが、TCPは1対1の通信のためブロードキャストには対応していません。',
		related: ['datagram', 'arp'],
		category: 'udp'
	},
	'transport-layer': {
		term: 'トランスポート層',
		termJa: 'トランスポート層',
		fullName: 'Transport Layer',
		short: '端末間の通信を制御する層',
		description:
			'OSI参照モデルの第4層で、端末間（エンドツーエンド）の通信を制御します。ポート番号を使ってアプリケーションを識別し、TCPでは信頼性のある通信を、UDPでは高速な通信を提供します。データの単位はセグメント（TCP）またはデータグラム（UDP）と呼ばれます。',
		related: ['port', 'segment', 'datagram'],
		category: 'osi'
	}
};

/**
 * 用語を取得する
 */
export function getTerm(key: string): GlossaryTerm | undefined {
	return glossary[key.toLowerCase()];
}

/**
 * カテゴリで用語をフィルタリング
 */
export function getTermsByCategory(category: GlossaryTerm['category']): GlossaryTerm[] {
	return Object.values(glossary).filter((term) => term.category === category);
}

/**
 * 関連用語を取得
 */
export function getRelatedTerms(key: string): GlossaryTerm[] {
	const term = getTerm(key);
	if (!term?.related) return [];
	return term.related.map((relatedKey) => glossary[relatedKey]).filter(Boolean);
}

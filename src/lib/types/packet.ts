export interface TCPHeader {
	sourcePort: number; // 16bit (0-65535)
	destPort: number; // 16bit
	sequenceNumber: number; // 32bit
	ackNumber: number; // 32bit
	dataOffset: number; // 4bit
	flags: TCPFlags;
	windowSize: number; // 16bit
	checksum: number; // 16bit
	urgentPointer: number; // 16bit
}

export interface TCPFlags {
	URG: boolean;
	ACK: boolean;
	PSH: boolean;
	RST: boolean;
	SYN: boolean;
	FIN: boolean;
}

export interface UDPHeader {
	sourcePort: number; // 16bit
	destPort: number; // 16bit
	length: number; // 16bit
	checksum: number; // 16bit
}

export interface IPHeader {
	version: 4 | 6;
	headerLength: number;
	totalLength: number;
	ttl: number;
	protocol: 'TCP' | 'UDP' | 'ICMP';
	sourceIP: string;
	destIP: string;
}

// パケット構造可視化用の型定義
export type HeaderType = 'ip' | 'tcp' | 'udp';

export interface HeaderField {
	id: string;
	name: string;
	nameJa: string;
	bits: number;
	row: number; // 行番号（0から開始）
	startBit: number; // 行内の開始ビット位置
	description: string;
	example: string;
	color: string;
}

export interface HeaderDefinition {
	type: HeaderType;
	name: string;
	nameJa: string;
	totalBits: number;
	bitsPerRow: number;
	fields: HeaderField[];
}

// TCP vs UDP 比較用の型定義
export type ProtocolType = 'tcp' | 'udp';

export interface ComparisonItem {
	category: string;
	tcp: string;
	udp: string;
	description: string;
}

export interface UseCaseItem {
	protocol: ProtocolType;
	name: string;
	nameJa: string;
	description: string;
	icon: string;
}

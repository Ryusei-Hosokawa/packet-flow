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

export interface NetworkInterface {
	name: string;
	ipAddress: string;
	macAddress: string;
	isUp: boolean;
}

export interface PingResult {
	host: string;
	time: number; // ms
	ttl: number;
	sequence: number;
	success: boolean;
}

export interface TracerouteHop {
	hop: number;
	host: string;
	ip: string;
	times: number[]; // ms
}

export interface DNSRecord {
	name: string;
	type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'TXT';
	value: string;
	ttl: number;
}

// OSI参照モデル
export type OSILayerNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface OSILayer {
	number: OSILayerNumber;
	name: string;
	nameJa: string;
	description: string;
	protocols: string[];
	pdu: string; // Protocol Data Unit
	devices: string[];
	color: string;
}

// TCP/IPモデル
export type TCPIPLayerNumber = 1 | 2 | 3 | 4;

export interface TCPIPLayer {
	number: TCPIPLayerNumber;
	name: string;
	nameJa: string;
	description: string;
	protocols: string[];
	osiMapping: OSILayerNumber[]; // 対応するOSI層
	color: string;
}

export type ModelType = 'osi' | 'tcpip' | 'comparison';

export interface LayerSelection {
	model: ModelType;
	layerNumber: number | null;
}

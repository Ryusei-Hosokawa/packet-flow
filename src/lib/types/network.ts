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

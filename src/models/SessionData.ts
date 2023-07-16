export interface SessionData {
	eventName ?: string;
	name ?: string;
	wish ?: string;

}

export function initial(): SessionData {
	return {
		eventName : undefined,
		name : undefined,
		wish : undefined
	};
}
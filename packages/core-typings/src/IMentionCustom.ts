import type { IRocketChatRecord } from './IRocketChatRecord';

export interface IMentionCustom extends IRocketChatRecord {
	name: string;
	usernames: string[];
}
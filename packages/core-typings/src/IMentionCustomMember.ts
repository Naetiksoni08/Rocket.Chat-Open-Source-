import type { IRocketChatRecord } from './IRocketChatRecord';

export interface IMentionCustomMember extends IRocketChatRecord {
    customMentionId: string;
    userId: string;
    addedBy: string;
    addedAt: Date;
}
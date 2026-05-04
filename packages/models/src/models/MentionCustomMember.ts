import type { RocketChatRecordDeleted } from '@rocket.chat/core-typings';
import type { IMentionCustomMember } from '@rocket.chat/core-typings';
import type { IMentionCustomMemberModel } from '@rocket.chat/model-typings';
import type { InsertionModel } from '@rocket.chat/model-typings';
import type { Collection, FindCursor, Db, FindOptions, IndexDescription, InsertOneResult } from 'mongodb';

import { BaseRaw } from './BaseRaw';


export class MentionCustomMemberRaw extends BaseRaw<IMentionCustomMember> implements IMentionCustomMemberModel {
    constructor(db: Db, trash?: Collection<RocketChatRecordDeleted<IMentionCustomMember>>) {
        super(db, 'custom_mention_members', trash);
    }

    protected override modelIndexes(): IndexDescription[] {
        return [{ key: { customMentionId: 1, userId: 1 } }];
    }
    findByMentionId(mentionId: string, options?: FindOptions<IMentionCustomMember>): FindCursor<IMentionCustomMember> {
        return this.find({ customMentionId: mentionId }, options);
    }
    findByUserId(userId: string, options?: FindOptions<IMentionCustomMember>): FindCursor<IMentionCustomMember> {
        return this.find({ userId }, options);
    }
    create(data: InsertionModel<IMentionCustomMember>): Promise<InsertOneResult> {
        return this.insertOne(data);
    }
    deleteByMentionId(mentionId: string): Promise<unknown> {
        return this.deleteMany({ customMentionId: mentionId });
    }

}


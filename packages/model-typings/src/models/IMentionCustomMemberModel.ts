import type { FindCursor, FindOptions, InsertOneResult } from 'mongodb';
import type {  IMentionCustomMember } from '@rocket.chat/core-typings';
import type { IBaseModel, InsertionModel } from './IBaseModel';


export interface IMentionCustomMemberModel extends IBaseModel<IMentionCustomMember> {
    findByMentionId(mentionId: string, options?: FindOptions<IMentionCustomMember>): FindCursor<IMentionCustomMember>;
    findByUserId(userId: string, options?: FindOptions<IMentionCustomMember>): FindCursor<IMentionCustomMember>;
    create(data: InsertionModel<IMentionCustomMember>): Promise<InsertOneResult>;
    deleteByMentionId(mentionId: string): Promise<unknown>;
  }


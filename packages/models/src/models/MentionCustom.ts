import type { RocketChatRecordDeleted } from '@rocket.chat/core-typings';
import type { IMentionCustom } from '@rocket.chat/core-typings';
import type { IMentionCustomModel } from '@rocket.chat/model-typings';
import type { InsertionModel } from '@rocket.chat/model-typings';
import type { Collection, FindCursor, Db, FindOptions, IndexDescription, InsertOneResult, UpdateResult, WithId } from 'mongodb';

import { BaseRaw } from './BaseRaw';

export class MentionCustomRaw extends BaseRaw<IMentionCustom> implements IMentionCustomModel {
	constructor(db: Db, trash?: Collection<RocketChatRecordDeleted<IMentionCustom>>) {
		super(db, 'custom_mentions', trash);
	}

	protected override modelIndexes(): IndexDescription[] {
		return [{ key: { name: 1 } }];
	}

	findOneByName(name: string, options?: FindOptions<IMentionCustom>): Promise<IMentionCustom | null> {
		return this.findOne({ name }, options);
	}

	findByName(name: string, options?: FindOptions<IMentionCustom>): FindCursor<IMentionCustom> {
		return this.find({ name }, options);
	}

	create(data: InsertionModel<IMentionCustom>): Promise<InsertOneResult<WithId<IMentionCustom>>> {
		return this.insertOne(data);
	}

	updateById(_id: string, data: Partial<IMentionCustom>): Promise<UpdateResult> {
		return this.updateOne({ _id }, { $set: data });
	}

	deleteById(_id: string): Promise<unknown> {
		return this.deleteOne({ _id });
	}
}
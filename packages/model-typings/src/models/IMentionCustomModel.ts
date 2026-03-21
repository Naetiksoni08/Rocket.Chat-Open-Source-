import type { FindCursor, FindOptions, InsertOneResult, UpdateResult, WithId } from 'mongodb';
import type { IBaseModel, InsertionModel } from './IBaseModel';

export interface IMentionCustom {
	_id: string;
	name: string;
	usernames: string[];
	_updatedAt: Date;
}

export interface IMentionCustomModel extends IBaseModel<IMentionCustom> {
	findOneByName(name: string, options?: FindOptions<IMentionCustom>): Promise<IMentionCustom | null>;
	findByName(name: string, options?: FindOptions<IMentionCustom>): FindCursor<IMentionCustom>;
	create(data: InsertionModel<IMentionCustom>): Promise<InsertOneResult<WithId<IMentionCustom>>>;
	updateById(_id: string, data: Partial<IMentionCustom>): Promise<UpdateResult>;
	deleteById(_id: string): Promise<unknown>;
}
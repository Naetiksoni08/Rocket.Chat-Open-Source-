import { MentionCustom } from '@rocket.chat/models';
import { Meteor } from 'meteor/meteor';

import { insertOrUpdateMention } from '../../../custom-mentions/server/lib/insertOrUpdateMention';
import { API } from '../api';
import { getPaginationItems } from '../helpers/getPaginationItems';

// LIST
API.v1.addRoute(
	'custom-mentions.list',
	{ authRequired: true },
	{
		async get() {
			const { offset, count } = await getPaginationItems(this.queryParams);
			const { name, _id } = this.queryParams;
			const cursor = _id
				? MentionCustom.find({ _id })          // ← _id se fetch
				: name
					? MentionCustom.findByName(name)
					: MentionCustom.find({});
			const total = await cursor.count();
			const mentions = await cursor.skip(offset).limit(count).toArray();

			return API.v1.success({
				mentions,
				count: mentions.length,
				offset,
				total,
			});
		},
	},
);

// CREATE
API.v1.addRoute(
	'custom-mentions.create',
	{ authRequired: true },
	{
		async post() {
			const { name, usernames } = this.bodyParams;

			if (!name) {
				return API.v1.failure('Name is required');
			}

			if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
				return API.v1.failure('At least one member is required');
			}

			try {
				const result = await insertOrUpdateMention(this.userId, {
					name,
					usernames,
				});

				return API.v1.success({ mention: result });
			} catch (err) {
				if (err instanceof Meteor.Error) {
					return API.v1.failure(err.message);
				}
				return API.v1.failure('An error occurred');
			}
		},
	},
);

// DELETE
API.v1.addRoute(
	'custom-mentions.delete',
	{ authRequired: true },
	{
		async post() {
			const { mentionId } = this.bodyParams;

			if (!mentionId) {
				return API.v1.failure('mentionId is required');
			}

			await MentionCustom.deleteById(mentionId);

			return API.v1.success();
		},
	},
);

//Update
API.v1.addRoute(
	'custom-mentions.update',
	{ authRequired: true },
	{
		async post() {
			const { mentionId, name, usernames } = this.bodyParams;

			if (!mentionId) return API.v1.failure('mentionId is required');
			if (!name) return API.v1.failure('name is required');
			if (!usernames || !Array.isArray(usernames)) return API.v1.failure('usernames is required');

			try {
				await insertOrUpdateMention(this.userId, {
					_id: mentionId,
					name,
					usernames,
				});

				return API.v1.success();
			} catch (err) {
				if (err instanceof Meteor.Error) {
					return API.v1.failure(err.message);
				}
				return API.v1.failure('An error occurred');
			}
		},
	},
);
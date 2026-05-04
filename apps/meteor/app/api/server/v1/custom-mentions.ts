import { MentionCustom, MentionCustomMember, Users } from '@rocket.chat/models';
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
				? MentionCustom.find({ _id })
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
 
// CREATE — only name, no usernames
API.v1.addRoute(
	'custom-mentions.create',
	{ authRequired: true },
	{
		async post() {
			const { name } = this.bodyParams;
 
			if (!name) {
				return API.v1.failure('Name is required');
			}
 
			try {
				const result = await insertOrUpdateMention(this.userId, { name });
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
 
// DELETE — also delete all members
API.v1.addRoute(
	'custom-mentions.delete',
	{ authRequired: true },
	{
		async post() {
			const { mentionId } = this.bodyParams;
 
			if (!mentionId) {
				return API.v1.failure('mentionId is required');
			}
 
			// Delete all members first, then the mention
			await MentionCustomMember.deleteByMentionId(mentionId);
			await MentionCustom.deleteById(mentionId);
 
			return API.v1.success();
		},
	},
);
 
// UPDATE — only name
API.v1.addRoute(
	'custom-mentions.update',
	{ authRequired: true },
	{
		async post() {
			const { mentionId, name } = this.bodyParams;
 
			if (!mentionId) return API.v1.failure('mentionId is required');
			if (!name) return API.v1.failure('name is required');
 
			try {
				await insertOrUpdateMention(this.userId, { _id: mentionId, name });
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
 
// ==================== MEMBER ENDPOINTS ====================
 
// LIST MEMBERS of a custom mention
API.v1.addRoute(
	'custom-mentions.members',
	{ authRequired: true },
	{
		async get() {
			const { mentionId } = this.queryParams;
 
			if (!mentionId) {
				return API.v1.failure('mentionId is required');
			}
 
			const members = await MentionCustomMember.findByMentionId(mentionId).toArray();
 
			// Get user details for each member
			const userIds = members.map((m) => m.userId);
			const users = await Users.findByIds(userIds).toArray();
 
			// Map members with user info
			const membersWithInfo = members.map((member) => {
				const user = users.find((u) => u._id === member.userId);
				return {
					_id: member._id,
					userId: member.userId,
					username: user?.username || 'unknown',
					name: user?.name || '',
					addedAt: member.addedAt,
				};
			});
 
			return API.v1.success({ members: membersWithInfo });
		},
	},
);
 
// ADD MEMBER to a custom mention
API.v1.addRoute(
	'custom-mentions.addMember',
	{ authRequired: true },
	{
		async post() {
			const { mentionId, username } = this.bodyParams;
 
			if (!mentionId) return API.v1.failure('mentionId is required');
			if (!username) return API.v1.failure('username is required');
 
			// Check mention exists
			const mention = await MentionCustom.findOne({ _id: mentionId });
			if (!mention) {
				return API.v1.failure('Mention not found');
			}
 
			// Find user by username
			const user = await Users.findOneByUsername(username);
			if (!user) {
				return API.v1.failure('User not found');
			}
 
			// Check if already a member
			const existingMembers = await MentionCustomMember.findByMentionId(mentionId).toArray();
			const alreadyMember = existingMembers.find((m) => m.userId === user._id);
			if (alreadyMember) {
				return API.v1.failure('User is already a member');
			}
 
			await MentionCustomMember.create({
				customMentionId: mentionId,
				userId: user._id,
				addedBy: this.userId,
				addedAt: new Date(),
			});
 
			return API.v1.success();
		},
	},
);
 
// REMOVE MEMBER from a custom mention
API.v1.addRoute(
	'custom-mentions.removeMember',
	{ authRequired: true },
	{
		async post() {
			const { mentionId, userId } = this.bodyParams;
 
			if (!mentionId) return API.v1.failure('mentionId is required');
			if (!userId) return API.v1.failure('userId is required');
 
			await MentionCustomMember.deleteMany({ customMentionId: mentionId, userId });
 
			return API.v1.success();
		},
	},
);
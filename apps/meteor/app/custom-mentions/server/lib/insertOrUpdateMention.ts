import { MentionCustom } from '@rocket.chat/models';
import { Meteor } from 'meteor/meteor';
 
import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
 
export type CustomMentionData = {
	_id?: string;
	name: string;
};
 
export async function insertOrUpdateMention(userId: string | null, mentionData: CustomMentionData): Promise<CustomMentionData> {
	if (!userId || !(await hasPermissionAsync(userId, 'manage-custom-mentions'))) {
		throw new Meteor.Error('not_authorized');
	}
 
	if (!mentionData.name.trim()) {
		throw new Meteor.Error('error-the-field-is-required', 'The field Name is required');
	}
 
	// Duplicate name check
	const existing = await MentionCustom.findOneByName(mentionData.name);
	if (existing && existing._id !== mentionData._id) {
		throw new Meteor.Error('error-name-already-in-use', 'Custom mention name already in use');
	}
 
	if (!mentionData._id) {
		// Insert
		const result = await MentionCustom.create({
			name: mentionData.name,
		});
		return { ...mentionData, _id: result.insertedId };
	}
 
	// Update
	await MentionCustom.updateById(mentionData._id, {
		name: mentionData.name,
	});
 
	return mentionData;
}
import type { IMentionCustom } from '@rocket.chat/core-typings';

import { ajv } from './Ajv';
import type { PaginatedResult } from '../helpers/PaginatedResult';

// CREATE — only name, no usernames
type MentionCustomCreateProps = {
	name: string;
};

const mentionCustomCreatePropsSchema = {
	type: 'object',
	properties: {
		name: {
			type: 'string',
		},
	},
	required: ['name'],
	additionalProperties: false,
};

export const isMentionCustomCreate = ajv.compile<MentionCustomCreateProps>(mentionCustomCreatePropsSchema);

// DELETE
type MentionCustomDeleteProps = {
	mentionId: string;
};

const mentionCustomDeletePropsSchema = {
	type: 'object',
	properties: {
		mentionId: {
			type: 'string',
		},
	},
	required: ['mentionId'],
	additionalProperties: false,
};

export const isMentionCustomDelete = ajv.compile<MentionCustomDeleteProps>(mentionCustomDeletePropsSchema);

// UPDATE — only name, no usernames
type MentionCustomUpdateProps = {
	mentionId: string;
	name: string;
};

const mentionCustomUpdatePropsSchema = {
	type: 'object',
	properties: {
		mentionId: { type: 'string' },
		name: { type: 'string' },
	},
	required: ['mentionId', 'name'],
	additionalProperties: false,
};

export const isMentionCustomUpdate = ajv.compile<MentionCustomUpdateProps>(mentionCustomUpdatePropsSchema);

// MEMBER TYPES
type MentionCustomMembersProps = {
	mentionId: string;
};

type MentionCustomAddMemberProps = {
	mentionId: string;
	username: string;
};

type MentionCustomRemoveMemberProps = {
	mentionId: string;
	userId: string;
};

type MemberInfo = {
	_id: string;
	userId: string;
	username: string;
	name: string;
	addedAt: Date;
};

// ENDPOINTS
export type MentionCustomEndpoints = {
	'/v1/custom-mentions.list': {
		GET: (params: { name?: string; _id?: string; offset?: number; count?: number }) => PaginatedResult<{
			mentions: IMentionCustom[];
		}>;
	};
	'/v1/custom-mentions.create': {
		POST: (params: MentionCustomCreateProps) => { mention: IMentionCustom };
	};
	'/v1/custom-mentions.delete': {
		POST: (params: MentionCustomDeleteProps) => void;
	};
	'/v1/custom-mentions.update': {
		POST: (params: MentionCustomUpdateProps) => void;
	};
	'/v1/custom-mentions.members': {
		GET: (params: MentionCustomMembersProps) => { members: MemberInfo[] };
	};
	'/v1/custom-mentions.addMember': {
		POST: (params: MentionCustomAddMemberProps) => void;
	};
	'/v1/custom-mentions.removeMember': {
		POST: (params: MentionCustomRemoveMemberProps) => void;
	};
};
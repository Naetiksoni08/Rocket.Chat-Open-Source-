import type { IMentionCustom } from '@rocket.chat/core-typings';
import { ajv } from './Ajv';
import type { PaginatedResult } from '../helpers/PaginatedResult';

type MentionCustomCreateProps = {
	name: string;
	usernames: string[];
};

const mentionCustomCreatePropsSchema = {
	type: 'object',
	properties: {
		name: {
			type: 'string',
		},
		usernames: {
			type: 'array',
			items: { type: 'string' },
		},
	},
	required: ['name', 'usernames'],
	additionalProperties: false,
};

export const isMentionCustomCreate = ajv.compile<MentionCustomCreateProps>(mentionCustomCreatePropsSchema);

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

export type MentionCustomEndpoints = {
	'/v1/custom-mentions.list': {
		GET: (params: { name?: string; offset?: number; count?: number }) => PaginatedResult<{
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
		POST: (params: { mentionId: string; name: string; usernames: string[] }) => void;
	};
};
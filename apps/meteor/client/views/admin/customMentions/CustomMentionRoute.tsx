import { Button } from '@rocket.chat/fuselage';
import {
	ContextualbarHeader,
	ContextualbarClose,
	ContextualbarDialog,
	ContextualbarTitle,
	Page,
	PageHeader,
	PageContent,
} from '@rocket.chat/ui-client';
import { useRoute, useRouteParameter, usePermission } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import type { IMentionCustom } from '@rocket.chat/core-typings';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddCustomMention from './AddCustomMention';
import CustomMention from './CustomMention';
import EditCustomMention from './EditCustomMention'; 
import NotAuthorizedPage from '../../notAuthorized/NotAuthorizedPage';

const CustomMentionRoute = (): ReactElement => {
	const { t } = useTranslation();
	const route = useRoute('custom-mentions');
	const context = useRouteParameter('context');
	// const id = useRouteParameter('id');
	const canManageMentions = usePermission('manage-custom-mentions');
	const [selectedMention, setSelectedMention] = useState<IMentionCustom | null>(null);

	const handleItemClick = (mention: IMentionCustom) => (): void => {
		setSelectedMention(mention);
		route.push({ context: 'edit', id: mention._id });
	};

	const handleAddMention = useCallback(() => {
		route.push({ context: 'new' });
	}, [route]);

	const handleClose = (): void => {
		route.push({});
	};

	const reload = useRef(() => null);

	const handleChange = useCallback(() => {
		reload.current();
	}, [reload]);

	if (!canManageMentions) {
		return <NotAuthorizedPage />;
	}

	return (
		<Page flexDirection='row'>
			<Page name='admin-custom-mentions'>
				<PageHeader title={t('Custom_Mentions')}>
					<Button primary onClick={handleAddMention} aria-label={t('New')}>
						{t('New')}
					</Button>
				</PageHeader>
				<PageContent>
					<CustomMention reload={reload} onClick={handleItemClick} />
				</PageContent>
			</Page>

			{context && (
				<ContextualbarDialog onClose={handleClose}>
					<ContextualbarHeader>
						<ContextualbarTitle>
							{context === 'edit' && t('Edit_Custom_Mention')}
							{context === 'new' && t('Add_Custom_Mention')}
						</ContextualbarTitle>
						<ContextualbarClose onClick={handleClose} />
					</ContextualbarHeader>
					{context === 'new' && (
						<AddCustomMention close={handleClose} onChange={handleChange} />
					)}
					{context === 'edit' && selectedMention && (
						<EditCustomMention data={selectedMention} close={handleClose} onChange={handleChange} />
					)}
				</ContextualbarDialog>
			)}
		</Page>
	);
};

export default CustomMentionRoute;
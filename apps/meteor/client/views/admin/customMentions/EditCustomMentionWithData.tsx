import { Callout } from '@rocket.chat/fuselage';
import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FormSkeleton } from '../../../components/Skeleton';
import EditCustomMention from './EditCustomMention';
import { IMentionCustom } from '@rocket.chat/core-typings';

type EditCustomMentionWithDataProps = {
	_id: string;
	close: () => void;
	onChange: () => void;
};

const EditCustomMentionWithData = ({ _id, onChange, close }: EditCustomMentionWithDataProps) => {
	const { t } = useTranslation();
	const query = useMemo(() => ({ name: _id }), [_id]);

	const getMentions = useEndpoint('GET', '/v1/custom-mentions.list');
	const { data, isPending, error, refetch } = useQuery({
		queryKey: ['custom-mentions', query],
		queryFn: () => getMentions(query),
	});

	if (isPending) {
		return <FormSkeleton pi={20} />;
	}

	if (error || !data || !data.mentions || data.mentions.length < 1) {
		return <Callout title={t('Custom_Mention_Error_Invalid')} type='danger' />;
	}

	const handleChange = (): void => {
		onChange?.();
		refetch?.();
	};

	return <EditCustomMention data={data.mentions[0] as unknown as IMentionCustom} close={close} onChange={handleChange} />;
};

export default EditCustomMentionWithData;
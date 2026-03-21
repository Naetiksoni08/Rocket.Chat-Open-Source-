import { Box, Pagination, States, StatesActions, StatesAction, StatesIcon, StatesTitle } from '@rocket.chat/fuselage';
import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import {
	GenericTable,
	GenericTableBody,
	GenericTableCell,
	GenericTableHeader,
	GenericTableHeaderCell,
	GenericTableLoadingTable,
	GenericTableRow,
	usePagination,
	useSort,
} from '@rocket.chat/ui-client';
import { useTranslation, useEndpoint } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { MutableRefObject } from 'react';
import type { IMentionCustom } from '@rocket.chat/core-typings';  
import { useEffect, useMemo, useState } from 'react';

import FilterByText from '../../../components/FilterByText';
import GenericNoResults from '../../../components/GenericNoResults';

type CustomMentionProps = {
	reload: MutableRefObject<() => void>;
	onClick: (mention: IMentionCustom) => () => void;
};

const CustomMention = ({ onClick, reload }: CustomMentionProps) => {
	const t = useTranslation();
	const [text, setText] = useState('');
	const { sortBy, sortDirection, setSort } = useSort<'name'>('name');
	const { current, itemsPerPage, setItemsPerPage: onSetItemsPerPage, setCurrent: onSetCurrent, ...paginationProps } = usePagination();

	const query = useDebouncedValue(
		useMemo(
			() => ({
				name: text,
				sort: `{ "${sortBy}": ${sortDirection === 'asc' ? 1 : -1} }`,
				count: itemsPerPage,
				offset: current,
			}),
			[text, itemsPerPage, current, sortBy, sortDirection],
		),
		500,
	);

	const headers = useMemo(
		() => [
			<GenericTableHeaderCell key='name' direction={sortDirection} active={sortBy === 'name'} onClick={setSort} sort='name' w='x200'>
				{t('Name')}
			</GenericTableHeaderCell>,
			<GenericTableHeaderCell key='members' w='x400'>
				{t('Members')}
			</GenericTableHeaderCell>,
		],
		[setSort, sortDirection, sortBy, t],
	);

	const getMentionList = useEndpoint('GET', '/v1/custom-mentions.list');
	const { data, refetch, isSuccess, isLoading, isError } = useQuery({
		queryKey: ['getMentionList', query],
		queryFn: () => getMentionList(query),
	});

	useEffect(() => {
		reload.current = refetch;
	}, [reload, refetch]);

	return (
		<>
			<FilterByText value={text} onChange={(event) => setText(event.target.value)} />
			{isLoading && (
				<GenericTable>
					<GenericTableHeader>{headers}</GenericTableHeader>
					<GenericTableBody>
						<GenericTableLoadingTable headerCells={2} />
					</GenericTableBody>
				</GenericTable>
			)}
			{isSuccess && data && data.mentions.length > 0 && (
				<>
					<GenericTable aria-label={t('Custom_Mentions')}>
						<GenericTableHeader>{headers}</GenericTableHeader>
						<GenericTableBody>
							{data.mentions.map((mention) => (
								<GenericTableRow
									key={mention._id}
									onKeyDown={onClick(mention as unknown as IMentionCustom)}
									onClick={onClick(mention as unknown as IMentionCustom)}
									tabIndex={0}
									role='link'
									action
								>
									<GenericTableCell color='default'>
										<Box withTruncatedText>@{mention.name}</Box>
									</GenericTableCell>
									<GenericTableCell color='default'>
										<Box withTruncatedText>{mention.usernames.join(', ')}</Box>
									</GenericTableCell>
								</GenericTableRow>
							))}
						</GenericTableBody>
					</GenericTable>
					<Pagination
						divider
						current={current}
						itemsPerPage={itemsPerPage}
						count={data?.total || 0}
						onSetItemsPerPage={onSetItemsPerPage}
						onSetCurrent={onSetCurrent}
						{...paginationProps}
					/>
				</>
			)}
			{isSuccess && data && data.mentions.length === 0 && <GenericNoResults />}
			{isError && (
				<States>
					<StatesIcon name='warning' variation='danger' />
					<StatesTitle>{t('Something_went_wrong')}</StatesTitle>
					<StatesActions>
						<StatesAction onClick={() => refetch()}>{t('Reload_page')}</StatesAction>
					</StatesActions>
				</States>
			)}
		</>
	);
};

export default CustomMention;
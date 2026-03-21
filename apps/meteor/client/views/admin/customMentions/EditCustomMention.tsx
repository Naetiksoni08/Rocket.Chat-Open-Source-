import { Button, ButtonGroup, Field, FieldGroup, FieldLabel, FieldRow, FieldError, TextInput } from '@rocket.chat/fuselage';
import { GenericModal, ContextualbarScrollableContent, ContextualbarFooter } from '@rocket.chat/ui-client';
import { useSetModal, useToastMessageDispatch, useEndpoint } from '@rocket.chat/ui-contexts';
import type { ChangeEvent } from 'react';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@rocket.chat/fuselage';


import type { IMentionCustom } from '@rocket.chat/core-typings';

type EditCustomMentionProps = {
	close: () => void;
	onChange: () => void;
	data: IMentionCustom;
};

const EditCustomMention = ({ close, onChange, data }: EditCustomMentionProps) => {
	const { t } = useTranslation();
	const setModal = useSetModal();
	const dispatchToastMessage = useToastMessageDispatch();

	const { _id, name: previousName, usernames: previousUsernames } = data;

	const [name, setName] = useState(() => data?.name ?? '');
	const [members, setMembers] = useState(() => data?.usernames?.join(', ') ?? '');
	const [errors, setErrors] = useState({ name: false, members: false });

	useEffect(() => {
		setName(previousName || '');
		setMembers(previousUsernames?.join(', ') || '');
	}, [previousName, previousUsernames, _id]);

	const hasUnsavedChanges = useMemo(
		() => previousName !== name || members !== previousUsernames.join(', '),
		[previousName, name, members, previousUsernames],
	);

	const updateMention = useEndpoint('POST', '/v1/custom-mentions.update');
	const deleteMention = useEndpoint('POST', '/v1/custom-mentions.delete');

	const handleSave = useCallback(async () => {
		let hasError = false;

		if (!name.trim()) {
			setErrors((prev) => ({ ...prev, name: true }));
			hasError = true;
		}

		if (!members.trim()) {
			setErrors((prev) => ({ ...prev, members: true }));
			hasError = true;
		}

		if (hasError) return;

		const usernames = members.split(',').map((m) => m.trim()).filter(Boolean);

		try {
			await updateMention({ mentionId: _id, name: name.trim(), usernames });
			dispatchToastMessage({ type: 'success', message: t('Custom_Mention_Updated_Successfully') });
			onChange();
			close();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
		}
	}, [name, members, _id, updateMention, dispatchToastMessage, t, onChange, close]);

	const handleDeleteButtonClick = useCallback(() => {
		const handleDelete = async () => {
			try {
				await deleteMention({ mentionId: _id });
				dispatchToastMessage({ type: 'success', message: t('Custom_Mention_Deleted_Successfully') });
			} finally {
				onChange();
				setModal(null);
				close();
			}
		};

		setModal(
			<GenericModal
				variant='danger'
				onConfirm={handleDelete}
				onCancel={() => setModal(null)}
				onClose={() => setModal(null)}
				confirmText={t('Delete')}
			>
				{t('Custom_Mention_Delete_Warning')}
			</GenericModal>,
		);
	}, [setModal, deleteMention, _id, dispatchToastMessage, t, onChange, close]);

	const handleChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
		if (e.currentTarget.value !== '') setErrors((prev) => ({ ...prev, name: false }));
		setName(e.currentTarget.value);
	};

	const handleChangeMembers = (e: ChangeEvent<HTMLInputElement>): void => {
		if (e.currentTarget.value !== '') setErrors((prev) => ({ ...prev, members: false }));
		setMembers(e.currentTarget.value);
	};

	return (
		<>
			<ContextualbarScrollableContent>
				<FieldGroup>
					<Field>
						<FieldLabel>{t('Name')}</FieldLabel>
						<FieldRow>
							<TextInput value={name} onChange={handleChangeName} addon='@' />
						</FieldRow>
						{errors.name && <FieldError>{t('Required_field', { field: t('Name') })}</FieldError>}
					</Field>
					<Field>
						<FieldLabel>{t('Members')}</FieldLabel>
						<FieldRow>
							<TextInput value={members} onChange={handleChangeMembers} placeholder='naetik, john, sarah' />
						</FieldRow>
						{errors.members && <FieldError>{t('Required_field', { field: t('Members') })}</FieldError>}
					</Field>
				</FieldGroup>
			</ContextualbarScrollableContent>
			<ContextualbarFooter>
				<ButtonGroup stretch>
					<Button onClick={close}>{t('Cancel')}</Button>
					<Button primary onClick={handleSave} disabled={!hasUnsavedChanges}>
						{t('Save')}
					</Button>
				</ButtonGroup>
				<Box mbs={8}>
					<ButtonGroup stretch>
						<Button icon='trash' danger onClick={handleDeleteButtonClick}>
							{t('Delete')}
						</Button>
					</ButtonGroup>
				</Box>
			</ContextualbarFooter>
		</>
	);
};

export default EditCustomMention;
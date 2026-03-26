import {
	Button,
	ButtonGroup,
	Field,
	FieldGroup,
	FieldLabel,
	FieldRow,
	FieldError,
	TextInput,
	Box,
	Divider,
	Icon,
	IconButton,
	Margins,
} from '@rocket.chat/fuselage';
import { GenericModal, ContextualbarScrollableContent, ContextualbarFooter } from '@rocket.chat/ui-client';
import { useSetModal, useToastMessageDispatch, useEndpoint } from '@rocket.chat/ui-contexts';
import type { ChangeEvent } from 'react';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { IMentionCustom } from '@rocket.chat/core-typings';

type MemberInfo = {
	_id: string;
	userId: string;
	username: string;
	name: string;
	addedAt: Date;
};

type EditCustomMentionProps = {
	close: () => void;
	onChange: () => void;
	data: IMentionCustom;
};

const EditCustomMention = ({ close, onChange, data }: EditCustomMentionProps) => {
	const { t } = useTranslation();
	const setModal = useSetModal();
	const dispatchToastMessage = useToastMessageDispatch();

	const { _id, name: previousName } = data;

	const [name, setName] = useState(() => data?.name ?? '');
	const [errors, setErrors] = useState({ name: false });

	// Members state
	const [members, setMembers] = useState<MemberInfo[]>([]);
	const [newMemberUsername, setNewMemberUsername] = useState('');
	const [loadingMembers, setLoadingMembers] = useState(true);

	useEffect(() => {
		setName(previousName || '');
	}, [previousName, _id]);

	const hasUnsavedChanges = useMemo(() => previousName !== name, [previousName, name]);

	const updateMention = useEndpoint('POST', '/v1/custom-mentions.update');
	const deleteMention = useEndpoint('POST', '/v1/custom-mentions.delete');
	const getMembers = useEndpoint('GET', '/v1/custom-mentions.members');
	const addMember = useEndpoint('POST', '/v1/custom-mentions.addMember');
	const removeMember = useEndpoint('POST', '/v1/custom-mentions.removeMember');

	// Fetch members on load
	const fetchMembers = useCallback(async () => {
		try {
			setLoadingMembers(true);
			const result = await getMembers({ mentionId: _id });
			setMembers(result.members || []);
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: 'Failed to load members' });
		} finally {
			setLoadingMembers(false);
		}
	}, [_id, getMembers, dispatchToastMessage]);

	useEffect(() => {
		fetchMembers();
	}, [fetchMembers]);

	// Save mention name
	const handleSave = useCallback(async () => {
		if (!name.trim()) {
			setErrors((prev) => ({ ...prev, name: true }));
			return;
		}

		try {
			await updateMention({ mentionId: _id, name: name.trim() });
			dispatchToastMessage({ type: 'success', message: t('Custom_Mention_Updated_Successfully') });
			onChange();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
		}
	}, [name, _id, updateMention, dispatchToastMessage, t, onChange]);

	// Delete mention
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

	// Add member
	const handleAddMember = useCallback(async () => {
		if (!newMemberUsername.trim()) return;

		try {
			await addMember({ mentionId: _id, username: newMemberUsername.trim() });
			dispatchToastMessage({ type: 'success', message: 'Member added' });
			setNewMemberUsername('');
			fetchMembers();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
		}
	}, [newMemberUsername, _id, addMember, dispatchToastMessage, fetchMembers]);

	// Remove member
	const handleRemoveMember = useCallback(
		async (userId: string) => {
			try {
				await removeMember({ mentionId: _id, userId });
				dispatchToastMessage({ type: 'success', message: 'Member removed' });
				fetchMembers();
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
			}
		},
		[_id, removeMember, dispatchToastMessage, fetchMembers],
	);

	const handleChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
		if (e.currentTarget.value !== '') setErrors((prev) => ({ ...prev, name: false }));
		setName(e.currentTarget.value);
	};

	return (
		<>
			<ContextualbarScrollableContent>
				<FieldGroup>
					{/* Mention Name */}
					<Field>
						<FieldLabel>{t('Name')}</FieldLabel>
						<FieldRow>
							<TextInput value={name} onChange={handleChangeName} addon='@' />
						</FieldRow>
						{errors.name && <FieldError>{t('Required_field', { field: t('Name') })}</FieldError>}
					</Field>

					<Divider />

					{/* Members Section */}
					<Field>
						<FieldLabel>Members</FieldLabel>
						<FieldRow>
							<TextInput
								value={newMemberUsername}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setNewMemberUsername(e.currentTarget.value)}
								placeholder='Type username to add...'
							/>
							<Button small primary onClick={handleAddMember} mis={4}>
								<Icon name='plus' size='x16' />
							</Button>
						</FieldRow>
					</Field>

					{/* Members List */}
					{loadingMembers ? (
						<Box fontScale='p2' color='hint'>
							Loading members...
						</Box>
					) : members.length === 0 ? (
						<Box fontScale='p2' color='hint'>
							No members yet. Add members using the field above.
						</Box>
					) : (
						<Margins blockEnd={4}>
							{members.map((member) => (
								<Box key={member.userId} display='flex' alignItems='center' justifyContent='space-between' pb={4}>
									<Box>
										<Box fontScale='p2b'>@{member.username}</Box>
										{member.name && (
											<Box fontScale='c1' color='hint'>
												{member.name}
											</Box>
										)}
									</Box>
									<IconButton icon='trash' small danger onClick={() => handleRemoveMember(member.userId)} />
								</Box>
							))}
						</Margins>
					)}
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
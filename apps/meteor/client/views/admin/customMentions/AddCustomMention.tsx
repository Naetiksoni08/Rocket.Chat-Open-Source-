import { Button, ButtonGroup, Field, FieldLabel, FieldRow, FieldError, TextInput } from '@rocket.chat/fuselage';
import { ContextualbarScrollableContent, ContextualbarFooter } from '@rocket.chat/ui-client';
import { useToastMessageDispatch, useEndpoint } from '@rocket.chat/ui-contexts';
import type { ReactElement, ChangeEvent } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

type AddCustomMentionProps = {
	close: () => void;
	onChange: () => void;
};

const AddCustomMention = ({ close, onChange }: AddCustomMentionProps): ReactElement => {
	const { t } = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const [name, setName] = useState('');
	const [members, setMembers] = useState('');
	const [errors, setErrors] = useState({ name: false, members: false });

	const createMention = useEndpoint('POST', '/v1/custom-mentions.create');

	const handleChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
		if (e.currentTarget.value !== '') {
			setErrors((prev) => ({ ...prev, name: false }));
		}
		setName(e.currentTarget.value);
	};

	const handleChangeMembers = (e: ChangeEvent<HTMLInputElement>): void => {
		if (e.currentTarget.value !== '') {
			setErrors((prev) => ({ ...prev, members: false }));
		}
		setMembers(e.currentTarget.value);
	};

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
			await createMention({ name: name.trim().replace('@', ''), usernames })
			dispatchToastMessage({
				type: 'success',
				message: t('Custom_Mention_Added_Successfully'),
			});
			onChange();
			close();
		} catch (error) {
			dispatchToastMessage({
				type: 'error',
				message: error instanceof Error ? error.message : JSON.stringify(error),
			});
		}
	}, [name, members, createMention, dispatchToastMessage, t, onChange, close]);

	return (
		<>
			<ContextualbarScrollableContent>
				<Field>
					<FieldLabel>{t('Name')}</FieldLabel>
					<FieldRow>
						<TextInput
							value={name}
							onChange={handleChangeName}
							placeholder={t('Custom_Mention_Name_Placeholder')}
							addon='@'
						/>
					</FieldRow>
					{errors.name && (
						<FieldError>{t('Required_field', { field: t('Name') })}</FieldError>
					)}
				</Field>

				<Field>
					<FieldLabel>{t('Members')}</FieldLabel>
					<FieldRow>
						<TextInput
							value={members}
							onChange={handleChangeMembers}
							placeholder={t('Custom_Mention_Members_Placeholder')}
						/>
					</FieldRow>
					{errors.members && (
						<FieldError>{t('Required_field', { field: t('Members') })}</FieldError>
					)}
				</Field>
			</ContextualbarScrollableContent>

			<ContextualbarFooter>
				<ButtonGroup stretch>
					<Button onClick={close}>{t('Cancel')}</Button>
					<Button primary onClick={handleSave}>
						{t('Save')}
					</Button>
				</ButtonGroup>
			</ContextualbarFooter>
		</>
	);
};

export default AddCustomMention;
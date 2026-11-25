import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ApiError, apiClient } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import Button from '../common/Button';
import Icon from '../common/Icon';
import Field from '../common/Field';

export default function CompanyValueForm({ value, onSaved, onCancel }) {
    const [errors, setErrors] = useState({});
    const [isActive, setIsActive] = useState(value?.is_active ?? true);
    const save = useMutation({
        mutationFn: (data) =>
            value
                ? apiClient.patch(apiRoutes.companyValue(value.id), data)
                : apiClient.post(apiRoutes.companyValues, data),
    });
    const submit = async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        const payload = {
            name: data.name,
            color: data.color,
            description: data.description,
            default_points: data.default_points ? Number(data.default_points) : null,
            ...(value ? { is_active: isActive } : {}),
        };
        try {
            await save.mutateAsync(payload);
            setErrors({});
            await onSaved(
                value ? 'Company value updated.' : 'Company value created.',
            );
        } catch (error) {
            setErrors(
                error instanceof ApiError
                    ? error.errors
                    : { request: [error.message] },
            );
        }
    };
    return (
        <form
            className="grid gap-4"
            onSubmit={submit}
        >
            <div className="grid gap-1"><h4 className="font-bold">{value ? 'Edit company value' : 'New company value'}</h4><p className="text-xs text-cod-gray/65">Define the principle employees demonstrate through their work.</p></div>
            <Field label="Value name" error={errors.name?.[0]}><input name="name" required defaultValue={value?.name ?? ''} placeholder="e.g. Customer First" /></Field>
            <Field label="Display color" error={errors.color?.[0]}><div className="grid grid-cols-[3rem_1fr] gap-2"><input className="h-11 p-1" name="color_picker" type="color" defaultValue={value?.color ?? '#F11F18'} aria-label="Choose display color" onChange={(event) => { event.currentTarget.nextElementSibling.value = event.currentTarget.value.toUpperCase(); }} /><input name="color" required defaultValue={value?.color ?? '#F11F18'} placeholder="#F11F18" /></div></Field>
            <Field label="Recommended points" error={errors.default_points?.[0]}><input name="default_points" type="number" min="1" defaultValue={value?.default_points ?? ''} placeholder="e.g. 50" /></Field>
            <Field label="Description" error={errors.description?.[0]}><textarea name="description" defaultValue={value?.description ?? ''} placeholder="Describe how this value appears in everyday work." /></Field>
            {value && (
                <label className="text-cod-gray flex items-center gap-2 text-xs font-semibold">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="size-4 rounded"
                    />
                    Active company value (available for selection)
                </label>
            )}
            {Object.keys(errors).length > 0 && (
                <div className="border-pomegranate grid gap-1 border-l-4 px-3 text-sm font-semibold">
                    {Object.values(errors)
                        .flat()
                        .map((error) => (
                            <span key={error}>{error}</span>
                        ))}
                </div>
            )}
            <div className="flex justify-end gap-2 max-sm:flex-col-reverse">
                <Button
                    type="submit"
                    loading={save.isPending}
                    className="max-sm:w-full"
                >
                    <Icon name="sparkle" />
                    {save.isPending ? 'Saving...' : 'Save value'}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="secondary"
                        className="max-sm:w-full"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}

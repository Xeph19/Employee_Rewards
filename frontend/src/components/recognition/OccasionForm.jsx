import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ApiError, apiClient } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import Button from '../common/Button';
import Icon from '../common/Icon';
import Field from '../common/Field';

export default function OccasionForm({ occasion, values, onSaved, onCancel }) {
    const [errors, setErrors] = useState({});
    const [isActive, setIsActive] = useState(occasion?.is_active ?? true);
    const save = useMutation({
        mutationFn: (data) =>
            occasion
                ? apiClient.patch(apiRoutes.occasion(occasion.id), data)
                : apiClient.post(apiRoutes.occasions, data),
    });
    const selectedIds = new Set(
        occasion?.company_values?.map((value) => value.id) ?? [],
    );
    const submit = async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        const payload = {
            name: data.name,
            description: data.description,
            default_points: data.default_points
                ? Number(data.default_points)
                : null,
            company_value_ids: values
                .filter((value) => data[`value_${value.id}`])
                .map((value) => value.id),
            ...(occasion ? { is_active: isActive } : {}),
        };
        try {
            await save.mutateAsync(payload);
            setErrors({});
            await onSaved(occasion ? 'Occasion updated.' : 'Occasion created.');
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
            <div className="grid gap-1"><h4 className="font-bold">{occasion ? 'Edit occasion' : 'New occasion'}</h4><p className="text-xs text-cod-gray/65">Create a repeatable reason for recognizing employee contributions.</p></div>
            <Field label="Occasion name" error={errors.name?.[0]}><input name="name" required defaultValue={occasion?.name ?? ''} placeholder="e.g. Above & Beyond" /></Field>
            <Field label="Default points" error={errors.default_points?.[0]}><input name="default_points" type="number" min="1" defaultValue={occasion?.default_points ?? ''} placeholder="e.g. 100" /></Field>
            <Field label="Description" error={errors.description?.[0]}><textarea name="description" defaultValue={occasion?.description ?? ''} placeholder="Describe when this occasion should be used." /></Field>
            <fieldset><legend className="text-sm font-semibold text-cod-gray">Linked company values</legend><div className="mt-2 grid grid-cols-2 gap-2 max-sm:grid-cols-1">
                {values.map((value) => (
                    <label
                        className="border-cod-gray/20 flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium"
                        key={value.id}
                    >
                        <input
                            className="w-auto"
                            name={`value_${value.id}`}
                            type="checkbox"
                            defaultChecked={selectedIds.has(value.id)}
                        />
                        {value.name}
                    </label>
                ))}
            </div></fieldset>
            {occasion && (
                <label className="text-cod-gray flex items-center gap-2 text-xs font-semibold">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="size-4 rounded"
                    />
                    Active occasion (available for selection)
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
                    <Icon name="recognition" />
                    {save.isPending ? 'Saving...' : 'Save occasion'}
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

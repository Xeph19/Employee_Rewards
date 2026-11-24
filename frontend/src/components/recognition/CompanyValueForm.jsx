import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ApiError, apiClient } from '../../api/client';
import { apiRoutes } from '../../api/routes';

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
            className="border-cod-gray/20 grid gap-3 rounded-xl border p-4"
            onSubmit={submit}
        >
            <h4 className="font-bold">
                {value ? 'Edit company value' : 'New company value'}
            </h4>
            <input
                name="name"
                required
                defaultValue={value?.name ?? ''}
                placeholder="Company value name"
                aria-label="Company value name"
            />
            <input
                name="color"
                required
                defaultValue={value?.color ?? '#F11F18'}
                aria-label="Company value color"
                placeholder="Hex color e.g. #F11F18"
            />
            <textarea
                name="description"
                defaultValue={value?.description ?? ''}
                placeholder="Description"
                aria-label="Description"
            />
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
            <div className="flex gap-2">
                <button
                    disabled={save.isPending}
                    className="bg-cod-gray text-cararra hover:outline-pomegranate rounded-xl px-4 py-2.5 font-bold hover:outline-2 disabled:opacity-60"
                >
                    {save.isPending ? 'Saving...' : 'Save value'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        className="border-cod-gray rounded-xl border px-4 py-2.5 font-bold"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

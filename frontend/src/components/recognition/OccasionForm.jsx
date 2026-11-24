import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ApiError, apiClient } from '../../api/client';
import { apiRoutes } from '../../api/routes';

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
            className="border-cod-gray/20 grid gap-3 rounded-xl border p-4"
            onSubmit={submit}
        >
            <h4 className="font-bold">
                {occasion ? 'Edit occasion' : 'New occasion'}
            </h4>
            <input
                name="name"
                required
                defaultValue={occasion?.name ?? ''}
                placeholder="Occasion name"
                aria-label="Occasion name"
            />
            <input
                name="default_points"
                type="number"
                min="1"
                defaultValue={occasion?.default_points ?? ''}
                placeholder="Default points"
                aria-label="Default points"
            />
            <textarea
                name="description"
                defaultValue={occasion?.description ?? ''}
                placeholder="Description"
                aria-label="Description"
            />
            <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
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
            </div>
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
            <div className="flex gap-2">
                <button
                    disabled={save.isPending}
                    className="bg-cod-gray text-cararra hover:outline-pomegranate rounded-xl px-4 py-2.5 font-bold hover:outline-2 disabled:opacity-60"
                >
                    {save.isPending ? 'Saving...' : 'Save occasion'}
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

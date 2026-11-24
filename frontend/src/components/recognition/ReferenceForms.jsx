import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ApiError, apiClient } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import CompanyValueForm from './CompanyValueForm';
import OccasionForm from './OccasionForm';

export default function ReferenceForms({ values, occasions, onChanged }) {
    const [editingValue, setEditingValue] = useState(null);
    const [editingOccasion, setEditingOccasion] = useState(null);
    const [errorNotice, setErrorNotice] = useState('');
    const deactivate = useMutation({
        mutationFn: (route) => apiClient.delete(route),
    });
    const reactivate = useMutation({
        mutationFn: (route) => apiClient.patch(route, { is_active: true }),
    });
    const forceDelete = useMutation({
        mutationFn: (route) => apiClient.delete(String(route) + '?force=1'),
    });

    const saved = async (message) => {
        setEditingValue(null);
        setEditingOccasion(null);
        setErrorNotice('');
        await onChanged(message);
    };

    const handleDeactivate = async (label, route) => {
        if (
            !window.confirm(
                `Deactivate ${label}? Historical recognitions will be preserved.`,
            )
        )
            return;
        try {
            await deactivate.mutateAsync(route);
            await saved(`${label} deactivated.`);
        } catch (err) {
            setErrorNotice(
                err instanceof ApiError ? err.message : 'Failed to deactivate.',
            );
        }
    };

    const handleReactivate = async (label, route) => {
        try {
            await reactivate.mutateAsync(route);
            await saved(`${label} reactivated.`);
        } catch (err) {
            setErrorNotice(
                err instanceof ApiError ? err.message : 'Failed to reactivate.',
            );
        }
    };

    const handleDelete = async (label, route) => {
        if (
            !window.confirm(
                `Permanently delete ${label}? This cannot be undone.`,
            )
        )
            return;
        try {
            await forceDelete.mutateAsync(route);
            await saved(`${label} permanently deleted.`);
        } catch (err) {
            setErrorNotice(
                err instanceof ApiError ? err.message : 'Cannot delete item.',
            );
        }
    };

    return (
        <section className="grid gap-6">
            <div>
                <h3 className="text-lg font-semibold">Reference data</h3>
                <p className="text-cod-gray/75 text-sm">
                    Create, update, deactivate, reactivate, or delete
                    recognition options.
                </p>
                {errorNotice && (
                    <div className="border-pomegranate bg-pomegranate/10 text-cod-gray mt-2 rounded-lg border-l-4 p-2.5 text-xs font-semibold">
                        {errorNotice}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <CompanyValueForm
                    value={editingValue}
                    onSaved={saved}
                    onCancel={editingValue ? () => setEditingValue(null) : null}
                />
                <OccasionForm
                    occasion={editingOccasion}
                    values={values}
                    onSaved={saved}
                    onCancel={
                        editingOccasion ? () => setEditingOccasion(null) : null
                    }
                />
            </div>

            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div className="grid content-start gap-2">
                    <h4 className="font-bold">Company values</h4>
                    {values.map((value) => (
                        <div
                            className="border-cod-gray/20 flex items-center justify-between gap-3 rounded-xl border p-3"
                            key={value.id}
                        >
                            <div>
                                <span className="font-semibold">
                                    {value.name}
                                </span>
                                <span
                                    className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${value.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'}`}
                                >
                                    {value.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <span className="flex flex-wrap gap-1.5">
                                <button
                                    className="border-cod-gray hover:border-pomegranate rounded-lg border px-2.5 py-1 text-xs font-bold"
                                    onClick={() => setEditingValue(value)}
                                >
                                    Edit
                                </button>
                                {value.is_active ? (
                                    <button
                                        className="bg-cod-gray text-cararra hover:outline-pomegranate rounded-lg px-2.5 py-1 text-xs font-bold hover:outline-2"
                                        onClick={() =>
                                            handleDeactivate(
                                                value.name,
                                                apiRoutes.companyValue(
                                                    value.id,
                                                ),
                                            )
                                        }
                                    >
                                        Deactivate
                                    </button>
                                ) : (
                                    <button
                                        className="rounded-lg border border-emerald-600 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                                        onClick={() =>
                                            handleReactivate(
                                                value.name,
                                                apiRoutes.companyValue(
                                                    value.id,
                                                ),
                                            )
                                        }
                                    >
                                        Reactivate
                                    </button>
                                )}
                                <button
                                    className="rounded-lg border border-red-500/40 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                        handleDelete(
                                            value.name,
                                            apiRoutes.companyValue(value.id),
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            </span>
                        </div>
                    ))}
                </div>

                <div className="grid content-start gap-2">
                    <h4 className="font-bold">Occasions</h4>
                    {occasions.map((occasion) => (
                        <div
                            className="border-cod-gray/20 flex items-center justify-between gap-3 rounded-xl border p-3"
                            key={occasion.id}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <strong className="block">
                                        {occasion.name}
                                    </strong>
                                    <span
                                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${occasion.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'}`}
                                    >
                                        {occasion.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>
                                </div>
                                <small className="text-cod-gray/70">
                                    {occasion.default_points
                                        ? `${occasion.default_points} points`
                                        : 'Flexible points'}
                                </small>
                            </div>
                            <span className="flex flex-wrap gap-1.5">
                                <button
                                    className="border-cod-gray hover:border-pomegranate rounded-lg border px-2.5 py-1 text-xs font-bold"
                                    onClick={() => setEditingOccasion(occasion)}
                                >
                                    Edit
                                </button>
                                {occasion.is_active ? (
                                    <button
                                        className="bg-cod-gray text-cararra hover:outline-pomegranate rounded-lg px-2.5 py-1 text-xs font-bold hover:outline-2"
                                        onClick={() =>
                                            handleDeactivate(
                                                occasion.name,
                                                apiRoutes.occasion(occasion.id),
                                            )
                                        }
                                    >
                                        Deactivate
                                    </button>
                                ) : (
                                    <button
                                        className="rounded-lg border border-emerald-600 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                                        onClick={() =>
                                            handleReactivate(
                                                occasion.name,
                                                apiRoutes.occasion(occasion.id),
                                            )
                                        }
                                    >
                                        Reactivate
                                    </button>
                                )}
                                <button
                                    className="rounded-lg border border-red-500/40 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                        handleDelete(
                                            occasion.name,
                                            apiRoutes.occasion(occasion.id),
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

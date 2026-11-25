import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ApiError, apiClient } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import Icon from '../common/Icon';
import CompanyValueForm from './CompanyValueForm';
import OccasionForm from './OccasionForm';

export default function ReferenceForms({ values, occasions, onChanged }) {
    const [activeTab, setActiveTab] = useState('values');
    const [editingValue, setEditingValue] = useState(null);
    const [editingOccasion, setEditingOccasion] = useState(null);
    const [errorNotice, setErrorNotice] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const deactivate = useMutation({ mutationFn: (route) => apiClient.delete(route) });
    const reactivate = useMutation({ mutationFn: (route) => apiClient.patch(route, { is_active: true }) });
    const forceDelete = useMutation({ mutationFn: (route) => apiClient.delete(`${route}?force=1`) });

    const saved = async (message) => {
        setEditingValue(null);
        setEditingOccasion(null);
        setErrorNotice('');
        await onChanged(message);
    };

    const updateStatus = async (label, route, active) => {
        try {
            if (active) await reactivate.mutateAsync(route);
            else await deactivate.mutateAsync(route);
            await saved(`${label} ${active ? 'reactivated' : 'deactivated'}.`);
        } catch (error) {
            setErrorNotice(error instanceof ApiError ? error.message : 'The item could not be updated.');
        }
    };

    const confirmPendingAction = async () => {
        if (!pendingAction) return;
        try {
            if (pendingAction.type === 'delete') {
                await forceDelete.mutateAsync(pendingAction.route);
                await saved(`${pendingAction.label} permanently deleted.`);
            } else {
                await updateStatus(pendingAction.label, pendingAction.route, false);
            }
            setPendingAction(null);
        } catch (error) {
            setErrorNotice(error instanceof ApiError ? error.message : 'The action could not be completed.');
        }
    };

    const items = activeTab === 'values' ? values : occasions;
    const routeFor = (item) => activeTab === 'values' ? apiRoutes.companyValue(item.id) : apiRoutes.occasion(item.id);
    const beginEdit = (item) => activeTab === 'values' ? setEditingValue(item) : setEditingOccasion(item);

    return (
        <section className="grid gap-5">
            <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-pomegranate bg-cod-gray text-cararra">
                    <Icon name="settings" />
                </span>
                <div>
                    <h3 className="text-lg font-semibold text-cod-gray">Reference details</h3>
                    <p className="text-sm text-cod-gray/75">Manage the occasions and values used throughout recognition.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-xl border border-cod-gray/20 bg-cararra p-1" role="tablist" aria-label="Reference data categories">
                <Button variant={activeTab === 'values' ? 'accent' : 'quiet'} role="tab" aria-selected={activeTab === 'values'} onClick={() => setActiveTab('values')}>
                    <Icon name="sparkle" /> Company values
                </Button>
                <Button variant={activeTab === 'occasions' ? 'accent' : 'quiet'} role="tab" aria-selected={activeTab === 'occasions'} onClick={() => setActiveTab('occasions')}>
                    <Icon name="recognition" /> Occasions
                </Button>
            </div>

            {errorNotice && <div role="alert" className="rounded-xl border-l-4 border-pomegranate bg-pomegranate/10 p-3 text-sm font-semibold">{errorNotice}</div>}

            <div className="rounded-2xl border border-cod-gray/20 bg-cararra p-5" role="tabpanel">
                {activeTab === 'values' ? (
                    <CompanyValueForm value={editingValue} onSaved={saved} onCancel={editingValue ? () => setEditingValue(null) : null} />
                ) : (
                    <OccasionForm occasion={editingOccasion} values={values} onSaved={saved} onCancel={editingOccasion ? () => setEditingOccasion(null) : null} />
                )}
            </div>

            <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                    <h4 className="font-bold">{activeTab === 'values' ? 'Company values' : 'Occasions'}</h4>
                    <span className="rounded-full border border-cod-gray/20 px-3 py-1 text-xs font-semibold">{items.length} items</span>
                </div>
                {items.map((item) => (
                    <article className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-cod-gray/20 border-l-4 border-l-pomegranate bg-cararra p-4 max-sm:grid-cols-1" key={item.id}>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <strong className="min-w-0 flex-1 truncate font-semibold" title={item.name}>{item.name}</strong>
                                <span className={`inline-flex h-5 w-20 shrink-0 items-center justify-center rounded-full border px-2 text-[10px] font-bold tracking-wider uppercase ${item.is_active ? 'border-cod-gray bg-cod-gray text-cararra' : 'border-cod-gray/20 bg-cod-gray/5 text-cod-gray/65'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                            <small className="block truncate text-cod-gray/70">{item.default_points ? `${item.default_points} recommended points` : 'Custom points'}</small>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 max-sm:justify-start">
                            <Button variant="secondary" size="sm" onClick={() => beginEdit(item)}><Icon name="edit" /> Edit</Button>
                            {item.is_active ? (
                                <Button variant="secondary" size="sm" onClick={() => setPendingAction({ type: 'deactivate', label: item.name, route: routeFor(item) })}><Icon name="pause" /> Deactivate</Button>
                            ) : (
                                <Button variant="secondary" size="sm" onClick={() => updateStatus(item.name, routeFor(item), true)}><Icon name="play" /> Reactivate</Button>
                            )}
                            <Button variant="danger" size="sm" onClick={() => setPendingAction({ type: 'delete', label: item.name, route: routeFor(item) })}><Icon name="trash" /> Delete</Button>
                        </div>
                    </article>
                ))}
            </div>

            <ConfirmDialog
                open={Boolean(pendingAction)}
                title={`Employee Administration: ${pendingAction?.type === 'delete' ? 'Permanently Delete Item' : 'Deactivate Item'}`}
                description={pendingAction?.type === 'delete' ? `${pendingAction?.label ?? 'This item'} will be permanently removed. This cannot be undone.` : `${pendingAction?.label ?? 'This item'} will no longer appear as an option. Historical recognitions will be preserved.`}
                confirmLabel={pendingAction?.type === 'delete' ? 'Delete permanently' : 'Deactivate'}
                destructive
                loading={deactivate.isPending || forceDelete.isPending}
                onCancel={() => setPendingAction(null)}
                onConfirm={confirmPendingAction}
            />
        </section>
    );
}

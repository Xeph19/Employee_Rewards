import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import Button from '../common/Button';
import Field from '../common/Field';
import Icon from '../common/Icon';

export default function AddRewardForm({ onCreated, onCancel }) {
    const [name, setName] = useState('');
    const [merchantId, setMerchantId] = useState('');
    const [description, setDescription] = useState('');
    const [pointsCost, setPointsCost] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [errors, setErrors] = useState({});

    const merchantsQuery = useQuery({
        queryKey: ['admin', 'merchants'],
        queryFn: async () => (await apiClient.get(apiRoutes.adminMerchants)).data,
    });

    const createReward = useMutation({
        mutationFn: (data) => apiClient.post(apiRoutes.adminRewards, data),
    });

    const submit = async (event) => {
        event.preventDefault();
        setErrors({});

        try {
            await createReward.mutateAsync({
                name,
                merchant_id: Number(merchantId),
                description: description || null,
                points_cost: Number(pointsCost),
                stock_quantity: stockQuantity ? Number(stockQuantity) : null,
            });
            onCreated();
        } catch (error) {
            setErrors(error instanceof ApiError ? error.errors : { form: ['Unable to create reward.'] });
        }
    };

    return (
        <form className="grid gap-4" onSubmit={submit}>
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-pomegranate bg-cod-gray text-cararra">
                    <Icon name="gift" className="size-5 text-pomegranate" />
                </span>
                <div>
                    <h3 className="text-lg font-bold text-cod-gray">New Merchant Reward</h3>
                    <p className="text-xs text-cod-gray/70">Add a voucher or prize to the company catalogue.</p>
                </div>
            </div>

            <Field label="Reward Name" error={errors.name?.[0]}>
                <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. $25 Gourmet Dining Voucher"
                />
            </Field>

            <Field label="Merchant Partner" error={errors.merchant_id?.[0]}>
                <select
                    required
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                >
                    <option value="">Select a merchant partner</option>
                    {merchantsQuery.data?.map((merchant) => (
                        <option key={merchant.id} value={merchant.id}>
                            {merchant.name} ({merchant.category})
                        </option>
                    ))}
                </select>
            </Field>

            <Field label="Description" error={errors.description?.[0]}>
                <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe how the employee can redeem and enjoy this reward."
                />
            </Field>

            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <Field label="Prize Cost (Points)" error={errors.points_cost?.[0]}>
                    <input
                        type="number"
                        min="1"
                        required
                        value={pointsCost}
                        onChange={(e) => setPointsCost(e.target.value)}
                        placeholder="e.g. 250"
                    />
                </Field>

                <Field label="Stock Quantity (Optional)" error={errors.stock_quantity?.[0]}>
                    <input
                        type="number"
                        min="1"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        placeholder="Leave blank for unlimited"
                    />
                </Field>
            </div>

            <div className="mt-2 flex justify-end gap-3 max-sm:flex-col-reverse">
                {onCancel && (
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" loading={createReward.isPending}>
                    <Icon name="plus" /> Create Reward
                </Button>
            </div>
        </form>
    );
}

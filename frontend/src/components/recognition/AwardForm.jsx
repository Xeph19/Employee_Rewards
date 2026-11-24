import { useState } from 'react';
import { apiClient, ApiError } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import ErrorText from '../common/ErrorText';
import Field from '../common/Field';

const emptyAward = () => ({
    recipient_id: '',
    type: 'occasion',
    occasion_id: '',
    message: '',
    points: '100',
    sgd_amount: '',
    company_value_ids: [],
    request_key: crypto.randomUUID(),
});

export default function AwardForm({ data, onAwarded }) {
    const [form, setForm] = useState(emptyAward);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const activeOccasions = (data.occasions ?? []).filter(
        (o) => o.is_active !== false,
    );
    const activeValues = (data.company_values ?? []).filter(
        (v) => v.is_active !== false,
    );

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});
        const payload = {
            ...form,
            recipient_id: Number(form.recipient_id),
            occasion_id:
                form.type === 'occasion' ? Number(form.occasion_id) : null,
            points: form.points ? Number(form.points) : null,
            sgd_amount: form.sgd_amount || null,
            company_value_ids: form.company_value_ids.map(Number),
        };
        try {
            await apiClient.post(apiRoutes.recognitions, payload);
            setForm(emptyAward());
            await onAwarded();
        } catch (error) {
            setErrors(error instanceof ApiError ? error.errors : {});
        } finally {
            setSubmitting(false);
        }
    };

    const toggleValue = (id) =>
        setForm((current) => ({
            ...current,
            company_value_ids: current.company_value_ids.includes(id)
                ? current.company_value_ids.filter((value) => value !== id)
                : [...current.company_value_ids, id],
        }));

    return (
        <form className="grid gap-4" onSubmit={submit}>
            <div className="flex items-start gap-3">
                <span className="border-pomegranate bg-cod-gray text-cararra grid size-9 shrink-0 place-items-center rounded-xl border-2 font-black">
                    +
                </span>
                <div>
                    <h3 className="text-cod-gray text-lg font-semibold">
                        Recognition details
                    </h3>
                    <p className="text-cod-gray/75 text-sm">
                        Celebrate impact with a secure, one-time award.
                    </p>
                </div>
            </div>
            <Field label="Recipient" error={errors.recipient_id?.[0]}>
                <select
                    required
                    value={form.recipient_id}
                    onChange={(event) =>
                        setForm({ ...form, recipient_id: event.target.value })
                    }
                >
                    <option value="">Select an employee</option>
                    {data.recipients.map((person) => (
                        <option key={person.id} value={person.id}>
                            {person.name}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Award type">
                <select
                    value={form.type}
                    onChange={(event) =>
                        setForm({ ...form, type: event.target.value })
                    }
                >
                    <option value="occasion">Occasion</option>
                    <option value="ad_hoc">Ad hoc</option>
                </select>
            </Field>
            {form.type === 'occasion' && (
                <Field label="Occasion" error={errors.occasion_id?.[0]}>
                    <select
                        required
                        value={form.occasion_id}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                occasion_id: event.target.value,
                            })
                        }
                    >
                        <option value="">Select an occasion</option>
                        {activeOccasions.map((occasion) => (
                            <option key={occasion.id} value={occasion.id}>
                                {occasion.name}
                            </option>
                        ))}
                    </select>
                </Field>
            )}
            <fieldset>
                <legend className="text-cod-gray text-sm font-semibold">
                    Company values
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2 max-sm:grid-cols-1">
                    {activeValues.map((value) => (
                        <label
                            className="border-cod-gray/20 bg-cararra text-cod-gray flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium"
                            key={value.id}
                        >
                            <input
                                className="w-auto"
                                type="checkbox"
                                checked={form.company_value_ids.includes(
                                    value.id,
                                )}
                                onChange={() => toggleValue(value.id)}
                            />
                            {value.name}
                        </label>
                    ))}
                </div>
                <ErrorText error={errors.company_value_ids?.[0]} />
            </fieldset>
            <Field label="Appreciation message" error={errors.message?.[0]}>
                <textarea
                    required
                    rows="4"
                    value={form.message}
                    onChange={(event) =>
                        setForm({ ...form, message: event.target.value })
                    }
                />
            </Field>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <Field label="Points" error={errors.points?.[0]}>
                    <input
                        type="number"
                        min="1"
                        value={form.points}
                        onChange={(event) =>
                            setForm({ ...form, points: event.target.value })
                        }
                    />
                </Field>
                <Field label="Or SGD amount" error={errors.sgd_amount?.[0]}>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.sgd_amount}
                        onChange={(event) =>
                            setForm({ ...form, sgd_amount: event.target.value })
                        }
                    />
                </Field>
            </div>
            <button
                className="bg-cod-gray text-cararra hover:outline-pomegranate rounded-xl px-4 py-3 font-bold transition hover:-translate-y-px hover:outline-2 disabled:cursor-wait disabled:opacity-50"
                disabled={submitting}
            >
                {submitting ? 'Awarding...' : 'Award recognition'}
            </button>
        </form>
    );
}

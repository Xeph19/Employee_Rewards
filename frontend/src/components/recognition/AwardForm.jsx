import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import ErrorText from '../common/ErrorText';
import Field from '../common/Field';
import Button from '../common/Button';
import Icon from '../common/Icon';
import Tooltip from '../common/Tooltip';

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
    const [suggestionSource, setSuggestionSource] = useState('');
    const suggestion = useMutation({
        mutationFn: (payload) => apiClient.post(apiRoutes.messageSuggestions, payload),
        onSuccess: (response) => {
            setForm((current) => ({ ...current, message: response.data.message }));
            setSuggestionSource(response.data.source);
        },
    });
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
            const response = await apiClient.post(apiRoutes.recognitions, payload);
            setForm(emptyAward());
            onAwarded(response.data);
        } catch (error) {
            setErrors(error instanceof ApiError ? error.errors : {});
        } finally {
            setSubmitting(false);
        }
    };

    const toggleValue = (id) =>
        setForm((current) => {
            const companyValueIds = current.company_value_ids.includes(id)
                ? current.company_value_ids.filter((value) => value !== id)
                : [...current.company_value_ids, id];
            const recommendedPoints = activeValues
                .filter((value) => companyValueIds.includes(value.id))
                .reduce((total, value) => total + Number(value.default_points ?? 0), 0);

            return {
                ...current,
                company_value_ids: companyValueIds,
                points:
                    current.type === 'occasion'
                        ? current.points
                        : recommendedPoints > 0
                          ? String(recommendedPoints)
                          : current.points,
            };
        });

    const suggestMessage = () => {
        const recipient = data.recipients.find((person) => person.id === Number(form.recipient_id));
        suggestion.mutate({
            occasion_id: form.type === 'occasion' && form.occasion_id ? Number(form.occasion_id) : null,
            company_value_ids: form.company_value_ids.length > 0 ? form.company_value_ids : null,
            recipient_name: recipient?.name ?? null,
        });
    };

    return (
        <form className="grid gap-4" onSubmit={submit}>
            <div className="flex items-center gap-3">
                <span className="border-pomegranate bg-cod-gray text-cararra flex size-10 shrink-0 items-center justify-center rounded-xl border-2 text-lg font-black leading-none">
                    <Icon name="plus" className="size-5 text-pomegranate" />
                </span>
                <div>
                    <h3 className="text-cod-gray text-lg font-semibold leading-tight">
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
                    onChange={(event) => {
                        const type = event.target.value;
                        const occasion = activeOccasions.find((item) => item.id === Number(form.occasion_id));
                        const valuePoints = activeValues.filter((item) => form.company_value_ids.includes(item.id)).reduce((total, item) => total + Number(item.default_points ?? 0), 0);
                        setForm({ ...form, type, points: String(type === 'occasion' ? occasion?.default_points ?? form.points : valuePoints || form.points) });
                    }}
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
                        onChange={(event) => {
                            const occasion = activeOccasions.find((item) => item.id === Number(event.target.value));
                            setForm({ ...form, occasion_id: event.target.value, points: String(occasion?.default_points ?? form.points) });
                        }}
                    >
                        <option value="">Select an occasion</option>
                        {activeOccasions.map((occasion) => (
                            <option key={occasion.id} value={occasion.id}>
                                {occasion.name}{occasion.default_points ? ` (${occasion.default_points} pts)` : ''}
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
                            <span className="min-w-0 flex-1 truncate">
                                {value.name}
                                {value.default_points ? (
                                    <span className="text-cod-gray/65 ml-1 font-normal">
                                        ({value.default_points} pts)
                                    </span>
                                ) : ''}
                            </span>
                            {value.description && (
                                <Tooltip text={value.description}>
                                    <span tabIndex="0" className="grid size-6 place-items-center rounded-full border border-cod-gray/25" onClick={(event) => event.preventDefault()}>
                                        <Icon name="info" className="size-3.5" />
                                    </span>
                                </Tooltip>
                            )}
                        </label>
                    ))}
                </div>
                <ErrorText error={errors.company_value_ids?.[0]} />
            </fieldset>
            <Field label="Appreciation message" error={errors.message?.[0]}>
                <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-cod-gray/65">AI suggestions remain fully editable.</span>
                    <Button type="button" variant="secondary" size="sm" loading={suggestion.isPending} onClick={suggestMessage}><Icon name="sparkle" />{suggestion.isPending ? 'Writing...' : 'Suggest message'}</Button>
                </div>
                <textarea
                    required
                    rows="4"
                    value={form.message}
                    onChange={(event) =>
                        setForm({ ...form, message: event.target.value })
                    }
                />
                {suggestionSource && <p className="mt-1 text-xs text-cod-gray/65">{suggestionSource === 'gemini' ? 'Suggested by Gemini' : 'Manual fallback suggestion used'} — edit anything before sending.</p>}
                {suggestion.isError && <p className="mt-1 border-l-4 border-pomegranate px-2 text-xs font-semibold">Suggestion unavailable. You can continue typing your own message.</p>}
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
                <Field label={<span className="inline-flex items-center gap-1.5">Or SGD amount<Tooltip text="Enter a Singapore Dollar amount to convert it into points using the company rate."><span tabIndex="0" className="inline-grid size-5 place-items-center rounded-full border border-cod-gray/30"><Icon name="info" className="size-3" /></span></Tooltip></span>} error={errors.sgd_amount?.[0]}>
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
            <Button
                type="submit"
                size="lg"
                loading={submitting}
                className="w-full"
            >
                <Icon name="recognition" />
                {submitting ? 'Awarding...' : 'Award recognition'}
            </Button>
        </form>
    );
}

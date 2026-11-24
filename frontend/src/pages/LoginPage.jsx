import { useEffect, useState } from 'react';
import { apiClient, ApiError } from '../api/client';
import { apiRoutes } from '../api/routes';
import Field from '../components/common/Field';

export default function LoginPage({ onAuthenticated }) {
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Eagerly ensure CSRF token is available in cookie while user fills credentials
        apiClient.csrf().catch(() => {});
    }, []);

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});
        try {
            await apiClient.csrf();
            const response = await apiClient.post(
                apiRoutes.session,
                credentials,
            );
            await onAuthenticated(response?.dashboard);
        } catch (error) {
            setErrors(
                error instanceof ApiError
                    ? error.errors
                    : { email: ['Unable to reach the API.'] },
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="bg-cararra grid min-h-screen place-items-center p-4">
            <form
                className="border-cod-gray bg-cod-gray shadow-cod-gray/20 [&_label>span]:text-cararra grid w-full max-w-md gap-4 rounded-3xl border p-8 shadow-2xl"
                onSubmit={submit}
            >
                <span className="border-pomegranate text-cararra w-fit rounded-full border-2 px-3 py-1 text-xs font-extrabold tracking-[.14em] uppercase">
                    BrightThanks
                </span>
                <h1 className="text-cararra mt-1 text-3xl font-semibold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-cararra/75">
                    Sign in to recognize great work and view your rewards.
                </p>
                <Field label="Email" error={errors.email?.[0]}>
                    <input
                        type="email"
                        required
                        value={credentials.email}
                        onChange={(event) =>
                            setCredentials({
                                ...credentials,
                                email: event.target.value,
                            })
                        }
                    />
                </Field>
                <Field label="Password" error={errors.password?.[0]}>
                    <input
                        type="password"
                        required
                        value={credentials.password}
                        onChange={(event) =>
                            setCredentials({
                                ...credentials,
                                password: event.target.value,
                            })
                        }
                    />
                </Field>
                <label className="text-cararra flex items-center gap-2 text-sm">
                    <input
                        className="w-auto"
                        type="checkbox"
                        checked={credentials.remember}
                        onChange={(event) =>
                            setCredentials({
                                ...credentials,
                                remember: event.target.checked,
                            })
                        }
                    />{' '}
                    Remember me
                </label>
                <button
                    className="bg-cararra text-cod-gray hover:outline-pomegranate rounded-xl px-4 py-3 font-bold transition hover:-translate-y-px hover:outline-2 disabled:cursor-wait disabled:opacity-50"
                    disabled={submitting}
                >
                    {submitting ? 'Signing in...' : 'Sign in'}
                </button>
                <small className="text-cararra/75">
                    Demo accounts use the password: password
                </small>
            </form>
        </main>
    );
}

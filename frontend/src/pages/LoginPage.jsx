import { useEffect, useState } from 'react';
import { apiClient, ApiError } from '../api/client';
import { apiRoutes } from '../api/routes';
import Field from '../components/common/Field';
import Button from '../components/common/Button';
import BrandMark from '../components/common/BrandMark';
import Icon from '../components/common/Icon';

export default function LoginPage({ onAuthenticated }) {
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
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
                className="grid w-full max-w-md gap-4 rounded-3xl border border-cod-gray bg-cod-gray p-8 shadow-2xl shadow-cod-gray/20 [&_[role=alert]]:text-cararra [&_label>span]:text-cararra max-sm:p-6"
                onSubmit={submit}
            >
                <div className="flex items-center gap-3">
                    <BrandMark className="size-12" />
                    <span className="w-fit rounded-full border-2 border-pomegranate px-3 py-1 text-xs font-extrabold tracking-[.14em] text-cararra uppercase">BrightThanks</span>
                </div>
                <h1 className="text-cararra mt-1 text-3xl font-semibold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-cararra/75">
                    Sign in to recognize great work and view your rewards.
                </p>
                <Field label="Email" error={errors.email?.[0]}>
                    <input
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
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
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            className="pr-11"
                            value={credentials.password}
                            onChange={(event) =>
                                setCredentials({
                                    ...credentials,
                                    password: event.target.value,
                                })
                            }
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="text-cararra/70 hover:text-cararra focus-visible:outline-pomegranate absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 transition"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            <Icon name={showPassword ? 'eyeOff' : 'eye'} className="size-5" />
                        </button>
                    </div>
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
                <Button
                    type="submit"
                    variant="light"
                    size="lg"
                    loading={submitting}
                    className="w-full"
                >
                    <Icon name="recognition" />
                    {submitting ? 'Signing in...' : 'Sign in'}
                </Button>
                <small className="text-cararra/75">
                    Demo accounts use the password: password
                </small>
            </form>
        </main>
    );
}

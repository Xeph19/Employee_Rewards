import ErrorText from './ErrorText';

export default function Field({ label, error, children }) {
    return (
        <label className="grid gap-2 text-sm">
            <span className="text-cod-gray font-semibold">{label}</span>
            {children}
            <ErrorText error={error} />
        </label>
    );
}

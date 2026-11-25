export default function ErrorText({ error }) {
    return error ? (
        <small role="alert" className="border-pomegranate text-cod-gray border-l-4 px-2 py-1 text-sm font-semibold">
            {error}
        </small>
    ) : null;
}

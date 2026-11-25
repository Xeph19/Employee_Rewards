export default function Tooltip({ text, children, className = '' }) {
    if (!text) return children;

    return (
        <span className={`group relative inline-flex ${className}`}>
            {children}
            <span
                role="tooltip"
                className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 w-max max-w-56 -translate-x-1/2 rounded-lg bg-cod-gray px-3 py-2 text-center text-xs font-medium text-cararra opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
            >
                {text}
            </span>
        </span>
    );
}

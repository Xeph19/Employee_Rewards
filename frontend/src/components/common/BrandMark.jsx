export default function BrandMark({ className = 'size-10' }) {
    return (
        <span className={`grid place-items-center rounded-xl border-2 border-pomegranate bg-cararra text-cod-gray ${className}`} aria-hidden="true">
            <svg viewBox="0 0 32 32" className="size-3/4" fill="none">
                <path d="M16 26s-9-5.4-9-12.2A5.2 5.2 0 0 1 16 10a5.2 5.2 0 0 1 9 3.8C25 20.6 16 26 16 26Z" fill="#F11F18" />
                <path d="M16 8v10m-5-5h10" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        </span>
    );
}

const variants = {
    primary:
        'border-cod-gray bg-cod-gray text-cararra hover:border-pomegranate hover:bg-cod-gray/92',
    secondary:
        'border-cod-gray/35 bg-cararra text-cod-gray hover:border-pomegranate hover:bg-cod-gray/5',
    quiet:
        'border-transparent bg-transparent text-cod-gray hover:border-cod-gray/15 hover:bg-cod-gray/5',
    danger:
        'border-pomegranate bg-pomegranate/10 text-cod-gray hover:bg-pomegranate/15',
    inverse:
        'border-cararra/40 bg-transparent text-cararra hover:border-pomegranate hover:bg-cararra/10',
    light: 'border-cararra bg-cararra text-cod-gray hover:border-pomegranate hover:bg-cararra/90',
    nav: 'border-transparent bg-transparent text-cararra/70 hover:bg-cararra/10 hover:text-cararra',
    navActive:
        'border-cararra/15 bg-cararra/10 text-cararra shadow-sm',
    accent:
        'border-pomegranate bg-cod-gray text-cararra shadow-sm hover:bg-cod-gray/92',
};

const sizes = {
    sm: 'min-h-9 rounded-lg px-3 py-1.5 text-xs',
    md: 'min-h-11 rounded-xl px-4 py-2.5 text-sm',
    lg: 'min-h-12 rounded-xl px-5 py-3 text-base',
    icon: 'size-11 rounded-full p-0',
};

export default function Button({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={`inline-flex shrink-0 items-center justify-center gap-2 border font-bold leading-none transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pomegranate disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0 ${loading ? '[&_svg]:hidden!' : ''} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading && (
                <span
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                />
            )}
            {children}
        </button>
    );
}

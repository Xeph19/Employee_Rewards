import { useEffect, useId } from 'react';

export default function Modal({ open, title, children, onClose }) {
    const titleId = useId();

    useEffect(() => {
        if (!open) return undefined;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', closeOnEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', closeOnEscape);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="bg-cod-gray/80 fixed inset-0 z-50 grid place-items-center p-4"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                className="border-cod-gray/20 bg-cararra max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <header className="border-cod-gray/15 bg-cararra sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-6 py-4">
                    <h2
                        id={titleId}
                        className="text-cod-gray text-xl font-bold"
                    >
                        {title}
                    </h2>
                    <button
                        className="border-cod-gray/20 bg-cararra text-cod-gray hover:border-pomegranate grid size-10 place-items-center rounded-full border font-bold"
                        onClick={onClose}
                        aria-label={`Close ${title}`}
                    >
                        X
                    </button>
                </header>
                <div className="p-6">{children}</div>
            </section>
        </div>
    );
}

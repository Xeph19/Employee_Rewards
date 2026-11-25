import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Button from './Button';

export default function Modal({ open, title, children, onClose }) {
    const titleId = useId();
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const previousFocus = document.activeElement;
        const closeOnEscape = (event) => {
            const dialogs = document.querySelectorAll('[role="dialog"]');
            const isTopDialog = dialogs[dialogs.length - 1] === dialogRef.current;
            if (!isTopDialog) return;
            if (event.key === 'Escape') onClose();
            if (event.key === 'Tab') {
                const focusable = dialogRef.current?.querySelectorAll(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
                );
                if (!focusable?.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', closeOnEscape);
        document.body.style.overflow = 'hidden';
        window.requestAnimationFrame(() =>
            dialogRef.current?.querySelector('button')?.focus(),
        );
        return () => {
            document.removeEventListener('keydown', closeOnEscape);
            document.body.style.overflow = '';
            previousFocus?.focus?.();
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 grid place-items-center bg-cod-gray/80 p-4 backdrop-blur-[2px]"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) onClose();
                    }}
                >
                    <motion.section
                        ref={dialogRef}
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cod-gray/20 bg-cararra shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                    >
                        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-cod-gray/15 bg-cararra px-6 py-5 max-sm:px-4">
                            <h2
                                id={titleId}
                                className="text-cod-gray text-xl font-bold"
                            >
                                {title}
                            </h2>
                            <Button
                                variant="quiet"
                                size="icon"
                                onClick={onClose}
                                aria-label={`Close ${title}`}
                            >
                                <span className="text-xl leading-none" aria-hidden="true">×</span>
                            </Button>
                        </header>
                        <div className="p-6 max-sm:p-4">{children}</div>
                    </motion.section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

import { useState, useRef, useEffect } from 'react';
import Icon from '../common/Icon';

export default function NotificationBell({ notifications = [], onClear }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const count = notifications.length;

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative grid size-9 shrink-0 place-items-center rounded-full border border-cararra/30 bg-cararra/10 text-cararra transition hover:bg-cararra/20"
                aria-label={`Notifications (${count} items)`}
                aria-expanded={open}
            >
                <Icon name="bell" className="size-4" />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-pomegranate text-[9px] font-extrabold text-white animate-pulse">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-cod-gray/20 bg-white p-4 shadow-xl z-50 text-cod-gray">
                    <div className="flex items-center justify-between border-b border-cod-gray/10 pb-2.5">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-cod-gray">
                                Activity Alerts
                            </span>
                            <span className="rounded-full bg-cod-gray/10 px-2 py-0.5 text-[10px] font-bold">
                                {count}
                            </span>
                        </div>
                        {count > 0 && (
                            <button
                                type="button"
                                onClick={onClear}
                                className="text-[11px] font-semibold text-pomegranate hover:underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                        {count === 0 ? (
                            <div className="p-4 text-center text-xs text-cod-gray/60">
                                No new notifications. Redemptions, recognitions, birthdays, and work anniversaries will appear here!
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-2.5 rounded-xl border border-cod-gray/10 bg-cararra p-2.5 text-xs transition hover:bg-cod-gray/5"
                                >
                                    <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-cod-gray text-cararra">
                                        <Icon name={item.icon ?? 'sparkle'} className="size-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <strong className="block text-cod-gray font-bold leading-tight">
                                            {item.title}
                                        </strong>
                                        <p className="mt-0.5 text-cod-gray/75 text-[11px] leading-snug line-clamp-2">
                                            {item.message}
                                        </p>
                                        <span className="mt-1 block text-[10px] text-cod-gray/50">
                                            {item.time ?? 'Just now'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

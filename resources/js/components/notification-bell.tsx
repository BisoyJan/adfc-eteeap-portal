import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import type { SharedData } from '@/types';

export function NotificationBell() {
    const { auth } = usePage<SharedData>().props;
    const count = auth.notificationCount;

    return (
        <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative inline-flex items-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
            <Bell size={20} />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}

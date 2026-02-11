import { Head, Link, router } from '@inertiajs/react';
import { Bell, Check, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

type Notification = {
    id: string;
    type: string;
    data: {
        type: string;
        title: string;
        message: string;
        url: string;
        portfolio_id?: number;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

interface Props {
    notifications: PaginatedData<Notification>;
    unreadCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Notifications', href: '/notifications' },
];

function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
}

export default function Notifications({ notifications, unreadCount }: Props) {
    function markAllAsRead() {
        router.post('/notifications/mark-all-read');
    }

    function markAsRead(id: string) {
        router.patch(`/notifications/${id}/read`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark All as Read
                        </Button>
                    )}
                </div>

                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Bell className="text-muted-foreground mb-4 h-12 w-12" />
                        <p className="text-muted-foreground text-lg">No notifications yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.data.map((notification) => (
                            <Card
                                key={notification.id}
                                className={
                                    notification.read_at === null
                                        ? 'bg-blue-50 dark:bg-blue-950/20'
                                        : ''
                                }
                            >
                                <CardContent className="flex items-start gap-4 p-4">
                                    <div className="mt-2 shrink-0">
                                        <span
                                            className={`block h-2.5 w-2.5 rounded-full ${
                                                notification.read_at === null
                                                    ? 'bg-blue-500'
                                                    : 'bg-transparent'
                                            }`}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold">{notification.data.title}</p>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {notification.data.message}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {timeAgo(notification.created_at)}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={notification.data.url}>
                                                <ExternalLink className="mr-1 h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                        {notification.read_at === null && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <Check className="mr-1 h-4 w-4" />
                                                Mark Read
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {notifications.last_page > 1 && (
                    <nav className="flex flex-wrap items-center justify-center gap-1 pt-4">
                        {notifications.links.map((link, index) => (
                            <span key={index}>
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        className="text-muted-foreground inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm opacity-50"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )}
                            </span>
                        ))}
                    </nav>
                )}
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface ActivityLog {
    id: number;
    action: string;
    description: string;
    ip_address: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    logs: {
        data: ActivityLog[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    actions: string[];
    users: Array<{ id: number; name: string }>;
    filters: { user_id: string; action: string; search: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Activity Logs', href: '/admin/activity-logs' },
];

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const actionBadgeClass: Record<string, string> = {
    login: 'bg-green-100 text-green-700',
    logout: 'bg-gray-100 text-gray-600',
    portfolio_submitted: 'bg-blue-100 text-blue-700',
    portfolio_status_changed: 'bg-indigo-100 text-indigo-700',
    evaluator_assigned: 'bg-purple-100 text-purple-700',
};

export default function Index({ logs, actions, users, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    function handleFilter(key: string, value: string) {
        router.get('/admin/activity-logs', { ...filters, [key]: value }, { preserveState: true, replace: true });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        handleFilter('search', search);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Activity Logs"
                    description="Audit trail of user actions in the system"
                />

                <FlashMessages />

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Search description or user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64"
                        />
                        <Button type="submit" variant="outline" size="sm">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>

                    <Select
                        value={filters.action || 'all'}
                        onValueChange={(v) => handleFilter('action', v === 'all' ? '' : v)}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All Actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            {actions.map((action) => (
                                <SelectItem key={action} value={action}>
                                    {action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.user_id || 'all'}
                        onValueChange={(v) => handleFilter('user_id', v === 'all' ? '' : v)}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All Users" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            {users.map((u) => (
                                <SelectItem key={u.id} value={String(u.id)}>
                                    {u.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">When</th>
                                <th className="px-4 py-3 text-left font-medium">User</th>
                                <th className="px-4 py-3 text-left font-medium">Action</th>
                                <th className="px-4 py-3 text-left font-medium">Description</th>
                                <th className="px-4 py-3 text-left font-medium">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {logs.data.map((log) => (
                                <tr key={log.id} className="hover:bg-muted/50">
                                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                                        {formatDateTime(log.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {log.user ? (
                                            <div>
                                                <p className="font-medium">{log.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{log.user.role}</p>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded px-2 py-0.5 text-xs font-medium ${actionBadgeClass[log.action] ?? 'bg-gray-100 text-gray-700'}`}
                                        >
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{log.description}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                        {log.ip_address ?? '—'}
                                    </td>
                                </tr>
                            ))}
                            {logs.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No activity logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {logs.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {logs.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

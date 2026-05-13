import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Mail, UserCheck, UserX, Clock, Folder } from 'lucide-react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface ActivityLog {
    id: number;
    action: string;
    description: string;
    ip_address: string | null;
    created_at: string;
}

interface Portfolio {
    id: number;
    title: string;
    status: { value: string; label: string } | string;
    created_at: string;
    assignments: Array<{
        id: number;
        evaluator: { id: number; name: string } | null;
    }>;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    deactivated_at: string | null;
    deactivation_reason: string | null;
    created_at: string;
    portfolios: Portfolio[];
    activity_logs: ActivityLog[];
}

interface Props {
    user: User;
    portfolioStats: { total: number; approved: number; under_review: number };
    assignedEvaluators: Array<{ id: number; name: string }>;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getStatusValue(status: { value: string; label: string } | string): string {
    return typeof status === 'object' ? status.value : status;
}

function getStatusLabel(status: { value: string; label: string } | string): string {
    return typeof status === 'object'
        ? status.label
        : status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const statusBadgeClass: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-indigo-100 text-indigo-700',
    evaluated: 'bg-purple-100 text-purple-700',
    revision_requested: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function Show({ user, portfolioStats, assignedEvaluators }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/admin/users' },
        { title: user.name, href: `/admin/users/${user.id}` },
    ];

    function handleToggleActive() {
        const route = user.is_active
            ? `/admin/users/${user.id}/deactivate`
            : `/admin/users/${user.id}/activate`;
        router.post(route, {}, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/users">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <Heading
                            title={user.name}
                            description={user.email}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/users/${user.id}/edit`}>Edit</Link>
                        </Button>
                        {user.is_active ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-amber-600 border-amber-300 hover:text-amber-700"
                                onClick={handleToggleActive}
                            >
                                <UserX className="mr-1 h-4 w-4" />
                                Deactivate
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-300 hover:text-green-700"
                                onClick={handleToggleActive}
                            >
                                <UserCheck className="mr-1 h-4 w-4" />
                                Activate
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/messages/create?to=${user.id}`}>
                                <Mail className="mr-1 h-4 w-4" />
                                Message
                            </Link>
                        </Button>
                    </div>
                </div>

                <FlashMessages />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Role</span>
                                <Badge variant="secondary">
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={user.is_active ? 'default' : 'destructive'}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Joined</span>
                                <span>{formatDate(user.created_at)}</span>
                            </div>
                            {!user.is_active && user.deactivated_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Deactivated</span>
                                    <span>{formatDate(user.deactivated_at)}</span>
                                </div>
                            )}
                            {user.deactivation_reason && (
                                <div>
                                    <span className="text-muted-foreground">Reason</span>
                                    <p className="mt-1 rounded bg-muted p-2 text-xs">{user.deactivation_reason}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Portfolio Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Portfolio Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Portfolios</span>
                                <span className="font-medium">{portfolioStats.total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Under Review</span>
                                <span className="font-medium">{portfolioStats.under_review}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Approved</span>
                                <span className="font-medium text-green-600">{portfolioStats.approved}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned Evaluators */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Evaluators</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignedEvaluators.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No evaluators assigned.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {assignedEvaluators.map((ev) => (
                                        <li key={ev.id} className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-green-500" />
                                            {ev.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Portfolios */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            Portfolios
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.portfolios.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No portfolios yet.</p>
                        ) : (
                            <div className="overflow-hidden rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Title</th>
                                            <th className="px-4 py-2 text-left font-medium">Status</th>
                                            <th className="px-4 py-2 text-left font-medium">Evaluator(s)</th>
                                            <th className="px-4 py-2 text-left font-medium">Created</th>
                                            <th className="px-4 py-2 text-right font-medium">View</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {user.portfolios.map((portfolio) => {
                                            const statusVal = getStatusValue(portfolio.status);
                                            return (
                                                <tr key={portfolio.id} className="hover:bg-muted/50">
                                                    <td className="px-4 py-2 font-medium">{portfolio.title}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadgeClass[statusVal] ?? 'bg-gray-100 text-gray-700'}`}>
                                                            {getStatusLabel(portfolio.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground">
                                                        {portfolio.assignments
                                                            .filter((a) => a.evaluator)
                                                            .map((a) => a.evaluator!.name)
                                                            .join(', ') || '—'}
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground">{formatDate(portfolio.created_at)}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/portfolios/${portfolio.id}`}>View</Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Activity Log */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.activity_logs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No activity recorded.</p>
                        ) : (
                            <ul className="space-y-2">
                                {user.activity_logs.map((log) => (
                                    <li key={log.id} className="flex items-start gap-3 text-sm">
                                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40" />
                                        <div className="flex-1">
                                            <span className="font-medium">{log.action}</span>
                                            {' — '}
                                            <span className="text-muted-foreground">{log.description}</span>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatDateTime(log.created_at)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

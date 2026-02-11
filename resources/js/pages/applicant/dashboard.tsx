import { Head, Link, usePage } from '@inertiajs/react';
import {
    Folder,
    Clock,
    CheckCircle,
    AlertCircle,
    Bell,
    FileText,
    Plus,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface Props {
    stats: {
        total: number;
        draft: number;
        submitted: number;
        under_review: number;
        evaluated: number;
        approved: number;
        revision_requested: number;
        rejected: number;
    };
    recentNotifications: Array<{
        id: string;
        data: {
            type: string;
            title: string;
            message: string;
            url: string;
        };
        read_at: string | null;
        created_at: string;
    }>;
    recentPortfolios: Array<{
        id: number;
        title: string;
        status: string;
        documents_count: number;
        created_at: string;
        updated_at: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/applicant/dashboard' },
];

function getStatusColor(status: string): string {
    switch (status) {
        case 'draft':
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        case 'submitted':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
        case 'under_review':
            return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
        case 'evaluated':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
        case 'revision_requested':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
        case 'approved':
            return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
        case 'rejected':
            return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

function getStatusLabel(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(dateString: string): string {
    const seconds = Math.floor(
        (Date.now() - new Date(dateString).getTime()) / 1000,
    );
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function Dashboard({
    stats,
    recentNotifications,
    recentPortfolios,
}: Props) {
    const { auth } = usePage<SharedData>().props;

    const statusBreakdown = [
        { key: 'draft', count: stats.draft },
        { key: 'submitted', count: stats.submitted },
        { key: 'under_review', count: stats.under_review },
        { key: 'evaluated', count: stats.evaluated },
        { key: 'revision_requested', count: stats.revision_requested },
        { key: 'approved', count: stats.approved },
        { key: 'rejected', count: stats.rejected },
    ].filter((s) => s.count > 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Applicant Dashboard" />

            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Welcome back, {auth.user.name}
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                                <Folder className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Portfolios
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.total}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Under Review
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.under_review + stats.submitted}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Approved
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.approved}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900">
                                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Needs Attention
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.revision_requested + stats.draft}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Portfolio Status Breakdown */}
                {statusBreakdown.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Portfolio Status Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {statusBreakdown.map(({ key, count }) => (
                                    <span
                                        key={key}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(key)}`}
                                    >
                                        {getStatusLabel(key)}
                                        <span className="font-bold">
                                            {count}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Two-column layout */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Recent Portfolios */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Recent Portfolios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentPortfolios.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No portfolios yet. Create your first
                                        one!
                                    </p>
                                    <Button asChild size="sm">
                                        <Link href="/applicant/portfolios/create">
                                            <Plus className="mr-1.5 h-4 w-4" />
                                            Create Portfolio
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentPortfolios
                                        .slice(0, 3)
                                        .map((portfolio) => (
                                            <div
                                                key={portfolio.id}
                                                className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">
                                                        {portfolio.title}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-2 text-sm">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(portfolio.status)}`}
                                                        >
                                                            {getStatusLabel(
                                                                portfolio.status,
                                                            )}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {
                                                                portfolio.documents_count
                                                            }{' '}
                                                            documents
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {timeAgo(
                                                        portfolio.updated_at,
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    <Link
                                        href="/applicant/portfolios"
                                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                    >
                                        View All Portfolios
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Recent Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentNotifications.length === 0 ? (
                                <div className="py-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No notifications yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentNotifications
                                        .slice(0, 5)
                                        .map((notification) => (
                                            <div
                                                key={notification.id}
                                                className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                                            >
                                                {!notification.read_at && (
                                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">
                                                        {
                                                            notification.data
                                                                .title
                                                        }
                                                    </p>
                                                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                                        {
                                                            notification.data
                                                                .message
                                                        }
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {timeAgo(
                                                        notification.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    <Link
                                        href="/applicant/notifications"
                                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                    >
                                        View All Notifications
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

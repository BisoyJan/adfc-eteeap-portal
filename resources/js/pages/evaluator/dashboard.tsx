import { Head, Link, usePage } from '@inertiajs/react';
import { ClipboardList, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface Props {
    stats: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
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
    priorityQueue: Array<{
        id: number;
        status: string;
        due_date: string | null;
        assigned_at: string;
        is_overdue: boolean;
        days_remaining: number | null;
        portfolio: {
            id: number;
            title: string;
            user: { name: string };
        };
    }>;
    announcements: Array<{
        id: number;
        title: string;
        body: string;
        published_at: string | null;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/evaluator/dashboard' },
];

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

function getStatusBadge(status: string) {
    switch (status) {
        case 'pending':
            return (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Pending
                </Badge>
            );
        case 'in_progress':
            return (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    In Progress
                </Badge>
            );
        case 'completed':
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Completed
                </Badge>
            );
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export default function Dashboard({
    stats,
    recentNotifications,
    priorityQueue,
    announcements,
}: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evaluator Dashboard" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Welcome back, {auth.user.name}
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Assignments
                            </CardTitle>
                            <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Reviews
                            </CardTitle>
                            <Clock className="h-5 w-5 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-amber-600">
                                {stats.pending + stats.in_progress}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Completed
                            </CardTitle>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">
                                {stats.completed}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Two-column layout */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Priority Queue */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Priority Queue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {priorityQueue.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    All caught up! No pending reviews.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {priorityQueue
                                        .slice(0, 5)
                                        .map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="flex items-start justify-between gap-3"
                                            >
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {assignment.portfolio.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Applicant: {assignment.portfolio.user.name}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusBadge(assignment.status)}
                                                        {assignment.is_overdue ? (
                                                            <span className="text-xs font-semibold text-red-600">
                                                                Overdue
                                                            </span>
                                                        ) : assignment.days_remaining !== null ? (
                                                            <span className={`text-xs ${assignment.days_remaining <= 3
                                                                    ? 'font-semibold text-amber-600'
                                                                    : 'text-muted-foreground'
                                                                }`}>
                                                                {assignment.days_remaining === 0
                                                                    ? 'Due today'
                                                                    : `${assignment.days_remaining}d left`}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/evaluator/portfolios/${assignment.id}`}>
                                                        Review
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            )}
                            <div className="mt-4 border-t pt-4">
                                <Link
                                    href="/evaluator/portfolios"
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    View All Reviews
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentNotifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No notifications yet.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {recentNotifications
                                        .slice(0, 5)
                                        .map((notification) => (
                                            <div
                                                key={notification.id}
                                                className="flex items-start gap-3"
                                            >
                                                <div className="mt-1.5 shrink-0">
                                                    {notification.read_at ===
                                                        null ? (
                                                        <span className="block h-2 w-2 rounded-full bg-blue-500" />
                                                    ) : (
                                                        <span className="block h-2 w-2 rounded-full bg-muted" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {
                                                            notification.data
                                                                .title
                                                        }
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {
                                                            notification.data
                                                                .message
                                                        }
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {timeAgo(
                                                            notification.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                            <div className="mt-4 border-t pt-4">
                                <Link
                                    href="/evaluator/notifications"
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    View All Notifications
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Announcements */}
                {announcements.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Announcements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {announcements.map((a) => (
                                <div key={a.id} className="rounded-lg border bg-muted/30 p-4">
                                    <p className="font-medium">{a.title}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                                    {a.published_at && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

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
    pendingAssignments: Array<{
        id: number;
        status: string;
        due_date: string | null;
        assigned_at: string;
        portfolio: {
            id: number;
            title: string;
            user: {
                name: string;
            };
        };
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/evaluator/dashboard' },
];

function timeAgo(dateString: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
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
            return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
        case 'in_progress':
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
        case 'completed':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

function isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
}

export default function Dashboard({ stats, recentNotifications, pendingAssignments }: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evaluator Dashboard" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back, {auth.user.name}</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                            <ClipboardList className="text-muted-foreground h-5 w-5" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                            <Clock className="h-5 w-5 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-amber-600">{stats.pending + stats.in_progress}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Two-column layout */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Pending Reviews */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingAssignments.length === 0 ? (
                                <p className="text-muted-foreground text-sm">All caught up! No pending reviews.</p>
                            ) : (
                                <div className="space-y-4">
                                    {pendingAssignments.slice(0, 5).map((assignment) => (
                                        <div key={assignment.id} className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <p className="truncate text-sm font-medium">{assignment.portfolio.title}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    Applicant: {assignment.portfolio.user.name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(assignment.status)}
                                                    {assignment.due_date && (
                                                        <span
                                                            className={`text-xs ${isOverdue(assignment.due_date) ? 'font-semibold text-red-600' : 'text-muted-foreground'}`}
                                                        >
                                                            {isOverdue(assignment.due_date) ? 'Overdue: ' : 'Due: '}
                                                            {new Date(assignment.due_date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/evaluator/portfolios/${assignment.id}`}>Review</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 border-t pt-4">
                                <Link
                                    href="/evaluator/portfolios"
                                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
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
                                <p className="text-muted-foreground text-sm">No notifications yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {recentNotifications.slice(0, 5).map((notification) => (
                                        <div key={notification.id} className="flex items-start gap-3">
                                            <div className="mt-1.5 flex-shrink-0">
                                                {notification.read_at === null ? (
                                                    <span className="block h-2 w-2 rounded-full bg-blue-500" />
                                                ) : (
                                                    <span className="bg-muted block h-2 w-2 rounded-full" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{notification.data.title}</p>
                                                <p className="text-muted-foreground truncate text-xs">{notification.data.message}</p>
                                                <p className="text-muted-foreground mt-0.5 text-xs">{timeAgo(notification.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 border-t pt-4">
                                <Link
                                    href="/evaluator/notifications"
                                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
                                >
                                    View All Notifications
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

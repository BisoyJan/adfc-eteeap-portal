import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileText,
    Users,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface PortfolioStatusInfo {
    label: string;
    color: string;
    count: number;
}

interface RecentSubmission {
    id: number;
    title: string;
    status: string;
    submitted_at: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface EvaluatorWorkload {
    id: number;
    name: string;
    email: string;
    active_assignments_count: number;
    completed_assignments_count: number;
}

interface Props {
    portfoliosByStatus: Record<string, PortfolioStatusInfo>;
    recentSubmissions: RecentSubmission[];
    evaluatorWorkload: EvaluatorWorkload[];
    stats: {
        total_portfolios: number;
        total_applicants: number;
        total_evaluators: number;
        pending_assignments: number;
    };
    learnerStats: {
        active: number;
        completed: number;
        inactive: number;
    };
    learnersWithIncompleteRequirements: Array<{
        id: number;
        title: string;
        status: string;
        user: { id: number; name: string };
        required_total: number;
        required_completed: number;
    }>;
    upcomingAssignmentDeadlines: Array<{
        id: number;
        portfolio_title: string;
        applicant_name: string;
        evaluator_name: string;
        due_date: string;
        is_overdue: boolean;
        days_remaining: number;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
];

const statusBadgeVariant: Record<
    string,
    'destructive' | 'default' | 'secondary' | 'outline'
> = {
    draft: 'secondary',
    submitted: 'default',
    under_review: 'outline',
    evaluated: 'default',
    revision_requested: 'destructive',
    approved: 'default',
    rejected: 'destructive',
};

const statusBadgeClassName: Record<string, string> = {
    under_review: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
    evaluated:
        'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-200',
    approved:
        'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200',
};

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatStatus(status: string): string {
    return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

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
    return formatDate(dateString);
}

export default function Dashboard({
    portfoliosByStatus,
    recentSubmissions,
    evaluatorWorkload,
    stats,
    learnerStats,
    learnersWithIncompleteRequirements,
    upcomingAssignmentDeadlines,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Admin Dashboard"
                    description="Overview of the ETEEAP evaluation system"
                />

                {/* Stats Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription>Total Portfolios</CardDescription>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_portfolios}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription>Applicants</CardDescription>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_applicants}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription>Evaluators</CardDescription>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_evaluators}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription>Needs Assignment</CardDescription>
                            <AlertCircle
                                className={`h-4 w-4 ${stats.pending_assignments > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}
                            />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${stats.pending_assignments > 0 ? 'text-orange-600 dark:text-orange-400' : ''}`}
                            >
                                {stats.pending_assignments}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Portfolio Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Portfolios by Status</CardTitle>
                        <CardDescription>
                            Breakdown of all portfolios across different stages
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(portfoliosByStatus).map(
                                ([key, info]) => (
                                    <Link
                                        key={key}
                                        href={`/admin/portfolios?status=${key}`}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    statusBadgeVariant[key] ??
                                                    'secondary'
                                                }
                                                className={
                                                    statusBadgeClassName[key] ??
                                                    ''
                                                }
                                            >
                                                {info.label}
                                            </Badge>
                                        </div>
                                        <span className="text-lg font-semibold">
                                            {info.count}
                                        </span>
                                    </Link>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Two-column section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Learner Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Learner Status Overview</CardTitle>
                            <CardDescription>Breakdown of all learner accounts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-lg border p-3">
                                    <div className="text-2xl font-bold text-blue-600">{learnerStats.active}</div>
                                    <div className="text-xs text-muted-foreground">Active</div>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <div className="text-2xl font-bold text-green-600">{learnerStats.completed}</div>
                                    <div className="text-xs text-muted-foreground">Completed</div>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <div className="text-2xl font-bold text-red-600">{learnerStats.inactive}</div>
                                    <div className="text-xs text-muted-foreground">Inactive</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Incomplete Requirements */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Incomplete Requirements</CardTitle>
                                    <CardDescription>Learners with missing required documents</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/admin/portfolios">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {learnersWithIncompleteRequirements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <CheckCircle2 className="mb-2 h-8 w-8 text-green-500" />
                                    <p className="text-sm text-muted-foreground">All learners have complete requirements</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {learnersWithIncompleteRequirements.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/admin/portfolios/${item.id}`}
                                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{item.user.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{item.title}</p>
                                                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-amber-500"
                                                        style={{ width: `${Math.round((item.required_completed / item.required_total) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="ml-2 shrink-0 text-xs font-medium text-muted-foreground">
                                                {item.required_completed}/{item.required_total}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Assignment Deadlines */}
                {upcomingAssignmentDeadlines.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarClock className="h-5 w-5 text-amber-500" />
                                Assignment Deadlines
                                {upcomingAssignmentDeadlines.some((d) => d.is_overdue) && (
                                    <span className="ml-1 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                        {upcomingAssignmentDeadlines.filter((d) => d.is_overdue).length} overdue
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-2 text-left font-medium">Portfolio</th>
                                            <th className="px-4 py-2 text-left font-medium">Evaluator</th>
                                            <th className="px-4 py-2 text-right font-medium">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {upcomingAssignmentDeadlines.map((d) => (
                                            <tr key={d.id} className={`border-b last:border-0 ${d.is_overdue ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                                                <td className="px-4 py-2.5">
                                                    <p className="font-medium">{d.portfolio_title}</p>
                                                    <p className="text-xs text-muted-foreground">{d.applicant_name}</p>
                                                </td>
                                                <td className="px-4 py-2.5 text-muted-foreground">{d.evaluator_name}</td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <p className="font-medium">{new Date(d.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                                    <p className={`text-xs ${d.is_overdue ? 'font-semibold text-red-600' : d.days_remaining <= 3 ? 'font-semibold text-amber-600' : 'text-muted-foreground'}`}>
                                                        {d.is_overdue ? `${Math.abs(d.days_remaining)}d overdue` : d.days_remaining === 0 ? 'Due today' : `${d.days_remaining}d left`}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Two-column section (original) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Submissions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Submissions</CardTitle>
                                    <CardDescription>
                                        Latest portfolio submissions requiring
                                        attention
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/admin/portfolios">
                                        View All
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentSubmissions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CheckCircle2 className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        No recent submissions
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentSubmissions.map((submission) => (
                                        <Link
                                            key={submission.id}
                                            href={`/admin/portfolios/${submission.id}`}
                                            className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">
                                                        {submission.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {submission.user.name}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        statusBadgeVariant[
                                                        submission.status
                                                        ] ?? 'secondary'
                                                    }
                                                    className={
                                                        statusBadgeClassName[
                                                        submission.status
                                                        ] ?? ''
                                                    }
                                                >
                                                    {formatStatus(
                                                        submission.status,
                                                    )}
                                                </Badge>
                                            </div>
                                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {timeAgo(
                                                    submission.submitted_at ??
                                                    submission.created_at,
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Evaluator Workload */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Evaluator Workload</CardTitle>
                            <CardDescription>
                                Current assignment distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {evaluatorWorkload.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Users className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        No evaluators registered yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground">
                                        <span>Evaluator</span>
                                        <div className="flex gap-6">
                                            <span>Active</span>
                                            <span>Completed</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    {evaluatorWorkload.map((evaluator) => (
                                        <div
                                            key={evaluator.id}
                                            className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {evaluator.name}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {evaluator.email}
                                                </p>
                                            </div>
                                            <div className="flex gap-8">
                                                <Badge
                                                    variant={
                                                        evaluator.active_assignments_count >
                                                            0
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {
                                                        evaluator.active_assignments_count
                                                    }
                                                </Badge>
                                                <Badge variant="outline">
                                                    {
                                                        evaluator.completed_assignments_count
                                                    }
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

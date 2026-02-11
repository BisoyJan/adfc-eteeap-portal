import { Head } from '@inertiajs/react';
import {
    BarChart3,
    Users,
    FileText,
    CheckCircle,
    XCircle,
    TrendingUp,
    Award,
    ClipboardList,
} from 'lucide-react';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface PortfolioStatusItem {
    status: string;
    count: number;
    color: string;
}

interface CriteriaPerformance {
    name: string;
    max_score: number;
    average_score: number;
    percentage: number;
    evaluations_count: number;
}

interface EvaluatorPerformance {
    name: string;
    email: string;
    total_assignments: number;
    completed_assignments: number;
    pending_assignments: number;
    average_score_percentage: number;
}

interface Props {
    portfoliosByStatus: PortfolioStatusItem[];
    summary: {
        total_portfolios: number;
        approved_portfolios: number;
        rejected_portfolios: number;
        completion_rate: number;
        total_evaluations: number;
        average_score: number;
        total_applicants: number;
        total_evaluators: number;
    };
    criteriaPerformance: CriteriaPerformance[];
    evaluatorPerformance: EvaluatorPerformance[];
    recommendationBreakdown: Record<string, number>;
    monthlySubmissions: Record<string, number>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '/admin/reports' },
];

function getStatusColor(color: string): string {
    switch (color) {
        case 'secondary':
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        case 'default':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
        case 'warning':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
        case 'info':
            return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
        case 'success':
            return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
        case 'destructive':
            return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

function getRecommendationLabel(key: string): string {
    switch (key) {
        case 'approve':
            return 'Approve';
        case 'revise':
            return 'Revise';
        case 'reject':
            return 'Reject';
        default:
            return key;
    }
}

function getRecommendationColor(key: string): string {
    switch (key) {
        case 'approve':
            return 'bg-green-500';
        case 'revise':
            return 'bg-amber-500';
        case 'reject':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
}

function formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
    });
}

export default function Reports({
    portfoliosByStatus,
    summary,
    criteriaPerformance,
    evaluatorPerformance,
    recommendationBreakdown,
    monthlySubmissions,
}: Props) {
    const totalRecommendations = Object.values(recommendationBreakdown).reduce(
        (sum, count) => sum + count,
        0,
    );
    const monthEntries = Object.entries(monthlySubmissions);
    const maxMonthly = Math.max(...Object.values(monthlySubmissions), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading
                    title="Reports & Analytics"
                    description="Program-wide statistics, evaluation metrics, and performance insights"
                />

                {/* Summary Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Portfolios
                                </p>
                                <p className="text-2xl font-bold">
                                    {summary.total_portfolios}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Completion Rate
                                </p>
                                <p className="text-2xl font-bold">
                                    {summary.completion_rate}%
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900">
                                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Average Score
                                </p>
                                <p className="text-2xl font-bold">
                                    {summary.average_score}%
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                                <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Evaluations
                                </p>
                                <p className="text-2xl font-bold">
                                    {summary.total_evaluations}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Portfolio Status Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Portfolio Status Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {portfoliosByStatus.map((item) => (
                                <div
                                    key={item.status}
                                    className="flex items-center gap-3"
                                >
                                    <span className="w-32 text-sm font-medium">
                                        {item.status}
                                    </span>
                                    <div className="flex-1">
                                        <div className="h-6 w-full rounded-full bg-secondary">
                                            <div
                                                className={`flex h-full items-center justify-end rounded-full px-2 text-xs font-bold text-white ${getStatusColor(item.color).includes('green') ? 'bg-green-500' : getStatusColor(item.color).includes('blue') ? 'bg-blue-500' : getStatusColor(item.color).includes('amber') ? 'bg-amber-500' : getStatusColor(item.color).includes('red') ? 'bg-red-500' : getStatusColor(item.color).includes('indigo') ? 'bg-indigo-500' : 'bg-gray-400'}`}
                                                style={{
                                                    width: `${summary.total_portfolios > 0 ? Math.max((item.count / summary.total_portfolios) * 100, item.count > 0 ? 12 : 0) : 0}%`,
                                                }}
                                            >
                                                {item.count > 0 && item.count}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="w-8 text-right text-sm text-muted-foreground">
                                        {item.count}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recommendation Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Evaluator Recommendations</CardTitle>
                            <CardDescription>
                                Distribution of evaluator recommendations across
                                completed evaluations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {totalRecommendations === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No evaluations completed yet.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(
                                        recommendationBreakdown,
                                    ).map(([key, count]) => {
                                        const percentage = Math.round(
                                            (count / totalRecommendations) *
                                                100,
                                        );
                                        return (
                                            <div
                                                key={key}
                                                className="space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">
                                                        {getRecommendationLabel(
                                                            key,
                                                        )}
                                                    </span>
                                                    <span>
                                                        {count} ({percentage}%)
                                                    </span>
                                                </div>
                                                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                                                    <div
                                                        className={`h-full rounded-full ${getRecommendationColor(key)}`}
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Competency/Criteria Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Competency Performance by Criteria
                            </CardTitle>
                            <CardDescription>
                                Average scores across all submitted evaluations
                                per rubric criteria
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {criteriaPerformance.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No evaluation data available.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {criteriaPerformance.map((criteria) => (
                                        <div
                                            key={criteria.name}
                                            className="space-y-1.5"
                                        >
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">
                                                    {criteria.name}
                                                </span>
                                                <span>
                                                    {criteria.average_score}/
                                                    {criteria.max_score}{' '}
                                                    <span className="text-muted-foreground">
                                                        ({criteria.percentage}%)
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                                                <div
                                                    className={`h-full rounded-full ${criteria.percentage >= 75 ? 'bg-green-500' : criteria.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{
                                                        width: `${criteria.percentage}%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Based on{' '}
                                                {criteria.evaluations_count}{' '}
                                                evaluation
                                                {criteria.evaluations_count !==
                                                1
                                                    ? 's'
                                                    : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Monthly Submissions Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Monthly Submissions (Last 6 Months)
                            </CardTitle>
                            <CardDescription>
                                Portfolio submission trends over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {monthEntries.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No submissions data available.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {monthEntries.map(([month, count]) => (
                                        <div
                                            key={month}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="w-20 text-sm font-medium">
                                                {formatMonth(month)}
                                            </span>
                                            <div className="flex-1">
                                                <div className="h-6 w-full rounded-full bg-secondary">
                                                    <div
                                                        className="flex h-full items-center justify-end rounded-full bg-blue-500 px-2 text-xs font-bold text-white"
                                                        style={{
                                                            width: `${Math.max((count / maxMonthly) * 100, count > 0 ? 15 : 0)}%`,
                                                        }}
                                                    >
                                                        {count > 0 && count}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Evaluator Performance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Evaluator Performance
                        </CardTitle>
                        <CardDescription>
                            Assignment completion and scoring statistics per
                            evaluator
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {evaluatorPerformance.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No evaluator data available.
                            </p>
                        ) : (
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-3 text-left font-medium">
                                                Evaluator
                                            </th>
                                            <th className="px-4 py-3 text-center font-medium">
                                                Total Assigned
                                            </th>
                                            <th className="px-4 py-3 text-center font-medium">
                                                Completed
                                            </th>
                                            <th className="px-4 py-3 text-center font-medium">
                                                Pending
                                            </th>
                                            <th className="px-4 py-3 text-center font-medium">
                                                Avg Score
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {evaluatorPerformance.map(
                                            (evaluator) => (
                                                <tr
                                                    key={evaluator.email}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">
                                                            {evaluator.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {evaluator.email}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {
                                                            evaluator.total_assignments
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center gap-1">
                                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                            {
                                                                evaluator.completed_assignments
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center gap-1">
                                                            {evaluator.pending_assignments >
                                                                0 && (
                                                                <XCircle className="h-3.5 w-3.5 text-amber-500" />
                                                            )}
                                                            {
                                                                evaluator.pending_assignments
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`font-medium ${evaluator.average_score_percentage >= 75 ? 'text-green-600' : evaluator.average_score_percentage >= 50 ? 'text-amber-600' : evaluator.average_score_percentage > 0 ? 'text-red-600' : 'text-muted-foreground'}`}
                                                        >
                                                            {evaluator.average_score_percentage >
                                                            0
                                                                ? `${evaluator.average_score_percentage}%`
                                                                : '—'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Summary Stats Row */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Applicants
                            </p>
                            <p className="text-xl font-bold">
                                {summary.total_applicants}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Evaluators
                            </p>
                            <p className="text-xl font-bold">
                                {summary.total_evaluators}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Approved
                            </p>
                            <p className="text-xl font-bold text-green-600">
                                {summary.approved_portfolios}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Rejected
                            </p>
                            <p className="text-xl font-bold text-red-600">
                                {summary.rejected_portfolios}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

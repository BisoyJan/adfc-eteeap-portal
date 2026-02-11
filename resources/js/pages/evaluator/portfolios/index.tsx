import { Head, Link } from '@inertiajs/react';
import {
    ClipboardCheck,
    Clock,
    FileText,
    User,
    AlertTriangle,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Portfolio {
    id: number;
    title: string;
    status: string;
    submitted_at: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
    documents: Array<{ id: number }>;
}

interface Assignment {
    id: number;
    status: string;
    due_date: string | null;
    notes: string | null;
    assigned_at: string;
    completed_at: string | null;
    portfolio: Portfolio;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    assignments: {
        data: Assignment[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Assigned Reviews', href: '/evaluator/portfolios' },
];

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

function isPastDue(dateString: string): boolean {
    return new Date(dateString) < new Date();
}

function getAssignmentBadgeProps(status: string): {
    variant: 'default' | 'secondary' | 'outline';
    className?: string;
} {
    switch (status) {
        case 'pending':
            return { variant: 'secondary' };
        case 'in_progress':
            return {
                variant: 'outline',
                className:
                    'border-amber-500 text-amber-700 dark:text-amber-400',
            };
        case 'completed':
            return {
                variant: 'default',
                className:
                    'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200',
            };
        default:
            return { variant: 'outline' };
    }
}

const portfolioStatusBadgeVariant: Record<
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

const portfolioStatusBadgeClassName: Record<string, string> = {
    under_review: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
    evaluated:
        'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-200',
    approved:
        'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200',
};

export default function Index({ assignments }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assigned Reviews" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Assigned Reviews"
                    description="Portfolios assigned to you for evaluation"
                />

                {assignments.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                        <ClipboardCheck className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            No portfolios have been assigned to you yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {assignments.data.map((assignment) => {
                            const assignmentBadge = getAssignmentBadgeProps(
                                assignment.status,
                            );
                            const pastDue =
                                assignment.due_date &&
                                isPastDue(assignment.due_date) &&
                                assignment.status !== 'completed';

                            return (
                                <Card key={assignment.id}>
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">
                                                <Link
                                                    href={`/evaluator/portfolios/${assignment.id}`}
                                                    className="hover:underline"
                                                >
                                                    {assignment.portfolio.title}
                                                </Link>
                                            </CardTitle>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <User className="h-3.5 w-3.5" />
                                                {assignment.portfolio.user.name}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    portfolioStatusBadgeVariant[
                                                    assignment.portfolio
                                                        .status
                                                    ] ?? 'outline'
                                                }
                                                className={
                                                    portfolioStatusBadgeClassName[
                                                    assignment.portfolio
                                                        .status
                                                    ] ?? ''
                                                }
                                            >
                                                {formatStatus(
                                                    assignment.portfolio.status,
                                                )}
                                            </Badge>
                                            <Badge
                                                variant={
                                                    assignmentBadge.variant
                                                }
                                                className={
                                                    assignmentBadge.className
                                                }
                                            >
                                                {formatStatus(
                                                    assignment.status,
                                                )}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {
                                                        assignment.portfolio
                                                            .documents.length
                                                    }{' '}
                                                    {assignment.portfolio
                                                        .documents.length === 1
                                                        ? 'document'
                                                        : 'documents'}
                                                </span>
                                                {assignment.due_date && (
                                                    <span
                                                        className={`flex items-center gap-1 ${pastDue ? 'font-medium text-destructive' : ''}`}
                                                    >
                                                        {pastDue && (
                                                            <AlertTriangle className="h-3.5 w-3.5" />
                                                        )}
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Due{' '}
                                                        {formatDate(
                                                            assignment.due_date,
                                                        )}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Assigned{' '}
                                                    {formatDate(
                                                        assignment.assigned_at,
                                                    )}
                                                </span>
                                            </div>
                                            <Button size="sm" asChild>
                                                <Link
                                                    href={`/evaluator/portfolios/${assignment.id}`}
                                                >
                                                    <ClipboardCheck className="mr-1 h-4 w-4" />
                                                    Review
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {assignments.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {assignments.current_page} of{' '}
                            {assignments.last_page}
                        </p>
                        <div className="flex gap-2">
                            {assignments.links[0]?.url ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={assignments.links[0].url}>
                                        &larr; Previous
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    &larr; Previous
                                </Button>
                            )}
                            {assignments.links[assignments.links.length - 1]
                                ?.url ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={
                                            assignments.links[
                                                assignments.links.length - 1
                                            ].url!
                                        }
                                    >
                                        Next &rarr;
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    Next &rarr;
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

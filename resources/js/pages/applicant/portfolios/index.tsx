import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, Eye, Trash2, FileText } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
    created_at: string;
    updated_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    portfolios: {
        data: Portfolio[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Portfolios', href: '/applicant/portfolios' },
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

export default function Index({ portfolios }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [portfolioToDelete, setPortfolioToDelete] =
        useState<Portfolio | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    function handleDelete(portfolio: Portfolio) {
        setPortfolioToDelete(portfolio);
        setDeleteDialogOpen(true);
    }

    function handleConfirmDelete() {
        if (!portfolioToDelete) {
            return;
        }

        router.delete(`/applicant/portfolios/${portfolioToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteDialogOpen(false);
                setPortfolioToDelete(null);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Portfolios" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="My Portfolios"
                        description="Manage your ETEEAP portfolio submissions"
                    />
                    <Button asChild>
                        <Link href="/applicant/portfolios/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Portfolio
                        </Link>
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                {portfolios.data.length === 0 ? (
                    <Card className="py-12 text-center">
                        <CardContent className="flex flex-col items-center gap-4">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium">
                                    No portfolios yet
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Get started by creating your first ETEEAP
                                    portfolio submission.
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/applicant/portfolios/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Portfolio
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {portfolios.data.map((portfolio) => (
                            <Card key={portfolio.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">
                                            {portfolio.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>
                                                Created{' '}
                                                {formatDate(
                                                    portfolio.created_at,
                                                )}
                                            </span>
                                            <span>·</span>
                                            <span>
                                                {portfolio.submitted_at
                                                    ? `Submitted ${formatDate(portfolio.submitted_at)}`
                                                    : 'Not yet submitted'}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            statusBadgeVariant[
                                            portfolio.status
                                            ] ?? 'outline'
                                        }
                                        className={
                                            portfolio.status === 'approved'
                                                ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300'
                                                : ''
                                        }
                                    >
                                        {formatStatus(portfolio.status)}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/applicant/portfolios/${portfolio.id}`}
                                            >
                                                <Eye className="mr-1 h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                        {portfolio.status === 'draft' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    handleDelete(portfolio)
                                                }
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {portfolios.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {portfolios.current_page} of{' '}
                            {portfolios.last_page}
                        </p>
                        <div className="flex gap-2">
                            {portfolios.links[0]?.url ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={portfolios.links[0].url}>
                                        &larr; Previous
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    &larr; Previous
                                </Button>
                            )}
                            {portfolios.links[portfolios.links.length - 1]
                                ?.url ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={
                                            portfolios.links[
                                                portfolios.links.length - 1
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

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) {
                        setPortfolioToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete this portfolio?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {portfolioToDelete
                                ? `"${portfolioToDelete.title}" will be permanently removed.`
                                : 'This portfolio will be permanently removed.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete Portfolio
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

import { Head, Link, usePage, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Portfolio {
    id: number;
    title: string;
    status: string;
    admin_notes: string | null;
    submitted_at: string | null;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    assignments: Array<{
        id: number;
        status: string;
        evaluator: {
            id: number;
            name: string;
        };
    }>;
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
    statuses: Array<{ value: string; label: string }>;
    filters: {
        status: string;
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manage Portfolios', href: '/admin/portfolios' },
];

const statusBadgeVariant: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
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
    evaluated: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-200',
    approved: 'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200',
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

export default function Index({ portfolios, statuses, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/admin/portfolios', { search, status }, { preserveState: true, replace: true });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status]);

    function handleStatusChange(value: string) {
        const newStatus = value === 'all' ? '' : value;
        setStatus(newStatus);
        router.get('/admin/portfolios', { search, status: newStatus }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Portfolios" />

            <div className="space-y-6 p-6">
                <Heading title="Portfolios" description="Review and manage all applicant portfolios" />

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <div className="relative max-w-sm flex-1">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Search by applicant or title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={status || 'all'} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statuses.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Applicant</th>
                                <th className="px-4 py-3 text-left font-medium">Portfolio Title</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Submitted</th>
                                <th className="px-4 py-3 text-left font-medium">Evaluators</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {portfolios.data.map((portfolio) => (
                                <tr key={portfolio.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium">{portfolio.user.name}</div>
                                            <div className="text-muted-foreground text-xs">{portfolio.user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{portfolio.title}</td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={statusBadgeVariant[portfolio.status] ?? 'outline'}
                                            className={statusBadgeClassName[portfolio.status] ?? ''}
                                        >
                                            {formatStatus(portfolio.status)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {portfolio.submitted_at ? formatDate(portfolio.submitted_at) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {portfolio.assignments.length}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/portfolios/${portfolio.id}`}>
                                                <Eye className="mr-1 h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {portfolios.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No portfolios found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {portfolios.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {portfolios.current_page} of {portfolios.last_page}
                        </p>
                        <div className="flex gap-2">
                            {portfolios.links[0]?.url ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={portfolios.links[0].url}>&larr; Previous</Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    &larr; Previous
                                </Button>
                            )}
                            {portfolios.links[portfolios.links.length - 1]?.url ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={portfolios.links[portfolios.links.length - 1].url!}>Next &rarr;</Link>
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

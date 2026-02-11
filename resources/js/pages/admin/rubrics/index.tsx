import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface RubricCriteria {
    id: number;
    name: string;
    description: string | null;
    max_score: number;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    criteria: RubricCriteria[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rubric Criteria', href: '/admin/rubrics' },
];

function truncate(text: string | null, length: number = 60): string {
    if (!text) return '—';
    return text.length > length ? text.slice(0, length) + '…' : text;
}

export default function Index({ criteria }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;
    const [criteriaToDelete, setCriteriaToDelete] =
        useState<RubricCriteria | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const totalMaxScore = criteria.reduce((sum, c) => sum + c.max_score, 0);

    function handleToggleActive(item: RubricCriteria) {
        router.post(`/admin/rubrics/${item.id}/toggle-active`, {}, {
            preserveScroll: true,
        });
    }

    function handleDelete(item: RubricCriteria) {
        setCriteriaToDelete(item);
        setDeleteDialogOpen(true);
    }

    function handleConfirmDelete() {
        if (!criteriaToDelete) {
            return;
        }

        router.delete(`/admin/rubrics/${criteriaToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteDialogOpen(false);
                setCriteriaToDelete(null);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rubric Criteria" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Rubric Criteria"
                        description="Manage evaluation rubric criteria for portfolio assessments"
                    />
                    <Button asChild>
                        <Link href="/admin/rubrics/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Criteria
                        </Link>
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">
                                    Sort Order
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Max Score
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {criteria.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {item.sort_order}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {truncate(item.description)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.max_score}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                item.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {item.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/rubrics/${item.id}/edit`}
                                                >
                                                    <Pencil className="mr-1 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleToggleActive(item)
                                                }
                                            >
                                                {item.is_active ? (
                                                    <ToggleRight className="mr-1 h-4 w-4" />
                                                ) : (
                                                    <ToggleLeft className="mr-1 h-4 w-4" />
                                                )}
                                                {item.is_active
                                                    ? 'Deactivate'
                                                    : 'Activate'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    handleDelete(item)
                                                }
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {criteria.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No rubric criteria found. Create one to
                                        get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {criteria.length > 0 && (
                            <tfoot className="border-t bg-muted/50">
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-3 text-right font-medium"
                                    >
                                        Total Max Score
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {totalMaxScore}
                                    </td>
                                    <td colSpan={2} />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open: boolean) => {
                    setDeleteDialogOpen(open);
                    if (!open) {
                        setCriteriaToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete this criteria?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {criteriaToDelete
                                ? `"${criteriaToDelete.name}" will be permanently removed.`
                                : 'This criteria will be permanently removed.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete Criteria
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

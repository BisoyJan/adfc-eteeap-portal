import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

interface DocumentCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_required: boolean;
    sort_order: number;
    documents_count: number;
    created_at: string;
}

interface Props {
    categories: DocumentCategory[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Document Categories', href: '/admin/document-categories' },
];

function truncate(text: string | null, length: number = 80): string {
    if (!text) return '—';
    return text.length > length ? text.slice(0, length) + '…' : text;
}

export default function Index({ categories }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;
    const [categoryToDelete, setCategoryToDelete] =
        useState<DocumentCategory | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    function handleDelete(item: DocumentCategory) {
        setCategoryToDelete(item);
        setDeleteDialogOpen(true);
    }

    function handleConfirmDelete() {
        if (!categoryToDelete) return;
        router.delete(`/admin/document-categories/${categoryToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Document Categories" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Document Categories"
                        description="Manage portfolio document categories and requirements"
                    />
                    <Button asChild>
                        <Link href="/admin/document-categories/create">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Category
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

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">
                                    Order
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-center font-medium">
                                    Required
                                </th>
                                <th className="px-4 py-3 text-center font-medium">
                                    Documents
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No document categories yet. Create one
                                        to get started.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {category.sort_order}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {category.name}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {truncate(category.description)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {category.is_required ? (
                                                <Badge
                                                    variant="destructive"
                                                    className="text-[10px]"
                                                >
                                                    Required
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px]"
                                                >
                                                    Optional
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">
                                            {category.documents_count}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/document-categories/${category.id}/edit`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        handleDelete(category)
                                                    }
                                                    disabled={
                                                        category.documents_count >
                                                        0
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setCategoryToDelete(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete this category?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {categoryToDelete
                                ? `"${categoryToDelete.name}" will be permanently removed. This cannot be undone.`
                                : 'This category will be permanently removed.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete Category
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

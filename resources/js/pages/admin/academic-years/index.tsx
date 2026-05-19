import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import FlashMessages from '@/components/flash-messages';
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

interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    notes: string | null;
    subjects_count: number;
}

interface Props {
    academicYears: AcademicYear[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Academic Years', href: '/admin/academic-years' },
];

export default function Index({ academicYears }: Props) {
    const [toDelete, setToDelete] = useState<AcademicYear | null>(null);

    function handleSetActive(item: AcademicYear) {
        router.post(`/admin/academic-years/${item.id}/set-active`, {}, { preserveScroll: true });
    }

    function confirmDelete() {
        if (!toDelete) return;
        router.delete(`/admin/academic-years/${toDelete.id}`, {
            preserveScroll: true,
            onFinish: () => setToDelete(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Academic Years" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Academic Years" description="Manage academic years used by subjects and prospectuses" />
                    <Button asChild>
                        <Link href="/admin/academic-years/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Academic Year
                        </Link>
                    </Button>
                </div>

                <FlashMessages />

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Start</th>
                                <th className="px-4 py-3 text-left font-medium">End</th>
                                <th className="px-4 py-3 text-left font-medium">Subjects</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {academicYears.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.start_date}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.end_date}</td>
                                    <td className="px-4 py-3">{item.subjects_count}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {!item.is_active && (
                                                <Button variant="ghost" size="sm" onClick={() => handleSetActive(item)}>
                                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                                    Set Active
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/academic-years/${item.id}/edit`}>
                                                    <Pencil className="mr-1 h-4 w-4" /> Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setToDelete(item)}
                                                disabled={item.subjects_count > 0}
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" /> Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {academicYears.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No academic years yet. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete academic year?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove &ldquo;{toDelete?.name}&rdquo;. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

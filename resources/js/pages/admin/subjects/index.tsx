import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2, BookOpen, ClipboardList } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Subject {
    id: number;
    code: string;
    name: string;
    description: string | null;
    units: number;
    is_active: boolean;
    academic_year: { id: number; name: string } | null;
}

interface AcademicYear {
    id: number;
    name: string;
    is_active: boolean;
}

interface Props {
    subjects: Subject[];
    academicYears: AcademicYear[];
    filters: { academic_year_id: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Subjects', href: '/admin/subjects' },
];

export default function Index({ subjects, academicYears, filters }: Props) {
    const [toDelete, setToDelete] = useState<Subject | null>(null);

    function changeYear(value: string) {
        router.get('/admin/subjects', { academic_year_id: value }, { preserveState: true, replace: true });
    }

    function toggleActive(item: Subject) {
        router.post(`/admin/subjects/${item.id}/toggle-active`, {}, { preserveScroll: true });
    }

    function confirmDelete() {
        if (!toDelete) return;
        router.delete(`/admin/subjects/${toDelete.id}`, { preserveScroll: true, onFinish: () => setToDelete(null) });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subjects" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Subjects" description="Manage subjects/prospectus per academic year" />
                    <Button asChild>
                        <Link href="/admin/subjects/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Subject
                        </Link>
                    </Button>
                </div>

                <FlashMessages />

                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Academic Year:</span>
                    <Select value={String(filters.academic_year_id || '')} onValueChange={changeYear}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                            {academicYears.map((y) => (
                                <SelectItem key={y.id} value={String(y.id)}>
                                    {y.name} {y.is_active ? '(active)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Code</th>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Units</th>
                                <th className="px-4 py-3 text-left font-medium">Academic Year</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {subjects.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3 font-mono">{item.code}</td>
                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                    <td className="px-4 py-3">{item.units}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.academic_year?.name}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/subjects/${item.id}/modules`}>
                                                    <BookOpen className="mr-1 h-4 w-4" /> Modules
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/subjects/${item.id}/pre-assessment-questions`}>
                                                    <ClipboardList className="mr-1 h-4 w-4" /> Pre-Assessment
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/subjects/${item.id}/edit`}>
                                                    <Pencil className="mr-1 h-4 w-4" /> Edit
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => toggleActive(item)}>
                                                {item.is_active ? <ToggleRight className="mr-1 h-4 w-4" /> : <ToggleLeft className="mr-1 h-4 w-4" />}
                                                {item.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setToDelete(item)}
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" /> Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {subjects.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No subjects for this academic year yet.
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
                        <AlertDialogTitle>Delete subject?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove &ldquo;{toDelete?.code} – {toDelete?.name}&rdquo;.
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

import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Option { value: string; label: string }
interface AcademicYear { id: number; name: string }
interface Subject { id: number; code: string; name: string; units: number; academic_year: AcademicYear | null }
interface Evaluator { id: number; name: string; email: string }
interface PortfolioSubject {
    id: number;
    subject: Subject;
    evaluator: Evaluator | null;
    status: string;
    recommendation: string | null;
    notes: string | null;
}
interface Portfolio {
    id: number;
    title: string;
    user: { id: number; name: string; email: string };
    portfolio_subjects: PortfolioSubject[];
}

interface Props {
    portfolio: Portfolio;
    allSubjects: Subject[];
    evaluators: Evaluator[];
    statuses: Option[];
    recommendations: Option[];
}

export default function PortfolioSubjects({ portfolio, allSubjects, evaluators, statuses, recommendations }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Portfolios', href: '/admin/portfolios' },
        { title: portfolio.title, href: `/admin/portfolios/${portfolio.id}` },
        { title: 'Subjects', href: '#' },
    ];

    const createForm = useForm<{ subject_id: string; evaluator_id: string; notes: string }>({
        subject_id: '',
        evaluator_id: '',
        notes: '',
    });

    const [toDelete, setToDelete] = useState<PortfolioSubject | null>(null);

    function handleAdd(e: FormEvent) {
        e.preventDefault();
        createForm.post(`/admin/portfolios/${portfolio.id}/subjects`, {
            preserveScroll: true,
            onSuccess: () => createForm.reset(),
        });
    }

    function updateRow(row: PortfolioSubject, patch: Partial<PortfolioSubject>) {
        router.put(
            `/admin/portfolios/${portfolio.id}/subjects/${row.id}`,
            {
                evaluator_id: row.evaluator?.id ?? null,
                status: row.status,
                recommendation: row.recommendation,
                notes: row.notes,
                ...patch,
            },
            { preserveScroll: true },
        );
    }

    function confirmDelete() {
        if (!toDelete) return;
        router.delete(`/admin/portfolios/${portfolio.id}/subjects/${toDelete.id}`, {
            preserveScroll: true,
            onFinish: () => setToDelete(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Portfolio Subjects" />
            <div className="space-y-6 p-6">
                <Heading title="Subject Assignments" description={`Assign subjects to ${portfolio.user.name}'s portfolio and per-subject evaluators.`} />
                <FlashMessages />

                <Card>
                    <CardHeader><CardTitle>Add Subject</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Select value={createForm.data.subject_id} onValueChange={(v) => createForm.setData('subject_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                    <SelectContent>
                                        {allSubjects.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.academic_year?.name} — {s.code} {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.subject_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Evaluator (optional)</Label>
                                <Select value={createForm.data.evaluator_id} onValueChange={(v) => createForm.setData('evaluator_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                    <SelectContent>
                                        {evaluators.map((e) => (
                                            <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.evaluator_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Input value={createForm.data.notes} onChange={(e) => createForm.setData('notes', e.target.value)} placeholder="Optional" />
                                <InputError message={createForm.errors.notes} />
                            </div>
                            <div className="md:col-span-3">
                                <Button type="submit" disabled={createForm.processing || !createForm.data.subject_id}>
                                    <Plus className="mr-2 h-4 w-4" /> Assign Subject
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Assigned Subjects ({portfolio.portfolio_subjects.length})</CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-2 py-2 text-left">Subject</th>
                                    <th className="px-2 py-2 text-left">Evaluator</th>
                                    <th className="px-2 py-2 text-left">Status</th>
                                    <th className="px-2 py-2 text-left">Recommendation</th>
                                    <th className="px-2 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio.portfolio_subjects.map((row) => (
                                    <tr key={row.id} className="border-b last:border-0">
                                        <td className="px-2 py-3">
                                            <div className="font-medium">{row.subject.code} {row.subject.name}</div>
                                            <div className="text-xs text-muted-foreground">{row.subject.academic_year?.name} • {row.subject.units} units</div>
                                        </td>
                                        <td className="px-2 py-3">
                                            <Select value={row.evaluator ? String(row.evaluator.id) : ''} onValueChange={(v) => updateRow(row, { evaluator: v ? evaluators.find((e) => e.id === Number(v)) ?? null : null })}>
                                                <SelectTrigger className="w-52"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                                <SelectContent>
                                                    {evaluators.map((e) => (
                                                        <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-2 py-3">
                                            <Select value={row.status} onValueChange={(v) => updateRow(row, { status: v })}>
                                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {statuses.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-2 py-3">
                                            <Select value={row.recommendation ?? ''} onValueChange={(v) => updateRow(row, { recommendation: v || null })}>
                                                <SelectTrigger className="w-52"><SelectValue placeholder="Not set" /></SelectTrigger>
                                                <SelectContent>
                                                    {recommendations.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                            {row.recommendation && <Badge className="mt-1" variant="outline">{recommendations.find((r) => r.value === row.recommendation)?.label}</Badge>}
                                        </td>
                                        <td className="px-2 py-3 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setToDelete(row)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {portfolio.portfolio_subjects.length === 0 && (
                                    <tr><td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">No subjects assigned yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove subject?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove "{toDelete?.subject.code} {toDelete?.subject.name}" and all related pre-assessment attempts and evaluations.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={confirmDelete}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

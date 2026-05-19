import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Subject { id: number; code: string; name: string; academic_year: { id: number; name: string } | null }
interface Question { id: number; question: string; sort_order: number; is_active: boolean }
interface Props { subject: Subject; questions: Question[] }

export default function PreAssessmentQuestions({ subject, questions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Subjects', href: '/admin/subjects' },
        { title: `${subject.code} ${subject.name}`, href: '#' },
        { title: 'Pre-Assessment Questions', href: '#' },
    ];

    const form = useForm<{ question: string; sort_order: number; is_active: boolean }>({ question: '', sort_order: 0, is_active: true });
    const [editing, setEditing] = useState<Question | null>(null);
    const editForm = useForm<{ question: string; sort_order: number; is_active: boolean }>({ question: '', sort_order: 0, is_active: true });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post(`/admin/subjects/${subject.id}/pre-assessment-questions`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    function startEdit(q: Question) {
        setEditing(q);
        editForm.setData({ question: q.question, sort_order: q.sort_order, is_active: q.is_active });
    }

    function saveEdit(e: FormEvent) {
        e.preventDefault();
        if (!editing) return;
        editForm.put(`/admin/subjects/${subject.id}/pre-assessment-questions/${editing.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    }

    function destroy(id: number) {
        if (!confirm('Delete this question?')) return;
        router.delete(`/admin/subjects/${subject.id}/pre-assessment-questions/${id}`, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pre-Assessment Questions" />
            <div className="space-y-6 p-6">
                <Heading title={`Pre-Assessment — ${subject.code} ${subject.name}`} description="Manage questions for the per-subject pre-assessment." />
                <FlashMessages />

                <Card>
                    <CardHeader><CardTitle>{editing ? 'Edit Question' : 'Add Question'}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={editing ? saveEdit : submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Question</Label>
                                <textarea aria-label="Question text" rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={editing ? editForm.data.question : form.data.question}
                                    onChange={(e) => editing ? editForm.setData('question', e.target.value) : form.setData('question', e.target.value)}
                                    required
                                />
                                <InputError message={editing ? editForm.errors.question : form.errors.question} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Sort Order</Label>
                                    <Input type="number" min={0}
                                        value={editing ? editForm.data.sort_order : form.data.sort_order}
                                        onChange={(e) => editing ? editForm.setData('sort_order', Number(e.target.value)) : form.setData('sort_order', Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-7">
                                    <Checkbox
                                        checked={editing ? editForm.data.is_active : form.data.is_active}
                                        onCheckedChange={(v) => editing ? editForm.setData('is_active', !!v) : form.setData('is_active', !!v)}
                                    />
                                    <Label className="cursor-pointer">Active</Label>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={(editing ? editForm.processing : form.processing)}>
                                    {editing ? <><Pencil className="mr-2 h-4 w-4" /> Save Changes</> : <><Plus className="mr-2 h-4 w-4" /> Add Question</>}
                                </Button>
                                {editing && (<Button variant="outline" type="button" onClick={() => setEditing(null)}>Cancel</Button>)}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Questions ({questions.length})</CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-2 py-2 text-left w-16">#</th>
                                    <th className="px-2 py-2 text-left">Question</th>
                                    <th className="px-2 py-2 text-left w-24">Status</th>
                                    <th className="px-2 py-2 text-right w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((q) => (
                                    <tr key={q.id} className="border-b last:border-0">
                                        <td className="px-2 py-3">{q.sort_order}</td>
                                        <td className="px-2 py-3">{q.question}</td>
                                        <td className="px-2 py-3">
                                            {q.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                                        </td>
                                        <td className="px-2 py-3 text-right space-x-1">
                                            <Button variant="ghost" size="sm" onClick={() => startEdit(q)}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => destroy(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </td>
                                    </tr>
                                ))}
                                {questions.length === 0 && (
                                    <tr><td colSpan={4} className="px-2 py-6 text-center text-muted-foreground">No questions yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

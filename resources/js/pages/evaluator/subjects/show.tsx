import { Head, useForm } from '@inertiajs/react';
import { Download, Save, Send, Upload } from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Option { value: string; label: string }
interface Criteria { id: number; name: string; description: string | null; max_score: number; category: string }
interface SubjEvalScore { id: number; rubric_criteria_id: number; score: string; comments: string | null }
interface SubjEval {
    id: number;
    category: string;
    attempt_number: number;
    status: string;
    score: string;
    max_score: string;
    comments: string | null;
    conducted_at: string | null;
    submitted_at: string | null;
    scores: SubjEvalScore[];
    evaluator: { id: number; name: string } | null;
}
interface Module {
    id: number;
    title: string;
    description: string | null;
    file_name: string;
    file_size: number;
    uploader: { id: number; name: string } | null;
}
interface Question { id: number; question: string; sort_order: number }
interface Answer { id: number; question_id: number; answer: string | null; question?: Question }
interface Attempt {
    id: number;
    attempt_number: number;
    narrative: string | null;
    submitted_at: string | null;
    score: string | null;
    max_score: string | null;
    graded_at: string | null;
    grader_comments: string | null;
    grader: { id: number; name: string } | null;
    answers: Answer[];
}

interface Props {
    portfolioSubject: {
        id: number;
        status: string;
        recommendation: string | null;
        notes: string | null;
        modules: Module[];
        portfolio: {
            id: number;
            title: string;
            user: { id: number; name: string; email: string };
        };
        subject: {
            id: number; code: string; name: string; units: number; description: string | null;
            academic_year: { name: string } | null;
            pre_assessment_questions: Question[];
        };
        pre_assessment_attempts: Attempt[];
        subject_evaluations: SubjEval[];
    };
    rubricByCategory: Record<string, Criteria[]>;
    categories: Option[];
    recommendations: Option[];
    statuses: Option[];
}

const SUBJECT_CATEGORY_KEYS = ['pre_assessment', 'written_exam'] as const;

function fmtSize(b: number) { return b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB` }

export default function EvaluatorSubjectShow({ portfolioSubject, rubricByCategory, categories, recommendations, statuses }: Props) {
    const ps = portfolioSubject;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Subject Assignments', href: '/evaluator/subjects' },
        { title: `${ps.subject.code} ${ps.subject.name}`, href: '#' },
    ];

    const assignmentForm = useForm<{ status: string; recommendation: string; notes: string }>({
        status: ps.status,
        recommendation: ps.recommendation ?? '',
        notes: ps.notes ?? '',
    });
    const fileRef = useRef<HTMLInputElement>(null);
    const moduleForm = useForm<{ title: string; description: string; file: File | null }>({
        title: '',
        description: '',
        file: null,
    });

    function saveAssignment(e: FormEvent) {
        e.preventDefault();
        assignmentForm.put(`/evaluator/subjects/${ps.id}`, { preserveScroll: true });
    }

    function uploadModule(e: FormEvent) {
        e.preventDefault();
        moduleForm.post(`/evaluator/subjects/${ps.id}/modules`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                moduleForm.reset();
                if (fileRef.current) {
                    fileRef.current.value = '';
                }
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${ps.subject.code} ${ps.subject.name}`} />
            <div className="space-y-6 p-6">
                <Heading title={`${ps.subject.code} — ${ps.subject.name}`} description={`Applicant: ${ps.portfolio.user.name} • ${ps.subject.academic_year?.name ?? ''}`} />
                <FlashMessages />

                <Card>
                    <CardHeader><CardTitle>Modules ({ps.modules.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={uploadModule} className="grid gap-4 rounded-md border p-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="module-title">Title</Label>
                                <Input
                                    id="module-title"
                                    value={moduleForm.data.title}
                                    onChange={(e) => moduleForm.setData('title', e.target.value)}
                                    required
                                />
                                <InputError message={moduleForm.errors.title} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="module-file">File (max 50 MB)</Label>
                                <Input
                                    id="module-file"
                                    ref={fileRef}
                                    type="file"
                                    onChange={(e) => moduleForm.setData('file', e.target.files?.[0] ?? null)}
                                    required
                                />
                                <InputError message={moduleForm.errors.file} />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <Label htmlFor="module-description">Description (optional)</Label>
                                <textarea
                                    id="module-description"
                                    aria-label="Module description"
                                    rows={2}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={moduleForm.data.description}
                                    onChange={(e) => moduleForm.setData('description', e.target.value)}
                                />
                                <InputError message={moduleForm.errors.description} />
                            </div>
                            <div className="md:col-span-2">
                                <Button type="submit" disabled={moduleForm.processing}>
                                    <Upload className="mr-2 h-4 w-4" /> Upload Module
                                </Button>
                            </div>
                        </form>

                        {ps.modules.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No modules.</p>
                        ) : (
                            <ul className="divide-y">
                                {ps.modules.map((m) => (
                                    <li key={m.id} className="flex items-center justify-between py-2">
                                        <div>
                                            <div className="font-medium">{m.title}</div>
                                            {m.description && (
                                                <div className="text-xs text-muted-foreground">{m.description}</div>
                                            )}
                                            <div className="text-xs text-muted-foreground">{m.file_name} • {fmtSize(m.file_size)}</div>
                                            <div className="text-xs text-muted-foreground">Uploaded by: {m.uploader?.name ?? 'Unknown'}</div>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <a href={`/evaluator/subjects/modules/${m.id}/download`}><Download className="mr-2 h-4 w-4" /> Download</a>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Pre-Assessment Attempts</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {ps.pre_assessment_attempts.length === 0 && (
                            <p className="text-sm text-muted-foreground">No attempts submitted yet.</p>
                        )}
                        {ps.pre_assessment_attempts.map((a) => (
                            <PreAssessmentGradeBlock key={a.id} portfolioSubjectId={ps.id} attempt={a} questions={ps.subject.pre_assessment_questions} />
                        ))}
                    </CardContent>
                </Card>

                {SUBJECT_CATEGORY_KEYS.map((cat) => (
                    <CategoryScoringBlock
                        key={cat}
                        endpoint={`/evaluator/subjects/${ps.id}/save`}
                        category={cat}
                        label={categories.find((c) => c.value === cat)?.label ?? cat}
                        criteria={rubricByCategory[cat] ?? []}
                        evaluations={ps.subject_evaluations.filter((e) => e.category === cat)}
                    />
                ))}

                <Card>
                    <CardHeader><CardTitle>Assignment Status &amp; Recommendation</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={saveAssignment} className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={assignmentForm.data.status} onValueChange={(v) => assignmentForm.setData('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Recommendation</Label>
                                <Select value={assignmentForm.data.recommendation} onValueChange={(v) => assignmentForm.setData('recommendation', v)}>
                                    <SelectTrigger><SelectValue placeholder="Not set" /></SelectTrigger>
                                    <SelectContent>
                                        {recommendations.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Notes</Label>
                                <textarea aria-label="Assignment notes" rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={assignmentForm.data.notes} onChange={(e) => assignmentForm.setData('notes', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <Button type="submit" disabled={assignmentForm.processing}><Save className="mr-2 h-4 w-4" /> Save</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function PreAssessmentGradeBlock({ portfolioSubjectId, attempt, questions }: { portfolioSubjectId: number; attempt: Attempt; questions: Question[] }) {
    const maxDefault = Number(attempt.max_score ?? questions.length * 10);
    const form = useForm<{ score: string; max_score: string; grader_comments: string }>({
        score: attempt.score ?? '',
        max_score: attempt.max_score ?? String(maxDefault),
        grader_comments: attempt.grader_comments ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post(`/evaluator/subjects/${portfolioSubjectId}/pre-assessment/${attempt.id}/grade`, { preserveScroll: true });
    }

    const answersById = useMemo(() => {
        const m: Record<number, string | null> = {};
        attempt.answers.forEach((a) => { m[a.question_id] = a.answer });
        return m;
    }, [attempt.answers]);

    return (
        <div className="rounded-md border p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-medium">Attempt #{attempt.attempt_number}</div>
                    <p className="text-xs text-muted-foreground">
                        {attempt.submitted_at ? `Submitted ${new Date(attempt.submitted_at).toLocaleString()}` : 'Draft (not yet submitted by applicant)'}
                        {attempt.graded_at && ` • Graded ${new Date(attempt.graded_at).toLocaleString()}`}
                    </p>
                </div>
                {attempt.score !== null && <Badge>{attempt.score} / {attempt.max_score}</Badge>}
            </div>

            {questions.length > 0 && (
                <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">View questions &amp; answers</summary>
                    <ul className="mt-2 space-y-2">
                        {questions.map((q, i) => (
                            <li key={q.id} className="rounded bg-muted/40 p-2">
                                <div className="font-medium">{i + 1}. {q.question}</div>
                                <div className="whitespace-pre-wrap">{answersById[q.id] || <span className="text-muted-foreground">(no answer)</span>}</div>
                            </li>
                        ))}
                    </ul>
                </details>
            )}
            {attempt.narrative && (
                <div className="text-sm">
                    <Label className="text-xs">Narrative</Label>
                    <div className="whitespace-pre-wrap rounded bg-muted/40 p-2">{attempt.narrative}</div>
                </div>
            )}

            {attempt.submitted_at && (
                <form onSubmit={submit} className="grid gap-3 md:grid-cols-3 pt-2 border-t">
                    <div className="space-y-1">
                        <Label className="text-xs">Score</Label>
                        <Input type="number" min={0} step="0.01" value={form.data.score} onChange={(e) => form.setData('score', e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Max Score</Label>
                        <Input type="number" min={0} step="0.01" value={form.data.max_score} onChange={(e) => form.setData('max_score', e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Comments</Label>
                        <Input value={form.data.grader_comments} onChange={(e) => form.setData('grader_comments', e.target.value)} />
                    </div>
                    <div className="md:col-span-3">
                        <Button type="submit" size="sm" disabled={form.processing}>Save Grade</Button>
                    </div>
                </form>
            )}
        </div>
    );
}

function CategoryScoringBlock({ endpoint, category, label, criteria, evaluations }: {
    endpoint: string;
    category: string;
    label: string;
    criteria: Criteria[];
    evaluations: SubjEval[];
}) {
    type ScorePayload = {
        rubric_criteria_id: number;
        score: number;
        comments: string;
    };

    const latest = evaluations.length > 0 ? evaluations.reduce((a, b) => a.attempt_number > b.attempt_number ? a : b) : null;
    const isSubmitted = latest?.status === 'submitted';
    const nextAttempt = isSubmitted ? (latest?.attempt_number ?? 0) + 1 : (latest?.attempt_number ?? 1);

    const [newAttemptStarted, setNewAttemptStarted] = useState(false);
    const editingEnabled = !isSubmitted || newAttemptStarted;

    const initialScores: Record<number, { score: string; comments: string }> = {};
    criteria.forEach((c) => {
        const existing = !isSubmitted ? latest?.scores.find((s) => s.rubric_criteria_id === c.id) : undefined;
        initialScores[c.id] = { score: existing?.score ?? '', comments: existing?.comments ?? '' };
    });

    const [scoreData, setScoreData] = useState(initialScores);
    const form = useForm<{ category: string; attempt_number: number; comments: string; conducted_at: string; submit: boolean; scores: ScorePayload[] }>({
        category,
        attempt_number: nextAttempt,
        comments: !isSubmitted ? (latest?.comments ?? '') : '',
        conducted_at: !isSubmitted ? (latest?.conducted_at ?? '') : '',
        submit: false,
        scores: [],
    });

    function build(submit: boolean) {
        form.transform((data) => ({
            ...data,
            submit,
            scores: criteria.map((c) => ({
                rubric_criteria_id: c.id,
                score: Number(scoreData[c.id]?.score || 0),
                comments: scoreData[c.id]?.comments ?? '',
            })),
        }));
    }

    function save(e: FormEvent) {
        e.preventDefault();
        build(false);
        form.post(endpoint, { preserveScroll: true });
    }

    function submit() {
        if (!confirm('Submit this evaluation? You can start a new attempt later but cannot edit this one.')) return;
        build(true);
        form.post(endpoint, { preserveScroll: true });
    }

    function startNewAttempt() {
        if (!confirm('Start a new attempt? This will create attempt #' + nextAttempt)) return;
        const blank: Record<number, { score: string; comments: string }> = {};
        criteria.forEach((c) => { blank[c.id] = { score: '', comments: '' } });
        setScoreData(blank);
        form.setData({ category, attempt_number: nextAttempt, comments: '', conducted_at: '', submit: false, scores: [] });
        setNewAttemptStarted(true);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{label}</span>
                    <div className="flex items-center gap-2">
                        {evaluations.map((e) => (
                            <Badge key={e.id} variant={e.status === 'submitted' ? 'default' : 'outline'}>
                                #{e.attempt_number}: {e.score}/{e.max_score}
                            </Badge>
                        ))}
                        {isSubmitted && !newAttemptStarted && (<Button size="sm" variant="outline" onClick={startNewAttempt}>Retake</Button>)}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {criteria.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active rubric criteria for this category. Define rubrics in the admin panel.</p>
                ) : (
                    <form onSubmit={save} className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-2 py-2 text-left">Criteria</th>
                                        <th className="px-2 py-2 text-left w-32">Score (max)</th>
                                        <th className="px-2 py-2 text-left">Comments</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {criteria.map((c) => (
                                        <tr key={c.id} className="border-b last:border-0">
                                            <td className="px-2 py-2 align-top">
                                                <div className="font-medium">{c.name}</div>
                                                {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                                            </td>
                                            <td className="px-2 py-2 align-top">
                                                <Input
                                                    type="number" min={0} max={c.max_score} step="0.01"
                                                    value={scoreData[c.id]?.score ?? ''}
                                                    onChange={(e) => setScoreData((p) => ({ ...p, [c.id]: { ...p[c.id], score: e.target.value } }))}
                                                    disabled={!editingEnabled}
                                                    placeholder={`/ ${c.max_score}`}
                                                />
                                            </td>
                                            <td className="px-2 py-2 align-top">
                                                <Input
                                                    value={scoreData[c.id]?.comments ?? ''}
                                                    onChange={(e) => setScoreData((p) => ({ ...p, [c.id]: { ...p[c.id], comments: e.target.value } }))}
                                                    disabled={!editingEnabled}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Attempt #</Label>
                                <Input type="number" min={1} value={form.data.attempt_number} onChange={(e) => form.setData('attempt_number', Number(e.target.value))} disabled={!editingEnabled} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Conducted At</Label>
                                <Input type="datetime-local" value={form.data.conducted_at?.substring(0, 16) ?? ''} onChange={(e) => form.setData('conducted_at', e.target.value)} disabled={!editingEnabled} />
                            </div>
                            <div className="space-y-1 md:col-span-1">
                                <Label className="text-xs">Overall Comments</Label>
                                <Input value={form.data.comments} onChange={(e) => form.setData('comments', e.target.value)} disabled={!editingEnabled} />
                            </div>
                        </div>
                        {editingEnabled && (
                            <div className="flex gap-2">
                                <Button type="submit" variant="outline" disabled={form.processing}><Save className="mr-2 h-4 w-4" /> Save Draft</Button>
                                <Button type="button" onClick={submit} disabled={form.processing}><Send className="mr-2 h-4 w-4" /> Submit</Button>
                            </div>
                        )}
                    </form>
                )}
            </CardContent>
        </Card>
    );
}

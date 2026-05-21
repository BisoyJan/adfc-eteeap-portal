import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Send } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Criteria {
    id: number;
    name: string;
    description: string | null;
    max_score: number;
}

interface EvaluationScore {
    rubric_criteria_id: number;
    score: number;
    comments: string | null;
}

interface Evaluation {
    id: number;
    status: string;
    attempt_number: number;
    conducted_at: string | null;
    submitted_at: string | null;
    comments: string | null;
    score: string | null;
    max_score: string | null;
    scores: EvaluationScore[];
}

interface Portfolio {
    id: number;
    title: string;
    user: { id: number; name: string; email: string };
}

interface Assignment {
    id: number;
    portfolio: Portfolio;
}

interface Props {
    assignment: Assignment;
    criteria: Criteria[];
    evaluation: Evaluation | null;
    pastEvaluations: Evaluation[];
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function ScoreTable({
    criteria,
    evaluation,
    computeMax,
}: {
    criteria: Criteria[];
    evaluation: Evaluation;
    computeMax: () => number;
}) {
    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Criteria
                            </th>
                            <th className="w-36 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Score
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Comments
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {criteria.map((c) => {
                            const s = evaluation.scores.find(
                                (sc) => sc.rubric_criteria_id === c.id,
                            );
                            return (
                                <tr key={c.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{c.name}</p>
                                        {c.description && (
                                            <p className="text-xs text-muted-foreground">
                                                {c.description}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-mono">
                                        {s?.score ?? 0} / {c.max_score}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {s?.comments || '—'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-sm font-semibold">Total Score</span>
                <span className="font-mono text-sm font-semibold">
                    {evaluation.score ?? 0} / {evaluation.max_score ?? computeMax()}
                </span>
            </div>

            {evaluation.comments && (
                <div className="space-y-1">
                    <p className="text-sm font-medium">Overall Comments</p>
                    <p className="text-sm text-muted-foreground">{evaluation.comments}</p>
                </div>
            )}
        </div>
    );
}

export default function Worksite({ assignment, criteria, evaluation, pastEvaluations }: Props) {
    const portfolio = assignment.portfolio;
    const isSubmitted = evaluation?.status === 'submitted';
    const [newAttemptMode, setNewAttemptMode] = useState(false);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [newSubmitDialogOpen, setNewSubmitDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assigned Reviews', href: '/evaluator/portfolios' },
        { title: portfolio.title, href: `/evaluator/portfolios/${assignment.id}` },
        { title: 'Worksite Visit', href: `/evaluator/portfolios/${assignment.id}/worksite` },
    ];

    // Form for the current draft evaluation (or first attempt when none exists)
    const form = useForm({
        attempt_number: evaluation?.attempt_number ?? 1,
        conducted_at: evaluation?.conducted_at
            ? new Date(evaluation.conducted_at).toISOString().slice(0, 16)
            : '',
        comments: evaluation?.comments ?? '',
        scores: criteria.map((c) => {
            const existing = evaluation?.scores.find((s) => s.rubric_criteria_id === c.id);
            return {
                rubric_criteria_id: c.id,
                score: existing?.score ?? 0,
                comments: existing?.comments ?? '',
            };
        }),
    });

    // Form for a new attempt (blank, next attempt number)
    const nextAttemptNumber = (evaluation?.attempt_number ?? 0) + 1;
    const newAttemptForm = useForm({
        attempt_number: nextAttemptNumber,
        conducted_at: '',
        comments: '',
        scores: criteria.map((c) => ({
            rubric_criteria_id: c.id,
            score: 0,
            comments: '',
        })),
    });

    function updateScore(
        formInstance: typeof form,
        index: number,
        field: 'score' | 'comments',
        value: number | string,
    ) {
        const updated = [...formInstance.data.scores];
        updated[index] = { ...updated[index], [field]: value };
        formInstance.setData('scores', updated);
    }

    function computeTotal(formInstance: typeof form): number {
        return formInstance.data.scores.reduce((sum, s) => sum + Number(s.score), 0);
    }

    function computeMax(): number {
        return criteria.reduce((sum, c) => sum + c.max_score, 0);
    }

    // Current draft form handlers
    function handleSaveDraft(e: FormEvent) {
        e.preventDefault();
        form.post(`/evaluator/portfolios/${assignment.id}/worksite`, { preserveScroll: true });
    }
    function handleSubmitClick(e: FormEvent) {
        e.preventDefault();
        setSubmitDialogOpen(true);
    }
    function handleConfirmSubmit() {
        form.post(`/evaluator/portfolios/${assignment.id}/worksite/submit`, {
            preserveScroll: true,
            onFinish: () => setSubmitDialogOpen(false),
        });
    }

    // New attempt form handlers
    function handleNewSaveDraft(e: FormEvent) {
        e.preventDefault();
        newAttemptForm.post(`/evaluator/portfolios/${assignment.id}/worksite`, {
            preserveScroll: true,
            onSuccess: () => setNewAttemptMode(false),
        });
    }
    function handleNewSubmitClick(e: FormEvent) {
        e.preventDefault();
        setNewSubmitDialogOpen(true);
    }
    function handleConfirmNewSubmit() {
        newAttemptForm.post(`/evaluator/portfolios/${assignment.id}/worksite/submit`, {
            preserveScroll: true,
            onFinish: () => setNewSubmitDialogOpen(false),
            onSuccess: () => setNewAttemptMode(false),
        });
    }

    const allPastAttempts = isSubmitted && evaluation
        ? [evaluation, ...pastEvaluations]
        : pastEvaluations;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Worksite Visit – ${portfolio.title}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/evaluator/portfolios/${assignment.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title="Worksite Visit Assessment"
                        description={`${portfolio.user.name} · ${portfolio.title}`}
                    />
                </div>

                {/* ── New Attempt Form ── */}
                {newAttemptMode && (
                    <Card className="border-blue-200 bg-blue-50/40 dark:border-blue-800 dark:bg-blue-950/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>New Attempt #{nextAttemptNumber}</CardTitle>
                                    <CardDescription>
                                        Recording a new worksite visit evaluation attempt.
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setNewAttemptMode(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6" onSubmit={handleNewSubmitClick}>
                                <EvalForm
                                    criteria={criteria}
                                    formInstance={newAttemptForm}
                                    updateScore={(i, f, v) => updateScore(newAttemptForm, i, f, v)}
                                    computeTotal={() => computeTotal(newAttemptForm)}
                                    computeMax={computeMax}
                                    processing={newAttemptForm.processing}
                                    onSaveDraft={handleNewSaveDraft}
                                />
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* ── Current Evaluation (latest attempt) ── */}
                {!newAttemptMode && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>
                                        Worksite Visit
                                        {evaluation && (
                                            <Badge variant="outline" className="ml-2 text-xs">
                                                Attempt #{evaluation.attempt_number}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    {isSubmitted && evaluation?.submitted_at && (
                                        <CardDescription>
                                            Submitted {formatDate(evaluation.submitted_at)}
                                            {evaluation.conducted_at &&
                                                ` · Conducted ${formatDate(evaluation.conducted_at)}`}
                                        </CardDescription>
                                    )}
                                </div>
                                {isSubmitted && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setNewAttemptMode(true)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Attempt
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isSubmitted && evaluation ? (
                                <ScoreTable
                                    criteria={criteria}
                                    evaluation={evaluation}
                                    computeMax={computeMax}
                                />
                            ) : (
                                <form className="space-y-6" onSubmit={handleSubmitClick}>
                                    <EvalForm
                                        criteria={criteria}
                                        formInstance={form}
                                        updateScore={(i, f, v) => updateScore(form, i, f, v)}
                                        computeTotal={() => computeTotal(form)}
                                        computeMax={computeMax}
                                        processing={form.processing}
                                        onSaveDraft={handleSaveDraft}
                                    />
                                </form>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── Attempt History ── */}
                {allPastAttempts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Attempt History</CardTitle>
                            <CardDescription>
                                All submitted worksite visit evaluations for this applicant.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {allPastAttempts.map((attempt, idx) => (
                                <div key={attempt.id}>
                                    {idx > 0 && <Separator className="my-4" />}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                Attempt #{attempt.attempt_number}
                                            </span>
                                            <Badge
                                                variant={attempt.status === 'submitted' ? 'default' : 'secondary'}
                                                className={
                                                    attempt.status === 'submitted'
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-100/80'
                                                        : ''
                                                }
                                            >
                                                {attempt.status === 'submitted' ? 'Submitted' : 'Draft'}
                                            </Badge>
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground">
                                            {attempt.submitted_at && (
                                                <p>Submitted: {formatDate(attempt.submitted_at)}</p>
                                            )}
                                            {attempt.conducted_at && (
                                                <p>Conducted: {formatDate(attempt.conducted_at)}</p>
                                            )}
                                        </div>
                                    </div>
                                    <ScoreTable
                                        criteria={criteria}
                                        evaluation={attempt}
                                        computeMax={computeMax}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Submit dialogs */}
            <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit worksite evaluation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone once submitted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSubmit}>Submit</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={newSubmitDialogOpen} onOpenChange={setNewSubmitDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Attempt #{nextAttemptNumber}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will create a new submitted worksite evaluation attempt.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmNewSubmit}>Submit</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

// ── Shared editable form body ──────────────────────────────────────────────
function EvalForm({
    criteria,
    formInstance,
    updateScore,
    computeTotal,
    computeMax,
    processing,
    onSaveDraft,
}: {
    criteria: Criteria[];
    formInstance: ReturnType<typeof useForm<{
        attempt_number: number;
        conducted_at: string;
        comments: string;
        scores: { rubric_criteria_id: number; score: number; comments: string }[];
    }>>;
    updateScore: (index: number, field: 'score' | 'comments', value: number | string) => void;
    computeTotal: () => number;
    computeMax: () => number;
    processing: boolean;
    onSaveDraft: (e: FormEvent) => void;
}) {
    return (
        <>
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Criteria
                            </th>
                            <th className="w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Score
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Comments
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {criteria.map((c, index) => (
                            <tr key={c.id} className="hover:bg-muted/30">
                                <td className="px-4 py-3">
                                    <p className="font-medium">{c.name}</p>
                                    {c.description && (
                                        <p className="text-xs text-muted-foreground">
                                            {c.description}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={c.max_score}
                                            value={formInstance.data.scores[index].score}
                                            onChange={(e) =>
                                                updateScore(index, 'score', Number(e.target.value))
                                            }
                                            className="w-20"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            / {c.max_score}
                                        </span>
                                    </div>
                                    <InputError
                                        message={
                                            formInstance.errors[
                                            `scores.${index}.score` as keyof typeof formInstance.errors
                                            ]
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <Input
                                        placeholder="Optional..."
                                        value={formInstance.data.scores[index].comments}
                                        onChange={(e) =>
                                            updateScore(index, 'comments', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={
                                            formInstance.errors[
                                            `scores.${index}.comments` as keyof typeof formInstance.errors
                                            ]
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-sm font-medium">Current Total</span>
                <span className="font-mono text-sm font-semibold">
                    {computeTotal()} / {computeMax()}
                </span>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor={`attempt_number_${formInstance.data.attempt_number}`}>
                        Attempt #
                    </Label>
                    <Input
                        id={`attempt_number_${formInstance.data.attempt_number}`}
                        type="number"
                        min={1}
                        value={formInstance.data.attempt_number}
                        onChange={(e) =>
                            formInstance.setData('attempt_number', Number(e.target.value))
                        }
                    />
                    <InputError message={formInstance.errors.attempt_number} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor={`conducted_at_${formInstance.data.attempt_number}`}>
                        Conducted At
                    </Label>
                    <Input
                        id={`conducted_at_${formInstance.data.attempt_number}`}
                        type="datetime-local"
                        value={formInstance.data.conducted_at}
                        onChange={(e) => formInstance.setData('conducted_at', e.target.value)}
                    />
                    <InputError message={formInstance.errors.conducted_at} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`comments_${formInstance.data.attempt_number}`}>
                        Overall Comments
                    </Label>
                    <textarea
                        id={`comments_${formInstance.data.attempt_number}`}
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Overall comments about this worksite visit..."
                        value={formInstance.data.comments}
                        onChange={(e) => formInstance.setData('comments', e.target.value)}
                    />
                    <InputError message={formInstance.errors.comments} />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    disabled={processing}
                    onClick={onSaveDraft}
                >
                    <Save className="mr-2 h-4 w-4" />
                    {processing ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button type="submit" disabled={processing}>
                    <Send className="mr-2 h-4 w-4" />
                    {processing ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
        </>
    );
}

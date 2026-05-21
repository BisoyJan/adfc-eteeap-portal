import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Send } from 'lucide-react';
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
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Assignment {
    id: number;
    portfolio: Portfolio;
}

interface Props {
    assignment: Assignment;
    criteria: Criteria[];
    evaluation: Evaluation | null;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function Worksite({ assignment, criteria, evaluation }: Props) {
    const portfolio = assignment.portfolio;
    const isSubmitted = evaluation?.status === 'submitted';
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assigned Reviews', href: '/evaluator/portfolios' },
        { title: portfolio.title, href: `/evaluator/portfolios/${assignment.id}` },
        { title: 'Worksite Visit', href: `/evaluator/portfolios/${assignment.id}/worksite` },
    ];

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

    function updateScore(index: number, field: 'score' | 'comments', value: number | string) {
        const updated = [...form.data.scores];
        updated[index] = { ...updated[index], [field]: value };
        form.setData('scores', updated);
    }

    function computeTotal(): number {
        return form.data.scores.reduce((sum, s) => sum + Number(s.score), 0);
    }

    function computeMax(): number {
        return criteria.reduce((sum, c) => sum + c.max_score, 0);
    }

    function handleSaveDraft(e: FormEvent) {
        e.preventDefault();
        form.post(`/evaluator/portfolios/${assignment.id}/worksite`, {
            preserveScroll: true,
        });
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

    const submittedTotal = isSubmitted && evaluation
        ? criteria.reduce((sum, c) => {
            const s = evaluation.scores.find((sc) => sc.rubric_criteria_id === c.id);
            return sum + Number(s?.score ?? 0);
        }, 0)
        : 0;

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

                <Card>
                    <CardHeader>
                        <CardTitle>Worksite Visit</CardTitle>
                        {isSubmitted && evaluation?.submitted_at && (
                            <CardDescription>
                                Submitted {formatDate(evaluation.submitted_at)}
                                {evaluation.conducted_at &&
                                    ` · Conducted ${formatDate(evaluation.conducted_at)}`}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isSubmitted ? (
                            /* ── Read-only view ── */
                            <div className="space-y-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="pb-2 text-left font-medium">Criteria</th>
                                            <th className="w-36 pb-2 text-left font-medium">
                                                Score (max)
                                            </th>
                                            <th className="pb-2 text-left font-medium">Comments</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {criteria.map((c) => {
                                            const s = evaluation!.scores.find(
                                                (sc) => sc.rubric_criteria_id === c.id,
                                            );
                                            return (
                                                <tr key={c.id} className="border-b last:border-0">
                                                    <td className="py-3 pr-4">
                                                        <p className="font-medium">{c.name}</p>
                                                        {c.description && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {c.description}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="py-3 pr-4 font-mono">
                                                        {s?.score ?? 0} / {c.max_score}
                                                    </td>
                                                    <td className="py-3 text-muted-foreground">
                                                        {s?.comments ?? '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                <Separator />

                                <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                                    <span className="text-sm font-semibold">Total Score</span>
                                    <span className="font-mono text-sm font-semibold">
                                        {evaluation!.score ?? submittedTotal} /{' '}
                                        {evaluation!.max_score ?? computeMax()}
                                    </span>
                                </div>

                                {evaluation!.comments && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Overall Comments</p>
                                        <p className="text-sm text-muted-foreground">
                                            {evaluation!.comments}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── Editable form ── */
                            <form className="space-y-6" onSubmit={handleSubmitClick}>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="pb-2 text-left font-medium">Criteria</th>
                                            <th className="w-36 pb-2 text-left font-medium">
                                                Score (max)
                                            </th>
                                            <th className="pb-2 text-left font-medium">Comments</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {criteria.map((c, index) => (
                                            <tr key={c.id} className="border-b last:border-0">
                                                <td className="py-3 pr-4">
                                                    <p className="font-medium">{c.name}</p>
                                                    {c.description && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {c.description}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={c.max_score}
                                                            value={form.data.scores[index].score}
                                                            onChange={(e) =>
                                                                updateScore(
                                                                    index,
                                                                    'score',
                                                                    Number(e.target.value),
                                                                )
                                                            }
                                                            className="w-20"
                                                        />
                                                        <span className="text-muted-foreground">
                                                            / {c.max_score}
                                                        </span>
                                                    </div>
                                                    <InputError
                                                        message={
                                                            form.errors[
                                                            `scores.${index}.score` as keyof typeof form.errors
                                                            ]
                                                        }
                                                    />
                                                </td>
                                                <td className="py-3">
                                                    <Input
                                                        placeholder="Optional..."
                                                        value={form.data.scores[index].comments}
                                                        onChange={(e) =>
                                                            updateScore(
                                                                index,
                                                                'comments',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            form.errors[
                                                            `scores.${index}.comments` as keyof typeof form.errors
                                                            ]
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                                    <span className="text-sm font-medium">Current Total</span>
                                    <span className="font-mono text-sm font-semibold">
                                        {computeTotal()} / {computeMax()}
                                    </span>
                                </div>

                                <Separator />

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="attempt_number">Attempt #</Label>
                                        <Input
                                            id="attempt_number"
                                            type="number"
                                            min={1}
                                            value={form.data.attempt_number}
                                            onChange={(e) =>
                                                form.setData('attempt_number', Number(e.target.value))
                                            }
                                        />
                                        <InputError message={form.errors.attempt_number} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="conducted_at">Conducted At</Label>
                                        <Input
                                            id="conducted_at"
                                            type="datetime-local"
                                            value={form.data.conducted_at}
                                            onChange={(e) =>
                                                form.setData('conducted_at', e.target.value)
                                            }
                                        />
                                        <InputError message={form.errors.conducted_at} />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-3">
                                        <Label htmlFor="comments">Overall Comments</Label>
                                        <textarea
                                            id="comments"
                                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Overall comments about the worksite visit..."
                                            value={form.data.comments}
                                            onChange={(e) => form.setData('comments', e.target.value)}
                                        />
                                        <InputError message={form.errors.comments} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={form.processing}
                                        onClick={handleSaveDraft}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {form.processing ? 'Saving...' : 'Save Draft'}
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        <Send className="mr-2 h-4 w-4" />
                                        {form.processing ? 'Submitting...' : 'Submit'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>

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
        </AppLayout>
    );
}

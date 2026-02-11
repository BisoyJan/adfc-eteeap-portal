import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    Eye,
    FileText,
    AlertTriangle,
    CheckCircle2,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import FilePreviewDialog from '@/components/file-preview-dialog';
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Document {
    id: number;
    document_category_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    notes: string | null;
    created_at: string;
    category: {
        id: number;
        name: string;
        slug: string;
    };
}

interface Portfolio {
    id: number;
    title: string;
    status: string;
    admin_notes: string | null;
    submitted_at: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    documents: Document[];
}

interface Assignment {
    id: number;
    status: string;
    due_date: string | null;
    notes: string | null;
    assigned_at: string;
    completed_at: string | null;
    portfolio: Portfolio;
    assigner: {
        id: number;
        name: string;
    };
}

interface RubricCriteria {
    id: number;
    name: string;
    description: string | null;
    max_score: number;
    sort_order: number;
}

interface EvaluationScore {
    id: number;
    rubric_criteria_id: number;
    score: number;
    comments: string | null;
}

interface Evaluation {
    id: number;
    status: string;
    overall_comments: string | null;
    recommendation: string | null;
    total_score: string | null;
    max_possible_score: string | null;
    submitted_at: string | null;
    scores: EvaluationScore[];
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_required: boolean;
    sort_order: number;
}

interface Props {
    assignment: Assignment;
    categories: Category[];
    uploadedCategoryIds: number[];
    progress: {
        required: number;
        completed: number;
        percentage: number;
    };
    criteria: RubricCriteria[];
    evaluation: Evaluation | null;
}

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

function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPastDue(dateString: string): boolean {
    return new Date(dateString) < new Date();
}

const portfolioStatusBadgeVariant: Record<
    string,
    'destructive' | 'default' | 'secondary' | 'outline'
> = {
    draft: 'secondary',
    submitted: 'default',
    under_review: 'outline',
    evaluated: 'default',
    revision_requested: 'destructive',
    approved: 'default',
    rejected: 'destructive',
};

const portfolioStatusBadgeClassName: Record<string, string> = {
    under_review: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
    evaluated:
        'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-200',
    approved:
        'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200',
};

function getAssignmentBadgeProps(status: string): {
    variant: 'default' | 'secondary' | 'outline';
    className?: string;
} {
    switch (status) {
        case 'pending':
            return { variant: 'secondary' };
        case 'in_progress':
            return {
                variant: 'outline',
                className:
                    'border-amber-500 text-amber-700 dark:text-amber-400',
            };
        case 'completed':
            return {
                variant: 'default',
                className:
                    'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200',
            };
        default:
            return { variant: 'outline' };
    }
}

const recommendationBadgeVariant: Record<
    string,
    'default' | 'destructive' | 'secondary' | 'outline'
> = {
    approve: 'default',
    request_revision: 'secondary',
    reject: 'destructive',
};

const recommendationBadgeClassName: Record<string, string> = {
    approve:
        'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200',
};

export default function Show({
    assignment,
    categories,
    uploadedCategoryIds,
    progress,
    criteria,
    evaluation,
}: Props) {
    const portfolio = assignment.portfolio;
    const isSubmitted = evaluation?.status === 'submitted';
    const isCompleted = assignment.status === 'completed';
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const pastDue =
        assignment.due_date && isPastDue(assignment.due_date) && !isCompleted;
    const assignmentBadge = getAssignmentBadgeProps(assignment.status);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assigned Reviews', href: '/evaluator/portfolios' },
        {
            title: portfolio.title,
            href: `/evaluator/portfolios/${assignment.id}`,
        },
    ];

    const form = useForm({
        scores: criteria.map((c) => {
            const existingScore = evaluation?.scores.find(
                (s) => s.rubric_criteria_id === c.id,
            );
            return {
                criteria_id: c.id,
                score: existingScore?.score ?? 0,
                comments: existingScore?.comments ?? '',
            };
        }),
        overall_comments: evaluation?.overall_comments ?? '',
        recommendation: evaluation?.recommendation ?? '',
    });

    function handleSaveDraft(e: FormEvent) {
        e.preventDefault();
        form.post(`/evaluator/portfolios/${assignment.id}/save`, {
            preserveScroll: true,
        });
    }

    function handleSubmitEvaluation(e: FormEvent) {
        e.preventDefault();
        setSubmitDialogOpen(true);
    }

    function handleConfirmSubmitEvaluation() {
        form.post(`/evaluator/portfolios/${assignment.id}/submit`, {
            preserveScroll: true,
            onFinish: () => setSubmitDialogOpen(false),
        });
    }

    function updateScore(
        index: number,
        field: 'score' | 'comments',
        value: number | string,
    ) {
        const updated = [...form.data.scores];
        updated[index] = { ...updated[index], [field]: value };
        form.setData('scores', updated);
    }

    function getDocumentsForCategory(categoryId: number): Document[] {
        return portfolio.documents.filter(
            (doc) => doc.document_category_id === categoryId,
        );
    }

    function computeTotalScore(): number {
        return form.data.scores.reduce((sum, s) => sum + Number(s.score), 0);
    }

    function computeMaxPossible(): number {
        return criteria.reduce((sum, c) => sum + c.max_score, 0);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review – ${portfolio.title}`} />

            <div className="space-y-6 p-6">
                {/* Section 1: Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/evaluator/portfolios">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <Heading
                                title={portfolio.title}
                                description={`Applicant: ${portfolio.user.name} (${portfolio.user.email})`}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge
                            variant={
                                portfolioStatusBadgeVariant[portfolio.status] ??
                                'outline'
                            }
                            className={
                                portfolioStatusBadgeClassName[
                                portfolio.status
                                ] ?? ''
                            }
                        >
                            {formatStatus(portfolio.status)}
                        </Badge>
                        <Badge
                            variant={assignmentBadge.variant}
                            className={assignmentBadge.className}
                        >
                            {formatStatus(assignment.status)}
                        </Badge>
                    </div>
                </div>

                {/* Due date warning */}
                {assignment.due_date && (
                    <div
                        className={`flex items-center gap-2 text-sm ${pastDue ? 'font-medium text-destructive' : 'text-muted-foreground'}`}
                    >
                        {pastDue ? (
                            <AlertTriangle className="h-4 w-4" />
                        ) : (
                            <Clock className="h-4 w-4" />
                        )}
                        <span>Due: {formatDate(assignment.due_date)}</span>
                        {pastDue && <span>(Past due)</span>}
                    </div>
                )}

                {/* Admin notes */}
                {portfolio.admin_notes && (
                    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                        <CardContent className="flex items-start gap-3 pt-6">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                    Admin Notes
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    {portfolio.admin_notes}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Two-column layout */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left column (2 cols): Portfolio info + Documents */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Section 2: Document Completion Progress */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">
                                        Required Documents: {progress.completed}
                                        /{progress.required}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {progress.percentage}%
                                    </span>
                                </div>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-300"
                                        style={{
                                            width: `${progress.percentage}%`,
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 3: Documents by Category */}
                        <div className="space-y-4">
                            {categories.map((category) => {
                                const docs = getDocumentsForCategory(
                                    category.id,
                                );
                                const isMissing =
                                    category.is_required &&
                                    !uploadedCategoryIds.includes(category.id);

                                return (
                                    <Card key={category.id}>
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base">
                                                    {category.name}
                                                </CardTitle>
                                                {category.is_required && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-[10px]"
                                                    >
                                                        Required
                                                    </Badge>
                                                )}
                                                {uploadedCategoryIds.includes(
                                                    category.id,
                                                ) && (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    )}
                                            </div>
                                            {category.description && (
                                                <CardDescription>
                                                    {category.description}
                                                </CardDescription>
                                            )}
                                        </CardHeader>

                                        <CardContent className="space-y-2">
                                            {docs.length > 0 ? (
                                                docs.map((doc) => (
                                                    <div
                                                        key={doc.id}
                                                        className="flex items-center justify-between rounded-md border px-3 py-2"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {
                                                                        doc.file_name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatFileSize(
                                                                        doc.file_size,
                                                                    )}{' '}
                                                                    ·{' '}
                                                                    {
                                                                        doc.mime_type
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setPreviewDoc(
                                                                        doc,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={`/documents/${doc.id}/download`}
                                                                    title={`Download ${doc.file_name}`}
                                                                    download
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : isMissing ? (
                                                <div className="flex items-center gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                                    <span>
                                                        Required document not
                                                        uploaded by applicant.
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    No documents uploaded.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right column (1 col): Evaluation */}
                    <div className="space-y-6">
                        {isSubmitted ? (
                            /* Read-only evaluation summary */
                            <Card>
                                <CardHeader>
                                    <CardTitle>Evaluation Summary</CardTitle>
                                    <CardDescription>
                                        Submitted{' '}
                                        {evaluation.submitted_at
                                            ? formatDate(
                                                evaluation.submitted_at,
                                            )
                                            : '—'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {criteria.map((c) => {
                                        const score = evaluation.scores.find(
                                            (s) =>
                                                s.rubric_criteria_id === c.id,
                                        );
                                        return (
                                            <div
                                                key={c.id}
                                                className="space-y-1"
                                            >
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">
                                                        {c.name}
                                                    </span>
                                                    <span className="font-mono text-sm">
                                                        {score?.score ?? 0} /{' '}
                                                        {c.max_score}
                                                    </span>
                                                </div>
                                                {score?.comments && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {score.comments}
                                                    </p>
                                                )}
                                                <Separator />
                                            </div>
                                        );
                                    })}

                                    {/* Total score */}
                                    <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                                        <span className="text-sm font-semibold">
                                            Total Score
                                        </span>
                                        <span className="font-mono text-sm font-semibold">
                                            {evaluation.total_score ?? 0} /{' '}
                                            {evaluation.max_possible_score ?? 0}
                                            {evaluation.total_score &&
                                                evaluation.max_possible_score &&
                                                Number(
                                                    evaluation.max_possible_score,
                                                ) > 0 && (
                                                    <span className="ml-2 text-muted-foreground">
                                                        (
                                                        {Math.round(
                                                            (Number(
                                                                evaluation.total_score,
                                                            ) /
                                                                Number(
                                                                    evaluation.max_possible_score,
                                                                )) *
                                                            100,
                                                        )}
                                                        %)
                                                    </span>
                                                )}
                                        </span>
                                    </div>

                                    <Separator />

                                    {/* Overall comments */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Overall Comments
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {evaluation.overall_comments || '—'}
                                        </p>
                                    </div>

                                    {/* Recommendation */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Recommendation
                                        </p>
                                        {evaluation.recommendation ? (
                                            <Badge
                                                variant={
                                                    recommendationBadgeVariant[
                                                    evaluation
                                                        .recommendation
                                                    ] ?? 'outline'
                                                }
                                                className={
                                                    recommendationBadgeClassName[
                                                    evaluation
                                                        .recommendation
                                                    ] ?? ''
                                                }
                                            >
                                                {formatStatus(
                                                    evaluation.recommendation,
                                                )}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : !isCompleted ? (
                            /* Evaluation form */
                            <Card>
                                <CardHeader>
                                    <CardTitle>Evaluation Scoring</CardTitle>
                                    <CardDescription>
                                        Score the portfolio using the rubric
                                        criteria below.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        className="space-y-6"
                                        onSubmit={handleSubmitEvaluation}
                                    >
                                        {/* Rubric criteria scores */}
                                        {criteria.map((c, index) => (
                                            <div
                                                key={c.id}
                                                className="space-y-3"
                                            >
                                                <div>
                                                    <Label className="text-sm font-medium">
                                                        {c.name}
                                                    </Label>
                                                    {c.description && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {c.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={c.max_score}
                                                        value={
                                                            form.data.scores[
                                                                index
                                                            ].score
                                                        }
                                                        onChange={(e) =>
                                                            updateScore(
                                                                index,
                                                                'score',
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="w-20"
                                                    />
                                                    <span className="text-sm text-muted-foreground">
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

                                                <textarea
                                                    className="flex min-h-15 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder="Comments for this criteria (optional)..."
                                                    value={
                                                        form.data.scores[index]
                                                            .comments
                                                    }
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

                                                {index <
                                                    criteria.length - 1 && (
                                                        <Separator />
                                                    )}
                                            </div>
                                        ))}

                                        <Separator />

                                        {/* Running total */}
                                        <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                                            <span className="text-sm font-medium">
                                                Current Total
                                            </span>
                                            <span className="font-mono text-sm font-semibold">
                                                {computeTotalScore()} /{' '}
                                                {computeMaxPossible()}
                                            </span>
                                        </div>

                                        {/* Overall comments */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="overall_comments">
                                                Overall Comments
                                            </Label>
                                            <textarea
                                                id="overall_comments"
                                                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Provide overall comments about this portfolio..."
                                                value={
                                                    form.data.overall_comments
                                                }
                                                onChange={(e) =>
                                                    form.setData(
                                                        'overall_comments',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors.overall_comments
                                                }
                                            />
                                        </div>

                                        {/* Recommendation */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="recommendation">
                                                Recommendation
                                            </Label>
                                            <Select
                                                value={form.data.recommendation}
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'recommendation',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger id="recommendation">
                                                    <SelectValue placeholder="Select recommendation" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="approve">
                                                        Approve
                                                    </SelectItem>
                                                    <SelectItem value="request_revision">
                                                        Request Revision
                                                    </SelectItem>
                                                    <SelectItem value="reject">
                                                        Reject
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    form.errors.recommendation
                                                }
                                            />
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={form.processing}
                                                onClick={handleSaveDraft}
                                            >
                                                {form.processing
                                                    ? 'Saving...'
                                                    : 'Save Draft'}
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={form.processing}
                                            >
                                                {form.processing
                                                    ? 'Submitting...'
                                                    : 'Submit Evaluation'}
                                            </Button>
                                        </div>
                                    </form>
                                    <AlertDialog
                                        open={submitDialogOpen}
                                        onOpenChange={setSubmitDialogOpen}
                                    >
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Submit this evaluation?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone
                                                    once submitted.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={
                                                        handleConfirmSubmitEvaluation
                                                    }
                                                >
                                                    Submit Evaluation
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                </div>
            </div>

            <FilePreviewDialog
                open={previewDoc !== null}
                onOpenChange={(open) => !open && setPreviewDoc(null)}
                document={previewDoc}
                downloadUrl={
                    previewDoc ? `/documents/${previewDoc.id}/download` : ''
                }
            />
        </AppLayout>
    );
}

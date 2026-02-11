import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import {
    Upload,
    Download,
    Eye,
    Trash2,
    FileText,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Star,
    MessageSquare,
    Clock,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import FilePreviewDialog from '@/components/file-preview-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
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
    documents: Document[];
    assignments: Array<{
        id: number;
        status: string;
        evaluator: { id: number; name: string };
        completed_at: string | null;
    }>;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_required: boolean;
    sort_order: number;
}

interface EvaluationScore {
    id: number;
    score: number;
    comments: string | null;
    criteria: {
        id: number;
        name: string;
        description: string | null;
        max_score: number;
    };
}

interface EvaluationResult {
    id: number;
    status: string;
    overall_comments: string | null;
    recommendation: string | null;
    total_score: string;
    max_possible_score: string;
    submitted_at: string | null;
    evaluator: { id: number; name: string };
    scores: EvaluationScore[];
}

interface Props {
    portfolio: Portfolio;
    categories: Category[];
    uploadedCategoryIds: number[];
    progress: {
        required: number;
        completed: number;
        percentage: number;
    };
    evaluations: EvaluationResult[];
}

const statusBadgeVariant: Record<
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

function canEdit(status: string): boolean {
    return status === 'draft' || status === 'revision_requested';
}

const timelineSteps = [
    { key: 'draft', label: 'Draft' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'evaluated', label: 'Evaluated' },
    { key: 'approved', label: 'Approved' },
];

function getTimelineIndex(status: string): number {
    if (status === 'revision_requested') return 2;
    if (status === 'rejected') return 3;
    const idx = timelineSteps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
}

function getRecommendationBadge(recommendation: string | null): {
    label: string;
    className: string;
} {
    switch (recommendation) {
        case 'approve':
            return {
                label: 'Recommended for Approval',
                className:
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            };
        case 'revise':
            return {
                label: 'Recommended for Revision',
                className:
                    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
            };
        case 'reject':
            return {
                label: 'Recommended for Rejection',
                className:
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            };
        default:
            return {
                label: 'No Recommendation',
                className:
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
            };
    }
}

function CategoryUploadForm({
    portfolioId,
    categoryId,
}: {
    portfolioId: number;
    categoryId: number;
}) {
    const form = useForm({
        document_category_id: categoryId,
        file: null as File | null,
        notes: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.post(`/applicant/portfolios/${portfolioId}/documents`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor={`file-${categoryId}`}>File</Label>
                <Input
                    id={`file-${categoryId}`}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) =>
                        form.setData('file', e.target.files?.[0] ?? null)
                    }
                />
                <InputError message={form.errors.file} />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor={`notes-${categoryId}`}>Notes (optional)</Label>
                <textarea
                    id={`notes-${categoryId}`}
                    className="flex min-h-15 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add any relevant notes about this document..."
                    value={form.data.notes}
                    onChange={(e) => form.setData('notes', e.target.value)}
                />
                <InputError message={form.errors.notes} />
            </div>

            <Button
                type="submit"
                size="sm"
                disabled={form.processing || !form.data.file}
            >
                <Upload className="mr-1.5 h-4 w-4" />
                {form.processing ? 'Uploading...' : 'Upload'}
            </Button>
        </form>
    );
}

export default function Show({
    portfolio,
    categories,
    uploadedCategoryIds,
    progress,
    evaluations,
}: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;
    const editable = canEdit(portfolio.status);
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
        null,
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Portfolios', href: '/applicant/portfolios' },
        {
            title: portfolio.title,
            href: `/applicant/portfolios/${portfolio.id}`,
        },
    ];

    function handleSubmitPortfolio() {
        router.post(
            `/applicant/portfolios/${portfolio.id}/submit`,
            {},
            {
                onSuccess: () => {
                    toast.success('Portfolio submitted for review.');
                },
                onError: () => {
                    toast.error(
                        'Unable to submit portfolio. Please try again.',
                    );
                },
                onFinish: () => {
                    setSubmitDialogOpen(false);
                },
            },
        );
    }

    function handleDeleteDocument(doc: Document) {
        setDocumentToDelete(doc);
        setDeleteDialogOpen(true);
    }

    function handleConfirmDeleteDocument() {
        if (!documentToDelete) {
            return;
        }

        router.delete(
            `/applicant/portfolios/${portfolio.id}/documents/${documentToDelete.id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Document removed.');
                },
                onError: () => {
                    toast.error('Unable to delete document. Please try again.');
                },
                onFinish: () => {
                    setDeleteDialogOpen(false);
                    setDocumentToDelete(null);
                },
            },
        );
    }

    function getDocumentsForCategory(categoryId: number): Document[] {
        return portfolio.documents.filter(
            (doc) => doc.document_category_id === categoryId,
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={portfolio.title} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Heading
                            title={portfolio.title}
                            description={`Created ${new Date(portfolio.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                        />
                    </div>
                    <Badge
                        variant={
                            statusBadgeVariant[portfolio.status] ?? 'outline'
                        }
                        className={
                            portfolio.status === 'approved'
                                ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300'
                                : ''
                        }
                    >
                        {formatStatus(portfolio.status)}
                    </Badge>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* Admin notes / revision feedback */}
                {portfolio.admin_notes && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <span className="font-medium">
                                Revision Feedback:
                            </span>{' '}
                            {portfolio.admin_notes}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Progress bar */}
                {editable && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                    Required Documents: {progress.completed}/
                                    {progress.required}
                                </span>
                                <span className="text-muted-foreground">
                                    {progress.percentage}%
                                </span>
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Progress Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Portfolio Progress
                        </CardTitle>
                        <CardDescription>
                            Track the status of your portfolio through the
                            review process
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {portfolio.status === 'rejected' ? (
                            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
                                    ✕
                                </div>
                                <div>
                                    <p className="font-medium text-red-800 dark:text-red-200">
                                        Portfolio Rejected
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        Your portfolio has been rejected. Please
                                        contact administration for further
                                        details.
                                    </p>
                                </div>
                            </div>
                        ) : portfolio.status === 'revision_requested' ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
                                        !
                                    </div>
                                    <div>
                                        <p className="font-medium text-amber-800 dark:text-amber-200">
                                            Revision Requested
                                        </p>
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            Please review the feedback and
                                            update your portfolio.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    {timelineSteps
                                        .slice(0, 3)
                                        .map((step, idx) => {
                                            const current = getTimelineIndex(
                                                portfolio.status,
                                            );
                                            const isCompleted = idx < current;
                                            const isCurrent = idx === current;
                                            return (
                                                <div
                                                    key={step.key}
                                                    className="flex flex-1 flex-col items-center"
                                                >
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}
                                                    >
                                                        {isCompleted
                                                            ? '✓'
                                                            : idx + 1}
                                                    </div>
                                                    <span className="mt-1.5 text-center text-xs font-medium">
                                                        {step.label}
                                                    </span>
                                                    {idx < 2 && (
                                                        <div
                                                            className={`mt-1 h-0.5 w-full ${isCompleted ? 'bg-green-500' : 'bg-muted'}`}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="flex items-start justify-between">
                                    {timelineSteps.map((step, idx) => {
                                        const current = getTimelineIndex(
                                            portfolio.status,
                                        );
                                        const isCompleted = idx < current || (idx === current && portfolio.status === 'approved');
                                        const isCurrent = idx === current && portfolio.status !== 'approved';
                                        return (
                                            <div
                                                key={step.key}
                                                className="relative z-10 flex flex-col items-center"
                                            >
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                                >
                                                    {isCompleted ? '✓' : idx + 1}
                                                </div>
                                                <span
                                                    className={`mt-1.5 text-center text-xs font-medium ${isCurrent ? 'text-primary' : ''}`}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="absolute left-0 right-0 top-4 -z-0 flex items-center px-4">
                                    {timelineSteps.slice(0, -1).map((_, idx) => {
                                        const current = getTimelineIndex(
                                            portfolio.status,
                                        );
                                        const isCompleted = idx < current || (portfolio.status === 'approved' && idx < timelineSteps.length - 1);
                                        return (
                                            <div
                                                key={idx}
                                                className={`h-0.5 flex-1 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Evaluation Results */}
                {evaluations && evaluations.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">
                            Evaluation Results
                        </h2>
                        {evaluations.map((evaluation) => {
                            const total = parseFloat(evaluation.total_score);
                            const max = parseFloat(
                                evaluation.max_possible_score,
                            );
                            const percentage =
                                max > 0 ? Math.round((total / max) * 100) : 0;
                            const recBadge = getRecommendationBadge(
                                evaluation.recommendation,
                            );

                            return (
                                <Card key={evaluation.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Star className="h-4 w-4" />
                                                Evaluation by{' '}
                                                {evaluation.evaluator.name}
                                            </CardTitle>
                                            <Badge
                                                className={recBadge.className}
                                            >
                                                {recBadge.label}
                                            </Badge>
                                        </div>
                                        {evaluation.submitted_at && (
                                            <CardDescription>
                                                Submitted{' '}
                                                {new Date(
                                                    evaluation.submitted_at,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Overall Score */}
                                        <div className="rounded-lg border p-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">
                                                    Overall Score
                                                </span>
                                                <span className="text-lg font-bold">
                                                    {total}/{max} ({percentage}
                                                    %)
                                                </span>
                                            </div>
                                            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Per-Criteria Scores */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium">
                                                Criteria Breakdown
                                            </h4>
                                            {evaluation.scores.map((score) => {
                                                const criteriaPercentage =
                                                    score.criteria.max_score > 0
                                                        ? Math.round(
                                                            (score.score /
                                                                score.criteria
                                                                    .max_score) *
                                                            100,
                                                        )
                                                        : 0;

                                                return (
                                                    <div
                                                        key={score.id}
                                                        className="space-y-1.5 rounded-md border px-3 py-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium">
                                                                {
                                                                    score
                                                                        .criteria
                                                                        .name
                                                                }
                                                            </span>
                                                            <span className="text-sm font-bold">
                                                                {score.score}/
                                                                {
                                                                    score
                                                                        .criteria
                                                                        .max_score
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                                            <div
                                                                className={`h-full rounded-full ${criteriaPercentage >= 75 ? 'bg-green-500' : criteriaPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                style={{
                                                                    width: `${criteriaPercentage}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        {score.comments && (
                                                            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                                                <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
                                                                {score.comments}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Overall Comments */}
                                        {evaluation.overall_comments && (
                                            <div className="rounded-lg border bg-muted/50 p-4">
                                                <h4 className="mb-1.5 text-sm font-medium">
                                                    Evaluator Comments
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        evaluation.overall_comments
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Document categories */}
                <div className="space-y-4">
                    {categories.map((category) => {
                        const docs = getDocumentsForCategory(category.id);

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

                                <CardContent className="space-y-4">
                                    {/* Existing documents */}
                                    {docs.length > 0 ? (
                                        <div className="space-y-2">
                                            {docs.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center justify-between rounded-md border px-3 py-2"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {doc.file_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatFileSize(
                                                                    doc.file_size,
                                                                )}{' '}
                                                                ·{' '}
                                                                {doc.mime_type}
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
                                                        {editable && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    handleDeleteDocument(
                                                                        doc,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No documents uploaded yet.
                                        </p>
                                    )}

                                    {/* Upload form */}
                                    {editable && (
                                        <>
                                            <Separator />
                                            <CategoryUploadForm
                                                portfolioId={portfolio.id}
                                                categoryId={category.id}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" asChild>
                        <Link href="/applicant/portfolios">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to Portfolios
                        </Link>
                    </Button>

                    {editable &&
                        (progress.percentage >= 100 ? (
                            <AlertDialog
                                open={submitDialogOpen}
                                onOpenChange={setSubmitDialogOpen}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button>
                                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                        Submit Portfolio
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Submit this portfolio?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You will not be able to make changes
                                            until it is reviewed.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleSubmitPortfolio}
                                        >
                                            Submit Portfolio
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <Button
                                disabled
                                title="Upload all required documents before submitting"
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Submit Portfolio
                            </Button>
                        ))}
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
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) {
                        setDocumentToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete this document?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {documentToDelete
                                ? `"${documentToDelete.file_name}" will be permanently removed.`
                                : 'This document will be permanently removed.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDeleteDocument}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete Document
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

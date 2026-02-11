import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { ArrowLeft, AlertCircle, CheckCircle2, Download, Eye, FileText, Trash2, AlertTriangle, UserPlus, Calendar, Star, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
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
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface Assignment {
    id: number;
    status: string;
    due_date: string | null;
    notes: string | null;
    assigned_at: string;
    completed_at: string | null;
    evaluator: {
        id: number;
        name: string;
        email: string;
    };
    assigner: {
        id: number;
        name: string;
    };
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

interface Portfolio {
    id: number;
    title: string;
    status: string;
    admin_notes: string | null;
    submitted_at: string | null;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    documents: Document[];
    assignments: Assignment[];
    evaluations: EvaluationResult[];
}

interface Evaluator {
    id: number;
    name: string;
    email: string;
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
    portfolio: Portfolio;
    evaluators: Evaluator[];
    categories: Category[];
    uploadedCategoryIds: number[];
    progress: {
        required: number;
        completed: number;
        percentage: number;
    };
}

const statusBadgeVariant: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    draft: 'secondary',
    submitted: 'default',
    under_review: 'outline',
    evaluated: 'default',
    revision_requested: 'destructive',
    approved: 'default',
    rejected: 'destructive',
};

const statusBadgeClassName: Record<string, string> = {
    under_review: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
    evaluated: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-200',
    approved: 'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200',
};

const updatableStatuses = [
    { value: 'under_review', label: 'Under Review' },
    { value: 'revision_requested', label: 'Revision Requested' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

function formatStatus(status: string): string {
    return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
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

function getRecommendationBadge(recommendation: string | null): { label: string; className: string } {
    switch (recommendation) {
        case 'approve':
            return { label: 'Approve', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
        case 'revise':
            return { label: 'Revise', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' };
        case 'reject':
            return { label: 'Reject', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
        default:
            return { label: 'None', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
    }
}

export default function Show({ portfolio, evaluators, categories, uploadedCategoryIds, progress }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const isDraft = portfolio.status === 'draft';
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
    const [assignmentToRemove, setAssignmentToRemove] = useState<Assignment | null>(null);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Portfolios', href: '/admin/portfolios' },
        { title: portfolio.title, href: `/admin/portfolios/${portfolio.id}` },
    ];

    const assignForm = useForm({
        evaluator_id: '',
        due_date: '',
        notes: '',
    });

    const statusForm = useForm({
        status: portfolio.status,
        admin_notes: portfolio.admin_notes ?? '',
    });

    function handleAssign(e: FormEvent) {
        e.preventDefault();
        assignForm.post(`/admin/portfolios/${portfolio.id}/assign`, {
            onSuccess: () => assignForm.reset(),
        });
    }

    function handleRemoveAssignment(assignment: Assignment) {
        setAssignmentToRemove(assignment);
        setRemoveDialogOpen(true);
    }

    function handleConfirmRemoveAssignment() {
        if (!assignmentToRemove) {
            return;
        }

        router.delete(`/admin/portfolios/${portfolio.id}/assignments/${assignmentToRemove.id}`, {
            onFinish: () => {
                setRemoveDialogOpen(false);
                setAssignmentToRemove(null);
            },
        });
    }

    function handleStatusUpdate(e: FormEvent) {
        e.preventDefault();
        statusForm.put(`/admin/portfolios/${portfolio.id}/status`);
    }

    function getDocumentsForCategory(categoryId: number): Document[] {
        return portfolio.documents.filter((doc) => doc.document_category_id === categoryId);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${portfolio.title} – Admin`} />

            <div className="space-y-6 p-6">
                {/* Section 1: Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/portfolios">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <Heading title={portfolio.title} description={`Submitted by ${portfolio.user.name}`} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {portfolio.submitted_at && (
                            <span className="text-sm text-muted-foreground">
                                Submitted {formatDate(portfolio.submitted_at)}
                            </span>
                        )}
                        <Badge
                            variant={statusBadgeVariant[portfolio.status] ?? 'outline'}
                            className={statusBadgeClassName[portfolio.status] ?? ''}
                        >
                            {formatStatus(portfolio.status)}
                        </Badge>
                    </div>
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

                {/* Two-column layout */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left column (2 cols): Portfolio info + Documents */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Section 2: Portfolio Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Portfolio Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Applicant</p>
                                        <p className="text-sm">{portfolio.user.name}</p>
                                        <p className="text-xs text-muted-foreground">{portfolio.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <Badge
                                            variant={statusBadgeVariant[portfolio.status] ?? 'outline'}
                                            className={statusBadgeClassName[portfolio.status] ?? ''}
                                        >
                                            {formatStatus(portfolio.status)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                                        <p className="text-sm">
                                            {portfolio.submitted_at ? formatDate(portfolio.submitted_at) : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                                        <p className="text-sm">{formatDate(portfolio.created_at)}</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Progress bar */}
                                <div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">
                                            Document Completion: {progress.completed}/{progress.required}
                                        </span>
                                        <span className="text-muted-foreground">{progress.percentage}%</span>
                                    </div>
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className="bg-primary h-full rounded-full transition-all duration-300"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {portfolio.admin_notes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Admin Notes</p>
                                            <p className="mt-1 text-sm">{portfolio.admin_notes}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Section 3: Documents Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                                <CardDescription>
                                    Uploaded documents grouped by category
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {categories.map((category) => {
                                    const docs = getDocumentsForCategory(category.id);
                                    const isUploaded = uploadedCategoryIds.includes(category.id);
                                    const isMissingRequired = category.is_required && !isUploaded;

                                    return (
                                        <div key={category.id} className="rounded-lg border p-4">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold">{category.name}</h4>
                                                {category.is_required && (
                                                    <Badge variant="destructive" className="text-[10px]">
                                                        Required
                                                    </Badge>
                                                )}
                                                {isUploaded && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                )}
                                                {isMissingRequired && (
                                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                )}
                                            </div>
                                            {category.description && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {category.description}
                                                </p>
                                            )}

                                            {docs.length > 0 ? (
                                                <div className="mt-3 space-y-2">
                                                    {docs.map((doc) => (
                                                        <div
                                                            key={doc.id}
                                                            className="flex items-center justify-between rounded-md border px-3 py-2"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                <div>
                                                                    <p className="text-sm font-medium">{doc.file_name}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatFileSize(doc.file_size)} · {doc.mime_type}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(doc)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="sm" asChild>
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
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="mt-3 text-sm text-muted-foreground">
                                                    No document uploaded
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Section 3b: Evaluation Results */}
                        {portfolio.evaluations && portfolio.evaluations.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5" />
                                        Evaluation Results
                                    </CardTitle>
                                    <CardDescription>
                                        Scores and feedback from assigned evaluators
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {portfolio.evaluations.map((evaluation) => {
                                        const total = parseFloat(evaluation.total_score);
                                        const max = parseFloat(evaluation.max_possible_score);
                                        const percentage = max > 0 ? Math.round((total / max) * 100) : 0;
                                        const recBadge = getRecommendationBadge(evaluation.recommendation);

                                        return (
                                            <div key={evaluation.id} className="rounded-lg border p-4 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{evaluation.evaluator.name}</p>
                                                        {evaluation.submitted_at && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Submitted {formatDate(evaluation.submitted_at)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={recBadge.className}>{recBadge.label}</Badge>
                                                        <span className="text-sm font-bold">{total}/{max} ({percentage}%)</span>
                                                    </div>
                                                </div>

                                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>

                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {evaluation.scores.map((score) => (
                                                        <div key={score.id} className="rounded-md bg-muted/50 px-3 py-2">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span>{score.criteria.name}</span>
                                                                <span className="font-medium">{score.score}/{score.criteria.max_score}</span>
                                                            </div>
                                                            {score.comments && (
                                                                <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                                                                    <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
                                                                    {score.comments}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {evaluation.overall_comments && (
                                                    <div className="rounded-md bg-muted/50 p-3">
                                                        <p className="text-sm font-medium">Comments</p>
                                                        <p className="mt-1 text-sm text-muted-foreground">{evaluation.overall_comments}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right column (1 col): Assignments + Status */}
                    <div className="space-y-6">
                        {/* Section 4: Assign Evaluator Card */}
                        {!isDraft && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Evaluator Assignments</CardTitle>
                                    <CardDescription>
                                        Assign evaluators to review this portfolio
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <form onSubmit={handleAssign} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="evaluator_id">Evaluator</Label>
                                            <Select
                                                value={assignForm.data.evaluator_id}
                                                onValueChange={(value) => assignForm.setData('evaluator_id', value)}
                                            >
                                                <SelectTrigger id="evaluator_id">
                                                    <SelectValue placeholder="Select evaluator..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {evaluators.map((evaluator) => (
                                                        <SelectItem key={evaluator.id} value={String(evaluator.id)}>
                                                            {evaluator.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={assignForm.errors.evaluator_id} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="due_date">Due Date (optional)</Label>
                                            <Input
                                                id="due_date"
                                                type="date"
                                                value={assignForm.data.due_date}
                                                onChange={(e) => assignForm.setData('due_date', e.target.value)}
                                            />
                                            <InputError message={assignForm.errors.due_date} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="assign_notes">Notes (optional)</Label>
                                            <Input
                                                id="assign_notes"
                                                value={assignForm.data.notes}
                                                onChange={(e) => assignForm.setData('notes', e.target.value)}
                                                placeholder="Instructions for the evaluator..."
                                            />
                                            <InputError message={assignForm.errors.notes} />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={assignForm.processing || !assignForm.data.evaluator_id}
                                        >
                                            <UserPlus className="mr-1.5 h-4 w-4" />
                                            {assignForm.processing ? 'Assigning...' : 'Assign Evaluator'}
                                        </Button>
                                    </form>

                                    {/* Existing assignments */}
                                    {portfolio.assignments.length > 0 && (
                                        <>
                                            <Separator />
                                            <div className="space-y-3">
                                                {portfolio.assignments.map((assignment) => (
                                                    <div
                                                        key={assignment.id}
                                                        className="rounded-md border p-3"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    {assignment.evaluator.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {assignment.evaluator.email}
                                                                </p>
                                                            </div>
                                                            <Badge
                                                                variant={statusBadgeVariant[assignment.status] ?? 'outline'}
                                                                className={statusBadgeClassName[assignment.status] ?? ''}
                                                            >
                                                                {formatStatus(assignment.status)}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Assigned {formatDate(assignment.assigned_at)}
                                                            </span>
                                                            {assignment.due_date && (
                                                                <span>Due {formatDate(assignment.due_date)}</span>
                                                            )}
                                                            <span>By {assignment.assigner.name}</span>
                                                        </div>
                                                        {assignment.notes && (
                                                            <p className="mt-1 text-xs text-muted-foreground italic">
                                                                {assignment.notes}
                                                            </p>
                                                        )}
                                                        <div className="mt-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-destructive hover:text-destructive"
                                                                onClick={() => handleRemoveAssignment(assignment)}
                                                            >
                                                                <Trash2 className="mr-1 h-3 w-3" />
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Section 5: Update Status Card */}
                        {!isDraft && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Update Status</CardTitle>
                                    <CardDescription>
                                        Change the portfolio review status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleStatusUpdate} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="status">New Status</Label>
                                            <Select
                                                value={statusForm.data.status}
                                                onValueChange={(value) => statusForm.setData('status', value)}
                                            >
                                                <SelectTrigger id="status">
                                                    <SelectValue placeholder="Select status..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {updatableStatuses.map((s) => (
                                                        <SelectItem key={s.value} value={s.value}>
                                                            {s.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={statusForm.errors.status} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="admin_notes">Admin Notes</Label>
                                            <textarea
                                                id="admin_notes"
                                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Add notes for the applicant (visible on revision requests)..."
                                                value={statusForm.data.admin_notes}
                                                onChange={(e) => statusForm.setData('admin_notes', e.target.value)}
                                            />
                                            <InputError message={statusForm.errors.admin_notes} />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={statusForm.processing}
                                        >
                                            {statusForm.processing ? 'Updating...' : 'Update Status'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <FilePreviewDialog
                open={previewDoc !== null}
                onOpenChange={(open) => !open && setPreviewDoc(null)}
                document={previewDoc}
                downloadUrl={previewDoc ? `/documents/${previewDoc.id}/download` : ''}
            />
            <AlertDialog
                open={removeDialogOpen}
                onOpenChange={(open) => {
                    setRemoveDialogOpen(open);
                    if (!open) {
                        setAssignmentToRemove(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove this assignment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {assignmentToRemove
                                ? `The assignment for ${assignmentToRemove.evaluator.name} will be removed.`
                                : 'The selected assignment will be removed.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmRemoveAssignment}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Remove Assignment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

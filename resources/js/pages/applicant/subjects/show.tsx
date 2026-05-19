import { Head, Link, router, useForm } from '@inertiajs/react';
import { Download, FileText, GraduationCap, Upload } from 'lucide-react';
import { useRef, type FormEvent } from 'react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Module { id: number; title: string; description: string | null; file_name: string; file_size: number; uploader: { id: number; name: string } | null }
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
    answers: { id: number; question_id: number; answer: string | null }[];
}
interface SubjEvalScore { id: number; score: string; comments: string | null; criteria: { id: number; name: string; max_score: number; category: string } }
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
    evaluator: { id: number; name: string } | null;
    scores: SubjEvalScore[];
}
interface Props {
    portfolioSubject: {
        id: number;
        status: string;
        recommendation: string | null;
        notes: string | null;
        evaluator: { id: number; name: string } | null;
        subject: {
            id: number; code: string; name: string; units: number; description: string | null;
            academic_year: { id: number; name: string } | null;
            modules: Module[];
            pre_assessment_questions: { id: number; question: string; sort_order: number }[];
        };
        pre_assessment_attempts: Attempt[];
        subject_evaluations: SubjEval[];
    };
}

export default function ApplicantSubjectShow({ portfolioSubject }: Props) {
    const s = portfolioSubject.subject;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/applicant/dashboard' },
        { title: 'My Subjects', href: '/applicant/subjects' },
        { title: `${s.code} ${s.name}`, href: '#' },
    ];

    const latestAttempt = portfolioSubject.pre_assessment_attempts[0];
    const latestGradedPreAssessment = portfolioSubject.pre_assessment_attempts.find((attempt) => attempt.graded_at !== null) ?? null;
    const latestWrittenExam = [...portfolioSubject.subject_evaluations]
        .filter((evaluation) => evaluation.category === 'written_exam' && evaluation.status === 'submitted')
        .sort((left, right) => right.attempt_number - left.attempt_number)[0] ?? null;

    const fileRef = useRef<HTMLInputElement>(null);
    const moduleForm = useForm<{ title: string; description: string; file: File | null }>({
        title: '',
        description: '',
        file: null,
    });

    function startPreAssessment() {
        router.post(`/applicant/subjects/${portfolioSubject.id}/pre-assessment/start`);
    }

    function uploadModule(e: FormEvent) {
        e.preventDefault();
        moduleForm.post(`/applicant/subjects/${portfolioSubject.id}/modules`, {
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

    function fmtSize(b: number) { return b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB` }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={s.name} />
            <div className="space-y-6 p-6">
                <Heading title={`${s.code} — ${s.name}`} description={s.academic_year?.name ?? ''} />
                <FlashMessages />

                <Card>
                    <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {s.description && <p>{s.description}</p>}
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{s.units} units</Badge>
                            <Badge>{portfolioSubject.status.replace('_', ' ')}</Badge>
                            {portfolioSubject.evaluator && <Badge variant="secondary">Evaluator: {portfolioSubject.evaluator.name}</Badge>}
                            {portfolioSubject.recommendation && <Badge>Recommendation: {portfolioSubject.recommendation.replace('_', ' ')}</Badge>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Assessment Summary</CardTitle></CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-md border p-3 text-sm">
                            <p className="text-xs text-muted-foreground">Pre-Assessment</p>
                            {latestGradedPreAssessment ? (
                                <>
                                    <p className="mt-1 font-medium">{latestGradedPreAssessment.score} / {latestGradedPreAssessment.max_score}</p>
                                    <p className="text-xs text-muted-foreground">Evaluator: {latestGradedPreAssessment.grader?.name ?? '-'}</p>
                                    <p className="text-xs text-muted-foreground">Date: {latestGradedPreAssessment.graded_at ? new Date(latestGradedPreAssessment.graded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</p>
                                </>
                            ) : (
                                <p className="mt-1 text-muted-foreground">No graded pre-assessment yet.</p>
                            )}
                        </div>
                        <div className="rounded-md border p-3 text-sm">
                            <p className="text-xs text-muted-foreground">Written Examination</p>
                            {latestWrittenExam ? (
                                <>
                                    <p className="mt-1 font-medium">{latestWrittenExam.score} / {latestWrittenExam.max_score}</p>
                                    <p className="text-xs text-muted-foreground">Evaluator: {latestWrittenExam.evaluator?.name ?? '-'}</p>
                                    <p className="text-xs text-muted-foreground">Date: {latestWrittenExam.conducted_at ? new Date(latestWrittenExam.conducted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : (latestWrittenExam.submitted_at ? new Date(latestWrittenExam.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-')}</p>
                                </>
                            ) : (
                                <p className="mt-1 text-muted-foreground">No written exam result yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Modules ({s.modules.length})</CardTitle></CardHeader>
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

                        {s.modules.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No modules uploaded yet.</p>
                        ) : (
                            <ul className="divide-y">
                                {s.modules.map((m) => (
                                    <li key={m.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <div className="flex items-center gap-2 font-medium"><FileText className="h-4 w-4" /> {m.title}</div>
                                            {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                                            <p className="text-xs text-muted-foreground">{m.file_name} • {fmtSize(m.file_size)}{m.uploader && ` • by ${m.uploader.name}`}</p>
                                        </div>
                                        <Button asChild size="sm" className="shrink-0">
                                            <a href={`/applicant/modules/${m.id}/download`} download><Download className="mr-2 h-4 w-4" /> Download Module</a>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Pre-Assessment</span>
                            <Button onClick={startPreAssessment} size="sm">
                                {latestAttempt && !latestAttempt.submitted_at ? 'Continue Attempt' : 'Start New Attempt'}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {portfolioSubject.pre_assessment_attempts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No attempts yet. Click "Start" to begin.</p>
                        ) : (
                            <ul className="divide-y">
                                {portfolioSubject.pre_assessment_attempts.map((a) => (
                                    <li key={a.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <div className="font-medium">Attempt #{a.attempt_number}</div>
                                            <p className="text-xs text-muted-foreground">
                                                {a.submitted_at ? `Submitted ${new Date(a.submitted_at).toLocaleString()}` : 'Draft'}
                                                {a.graded_at && ` • Graded ${new Date(a.graded_at).toLocaleString()}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Evaluator: {a.grader?.name ?? '—'}</p>
                                            <p className="text-xs text-muted-foreground">AY: {s.academic_year?.name ?? '—'} • Program: BSIT</p>
                                            <p className="text-xs text-muted-foreground">Evaluation Date: {a.graded_at ? new Date(a.graded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {a.score !== null && <Badge>{a.score} / {a.max_score}</Badge>}
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/applicant/subjects/${portfolioSubject.id}/pre-assessment/${a.id}`}>
                                                    {a.submitted_at ? 'View' : 'Edit'}
                                                </Link>
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Evaluations (Interview / Written Exam)</CardTitle>
                        <p className="text-xs text-muted-foreground">Worksite visit ratings are available on your portfolio page under required documents.</p>
                    </CardHeader>
                    <CardContent>
                        {portfolioSubject.subject_evaluations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No evaluations submitted yet.</p>
                        ) : (
                            <ul className="divide-y">
                                {portfolioSubject.subject_evaluations.map((e) => (
                                    <li key={e.id} className="py-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium capitalize">{e.category.replace('_', ' ')} (Attempt {e.attempt_number})</span>
                                            <Badge variant={e.status === 'submitted' ? 'default' : 'outline'}>{e.score} / {e.max_score}</Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">Evaluator: {e.evaluator?.name ?? portfolioSubject.evaluator?.name ?? '—'}</p>
                                        <p className="text-xs text-muted-foreground">AY: {s.academic_year?.name ?? '—'} • Program: BSIT</p>
                                        <p className="text-xs text-muted-foreground">Evaluation Date: {e.conducted_at ? new Date(e.conducted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : (e.submitted_at ? new Date(e.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')}</p>
                                        {e.comments && <p className="mt-1 text-xs text-muted-foreground">{e.comments}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

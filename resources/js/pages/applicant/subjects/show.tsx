import { Head, Link, router } from '@inertiajs/react';
import { Download, FileText, GraduationCap } from 'lucide-react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    function startPreAssessment() {
        router.post(`/applicant/subjects/${portfolioSubject.id}/pre-assessment/start`);
    }

    function fmtSize(b: number) { return b < 1024 ? `${b} B` : b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/1024/1024).toFixed(1)} MB` }

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
                    <CardHeader><CardTitle>Modules ({s.modules.length})</CardTitle></CardHeader>
                    <CardContent>
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
                                        <Button asChild variant="outline" size="sm">
                                            <a href={`/applicant/modules/${m.id}/download`}><Download className="mr-2 h-4 w-4" /> Download</a>
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
                    <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Evaluations</CardTitle></CardHeader>
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

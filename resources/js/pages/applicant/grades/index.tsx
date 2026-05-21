import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Score {
    score: number | null;
    max_score: number | null;
    submitted_at: string | null;
    evaluation_date: string | null;
    evaluator_name: string | null;
}
interface PortfolioScore extends Score { }
interface Row {
    id: number;
    subject: { id: number; code: string; name: string; units: number; academic_year: string | null };
    status: string;
    recommendation: string | null;
    recommendation_label: string | null;
    pre_assessment: {
        attempt_number: number;
        submitted_at: string | null;
        score: string | null;
        max_score: string | null;
        graded_at: string | null;
        evaluation_date: string | null;
        evaluator_name: string | null;
        academic_year: string | null;
        program: string;
    } | null;
    written_exam: Score | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/applicant/dashboard' },
    { title: 'My Grades', href: '/applicant/grades' },
];

function fmt(s: Score | null): string {
    if (!s || s.score === null) return '—';
    return `${s.score} / ${s.max_score}`;
}

function fmtDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function AssessmentMeta({
    evaluatorName,
    academicYear,
    program,
    date,
}: {
    evaluatorName: string | null;
    academicYear?: string | null;
    program?: string;
    date: string | null;
}) {
    return (
        <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
            <p>Evaluator: {evaluatorName ?? '—'}</p>
            {academicYear !== undefined && <p>AY: {academicYear ?? '—'}</p>}
            {program !== undefined && <p>Program: {program}</p>}
            <p>Date: {fmtDate(date)}</p>
        </div>
    );
}

function PortfolioEvalCard({ title, score }: { title: string; score: PortfolioScore | null }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {score ? (
                    <div>
                        <p className="text-2xl font-bold">{score.score} <span className="text-base font-normal text-muted-foreground">/ {score.max_score}</span></p>
                        <AssessmentMeta
                            evaluatorName={score.evaluator_name}
                            date={score.evaluation_date}
                        />
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Not yet evaluated.</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function Grades({ rows, interview, worksite_visit }: { rows: Row[]; interview: PortfolioScore | null; worksite_visit: PortfolioScore | null }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Grades" />
            <div className="space-y-6 p-6">
                <Heading title="My Grades" description="Status and scores across all your assigned subjects." />

                {/* Portfolio-level evaluations */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Portfolio Evaluations</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <PortfolioEvalCard title="Interview" score={interview} />
                        <PortfolioEvalCard title="Worksite Visit" score={worksite_visit} />
                    </div>
                </div>

                {/* Per-subject grades */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Subject Grades</h2>

                    {rows.length === 0 && (
                        <Card><CardContent className="py-10 text-center text-muted-foreground">No subjects assigned yet.</CardContent></Card>
                    )}

                    {rows.length > 0 && (
                        <Card>
                            <CardContent className="overflow-x-auto p-0">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-3 py-3 text-left">Subject</th>
                                            <th className="px-3 py-3 text-left">Pre-Assessment</th>
                                            <th className="px-3 py-3 text-left">Written Exam</th>
                                            <th className="px-3 py-3 text-left">Status</th>
                                            <th className="px-3 py-3 text-left">Recommendation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((r) => (
                                            <tr key={r.id} className="border-b last:border-0">
                                                <td className="px-3 py-3">
                                                    <div className="font-medium">{r.subject.code} {r.subject.name}</div>
                                                    <div className="text-xs text-muted-foreground">{r.subject.academic_year} • {r.subject.units} units</div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <p>{r.pre_assessment?.graded_at ? `${r.pre_assessment.score} / ${r.pre_assessment.max_score}` : (r.pre_assessment?.submitted_at ? 'Submitted' : '—')}</p>
                                                    {r.pre_assessment && (
                                                        <AssessmentMeta
                                                            evaluatorName={r.pre_assessment.evaluator_name}
                                                            academicYear={r.pre_assessment.academic_year}
                                                            program={r.pre_assessment.program}
                                                            date={r.pre_assessment.evaluation_date}
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <p>{fmt(r.written_exam)}</p>
                                                    {r.written_exam && (
                                                        <AssessmentMeta
                                                            evaluatorName={r.written_exam.evaluator_name}
                                                            date={r.written_exam.evaluation_date}
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-3 py-3"><Badge variant="outline">{r.status.replace('_', ' ')}</Badge></td>
                                                <td className="px-3 py-3">{r.recommendation_label ? <Badge>{r.recommendation_label}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

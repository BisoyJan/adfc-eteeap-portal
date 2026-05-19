import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Score {
    score: number | null;
    max_score: number | null;
    submitted_at: string | null;
    evaluation_date: string | null;
    evaluator_name: string | null;
    academic_year: string | null;
    program: string;
}
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
    interview: Score | null;
    worksite_visit: Score | null;
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
    academicYear: string | null;
    program: string;
    date: string | null;
}) {
    return (
        <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
            <p>Evaluator: {evaluatorName ?? '—'}</p>
            <p>AY: {academicYear ?? '—'}</p>
            <p>Program: {program}</p>
            <p>Date: {fmtDate(date)}</p>
        </div>
    );
}

export default function Grades({ rows }: { rows: Row[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Grades" />
            <div className="space-y-6 p-6">
                <Heading title="My Grades" description="Status and scores across all your assigned subjects." />

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
                                        <th className="px-3 py-3 text-left">Interview</th>
                                        <th className="px-3 py-3 text-left">Worksite</th>
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
                                                        academicYear={r.written_exam.academic_year}
                                                        program={r.written_exam.program}
                                                        date={r.written_exam.evaluation_date}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <p>{fmt(r.interview)}</p>
                                                {r.interview && (
                                                    <AssessmentMeta
                                                        evaluatorName={r.interview.evaluator_name}
                                                        academicYear={r.interview.academic_year}
                                                        program={r.interview.program}
                                                        date={r.interview.evaluation_date}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <p>{fmt(r.worksite_visit)}</p>
                                                {r.worksite_visit && (
                                                    <AssessmentMeta
                                                        evaluatorName={r.worksite_visit.evaluator_name}
                                                        academicYear={r.worksite_visit.academic_year}
                                                        program={r.worksite_visit.program}
                                                        date={r.worksite_visit.evaluation_date}
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
        </AppLayout>
    );
}

import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Score { score: number | null; max_score: number | null; submitted_at: string | null }
interface Row {
    id: number;
    subject: { id: number; code: string; name: string; units: number; academic_year: string | null };
    status: string;
    recommendation: string | null;
    recommendation_label: string | null;
    pre_assessment: { attempt_number: number; submitted_at: string | null; score: string | null; max_score: string | null; graded_at: string | null } | null;
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
                                            <td className="px-3 py-3">{r.pre_assessment?.graded_at ? `${r.pre_assessment.score} / ${r.pre_assessment.max_score}` : (r.pre_assessment?.submitted_at ? 'Submitted' : '—')}</td>
                                            <td className="px-3 py-3">{fmt(r.written_exam)}</td>
                                            <td className="px-3 py-3">{fmt(r.interview)}</td>
                                            <td className="px-3 py-3">{fmt(r.worksite_visit)}</td>
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

import { Head } from '@inertiajs/react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Option { value: string; label: string }
interface AcademicYear { id: number; name: string }
interface Subject { id: number; code: string; name: string; units: number; academic_year: AcademicYear | null }
interface Evaluator { id: number; name: string; email: string }
interface PortfolioSubject {
    id: number;
    subject: Subject;
    evaluator: Evaluator | null;
    status: string;
    recommendation: string | null;
    notes: string | null;
}
interface Portfolio {
    id: number;
    title: string;
    user: { id: number; name: string; email: string };
    portfolio_subjects: PortfolioSubject[];
}

interface Props {
    portfolio: Portfolio;
    allSubjects: Subject[];
    evaluators: Evaluator[];
    statuses: Option[];
    recommendations: Option[];
}

export default function PortfolioSubjects({ portfolio, statuses, recommendations }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Portfolios', href: '/admin/portfolios' },
        { title: portfolio.title, href: `/admin/portfolios/${portfolio.id}` },
        { title: 'Subjects', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Portfolio Subjects" />
            <div className="space-y-6 p-6">
                <Heading title="Subject Assignments" description={`Read-only subject assignments for ${portfolio.user.name}'s portfolio.`} />
                <FlashMessages />

                <Card>
                    <CardHeader><CardTitle>Assigned Subjects ({portfolio.portfolio_subjects.length})</CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-2 py-2 text-left">Subject</th>
                                    <th className="px-2 py-2 text-left">Evaluator</th>
                                    <th className="px-2 py-2 text-left">Status</th>
                                    <th className="px-2 py-2 text-left">Recommendation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio.portfolio_subjects.map((row) => (
                                    <tr key={row.id} className="border-b last:border-0">
                                        <td className="px-2 py-3">
                                            <div className="font-medium">{row.subject.code} {row.subject.name}</div>
                                            <div className="text-xs text-muted-foreground">{row.subject.academic_year?.name} • {row.subject.units} units</div>
                                        </td>
                                        <td className="px-2 py-3">
                                            {row.evaluator?.name ?? <span className="text-muted-foreground">Unassigned</span>}
                                        </td>
                                        <td className="px-2 py-3">
                                            <Badge variant="outline">{statuses.find((s) => s.value === row.status)?.label ?? row.status}</Badge>
                                        </td>
                                        <td className="px-2 py-3">
                                            {row.recommendation ? (
                                                <Badge variant="outline">{recommendations.find((r) => r.value === row.recommendation)?.label ?? row.recommendation}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">Not set</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {portfolio.portfolio_subjects.length === 0 && (
                                    <tr><td colSpan={4} className="px-2 py-6 text-center text-muted-foreground">No subjects assigned yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Assignment {
    id: number;
    status: string;
    recommendation: string | null;
    notes: string | null;
    assigned_at: string;
    portfolio: { id: number; title: string; user: { id: number; name: string; email: string } };
    subject: { id: number; code: string; name: string; units: number; academic_year: { name: string } | null };
}

interface Props {
    assignments: { data: Assignment[]; links: unknown[]; current_page: number; last_page: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/evaluator/dashboard' },
    { title: 'Subject Assignments', href: '/evaluator/subjects' },
];

export default function EvaluatorSubjects({ assignments }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subject Assignments" />
            <div className="space-y-6 p-6">
                <Heading title="Subject Assignments" description="Open assigned subjects and complete interviews, worksite visits, written exams, and pre-assessment grading." />

                <Card>
                    <CardContent className="py-5 text-sm text-muted-foreground">
                        Subject enrollment is managed from each applicant portfolio under Assigned Reviews.
                    </CardContent>
                </Card>

                {assignments.data.length === 0 && (
                    <Card><CardContent className="py-10 text-center text-muted-foreground">No subject assignments yet.</CardContent></Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {assignments.data.map((a) => (
                        <Card key={a.id}>
                            <CardContent className="space-y-3 p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-sm font-medium">{a.portfolio.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{a.portfolio.title}</div>
                                    </div>
                                    <Badge variant="outline">{a.status.replace('_', ' ')}</Badge>
                                </div>
                                <div>
                                    <div className="font-semibold">{a.subject.code} {a.subject.name}</div>
                                    <div className="text-xs text-muted-foreground">{a.subject.academic_year?.name} • {a.subject.units} units</div>
                                </div>
                                {a.recommendation && <Badge>{a.recommendation.replace('_', ' ')}</Badge>}
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={`/evaluator/subjects/${a.id}`}>Open <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

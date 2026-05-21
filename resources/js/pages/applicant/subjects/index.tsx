import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, ClipboardList } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface PortfolioSubject {
    id: number;
    status: string;
    recommendation: string | null;
    modules: unknown[];
    subject: {
        id: number;
        code: string;
        name: string;
        units: number;
        academic_year: { name: string } | null;
        pre_assessment_questions: unknown[];
    };
    pre_assessment_attempts: { id: number; attempt_number: number; submitted_at: string | null; score: string | null }[];
}

interface Props { portfolioSubjects: PortfolioSubject[] }

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/applicant/dashboard' },
    { title: 'My Subjects', href: '/applicant/subjects' },
];

export default function ApplicantSubjects({ portfolioSubjects }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Subjects" />
            <div className="space-y-6 p-6">
                <Heading title="My Subjects" description="Subjects assigned to your portfolio. Download modules and take pre-assessments." />

                {portfolioSubjects.length === 0 && (
                    <Card><CardContent className="py-10 text-center text-muted-foreground">No subjects have been assigned to your portfolio yet. An admin will assign subjects once your portfolio is submitted.</CardContent></Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {portfolioSubjects.map((ps) => {
                        const latest = ps.pre_assessment_attempts[0];
                        return (
                            <Card key={ps.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between text-base">
                                        <span>{ps.subject.code} — {ps.subject.name}</span>
                                        <Badge variant="outline">{ps.subject.units} units</Badge>
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">{ps.subject.academic_year?.name}</p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <Badge variant="secondary"><BookOpen className="mr-1 h-3 w-3" /> {ps.modules.length} modules</Badge>
                                        <Badge variant="secondary"><ClipboardList className="mr-1 h-3 w-3" /> {ps.subject.pre_assessment_questions.length} questions</Badge>
                                        <Badge>{ps.status.replace('_', ' ')}</Badge>
                                        {latest && (
                                            <Badge variant={latest.submitted_at ? 'default' : 'outline'}>
                                                Pre-Assessment Attempt #{latest.attempt_number} {latest.submitted_at ? '(submitted)' : '(draft)'}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button asChild className="w-full" variant="outline">
                                        <Link href={`/applicant/subjects/${ps.id}`}>Open <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}

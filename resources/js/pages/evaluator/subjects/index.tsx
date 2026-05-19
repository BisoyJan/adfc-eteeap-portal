import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Plus } from 'lucide-react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface SubjectOption {
    id: number;
    code: string;
    name: string;
    units: number;
    academic_year: { name: string } | null;
}

interface EnrollableApplicant {
    portfolio_id: number;
    portfolio_title: string;
    portfolio_status: string;
    applicant: { id: number; name: string; email: string };
}

interface Props {
    assignments: { data: Assignment[]; links: unknown[]; current_page: number; last_page: number };
    availableSubjects: SubjectOption[];
    enrollableApplicants: EnrollableApplicant[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/evaluator/dashboard' },
    { title: 'Subject Assignments', href: '/evaluator/subjects' },
];

export default function EvaluatorSubjects({ assignments, availableSubjects, enrollableApplicants }: Props) {
    const enrollForm = useForm<{ subject_id: string; portfolio_id: string; notes: string }>({
        subject_id: '',
        portfolio_id: '',
        notes: '',
    });

    const canEnroll = availableSubjects.length > 0 && enrollableApplicants.length > 0;

    function submitEnrollApplicant(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        enrollForm.post('/evaluator/subjects/enroll', {
            preserveScroll: true,
            onSuccess: () => enrollForm.reset('subject_id', 'portfolio_id', 'notes'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subject Assignments" />
            <div className="space-y-6 p-6">
                <Heading title="Subject Assignments" description="Conduct interviews, worksite visits, written exams, and grade pre-assessments per subject." />

                <Card>
                    <CardHeader>
                        <CardTitle>Enroll Applicant to Subject</CardTitle>
                        <CardDescription>
                            You can enroll applicants only after their portfolio has reached the approved or evaluated stage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {canEnroll ? (
                            <form onSubmit={submitEnrollApplicant} className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Select value={enrollForm.data.subject_id} onValueChange={(value) => enrollForm.setData('subject_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSubjects.map((subject) => (
                                                <SelectItem key={subject.id} value={String(subject.id)}>
                                                    {subject.code} {subject.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={enrollForm.errors.subject_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Applicant</Label>
                                    <Select value={enrollForm.data.portfolio_id} onValueChange={(value) => enrollForm.setData('portfolio_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select applicant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {enrollableApplicants.map((item) => (
                                                <SelectItem key={item.portfolio_id} value={String(item.portfolio_id)}>
                                                    {item.applicant.name} - {item.portfolio_title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={enrollForm.errors.portfolio_id} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Notes (optional)</Label>
                                    <textarea
                                        aria-label="Enrollment notes"
                                        rows={3}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={enrollForm.data.notes}
                                        onChange={(e) => enrollForm.setData('notes', e.target.value)}
                                    />
                                    <InputError message={enrollForm.errors.notes} />
                                </div>

                                <div className="md:col-span-2">
                                    <Button type="submit" disabled={enrollForm.processing}>
                                        <Plus className="mr-2 h-4 w-4" /> Enroll Applicant
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No eligible applicants or active subjects are currently available for enrollment.
                            </p>
                        )}
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

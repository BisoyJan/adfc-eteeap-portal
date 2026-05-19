import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Portfolios', href: '/applicant/portfolios' },
    { title: 'Create Portfolio', href: '/applicant/portfolios/create' },
];

interface Category {
    id: number;
    name: string;
    description: string | null;
    is_required: boolean;
}

interface ApplicantInfo {
    name: string;
    current_position: string | null;
    years_it_experience: number | null;
    company: string | null;
    highest_education: string | null;
}

interface Props {
    categories: Category[];
    applicantInfo: ApplicantInfo;
}

const flowSteps = [
    { id: 1, label: 'Upload Required Documents', state: 'current' },
    { id: 2, label: 'Set Portfolio Title', state: 'upcoming' },
    { id: 3, label: 'Submit Portfolio', state: 'upcoming' },
] as const;

export default function Create({ categories, applicantInfo }: Props) {
    const form = useForm({});

    const requiredCategories = categories.filter((category) => category.is_required);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post('/applicant/portfolios');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Portfolio" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Create Portfolio"
                    description="Upload required documents first, then set your portfolio title"
                />

                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Application Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ol className="grid gap-2 sm:grid-cols-3">
                            {flowSteps.map((step) => (
                                <li
                                    key={step.id}
                                    className={`rounded-md border px-3 py-2 ${step.state === 'current'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted bg-muted/30'
                                        }`}
                                >
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        Step {step.id}
                                    </p>
                                    <p className="text-sm font-medium">{step.label}</p>
                                </li>
                            ))}
                        </ol>
                        <p className="text-xs text-muted-foreground">
                            Step 1 begins after you click Start Uploading Documents.
                        </p>
                    </CardContent>
                </Card>

                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Applicant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="text-sm font-medium">{applicantInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Current Position</p>
                            <p className="text-sm font-medium">{applicantInfo.current_position ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Years of IT Experience</p>
                            <p className="text-sm font-medium">{applicantInfo.years_it_experience ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Company / Organization</p>
                            <p className="text-sm font-medium">{applicantInfo.company ?? '—'}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground">Highest Educational Attainment</p>
                            <p className="text-sm font-medium">{applicantInfo.highest_education ?? '—'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Required Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {requiredCategories.length > 0 ? (
                            requiredCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="rounded-md border px-3 py-2"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium">{category.name}</p>
                                        <Badge variant="destructive" className="text-[10px]">
                                            Required
                                        </Badge>
                                    </div>
                                    {category.description && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {category.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No required documents configured yet.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Start Application</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                Your application draft will be created with a temporary title.
                                You can set the final portfolio title after all required documents are uploaded.
                            </p>

                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    Start Uploading Documents
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/applicant/portfolios">
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

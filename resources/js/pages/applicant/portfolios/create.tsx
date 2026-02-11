import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Portfolios', href: '/applicant/portfolios' },
    { title: 'Create Portfolio', href: '/applicant/portfolios/create' },
];

export default function Create() {
    const form = useForm({
        title: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post('/applicant/portfolios');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Portfolio" />

            <div className="space-y-6 p-6">
                <Heading title="Create Portfolio" description="Start building your ETEEAP portfolio" />

                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Portfolio Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="e.g., BSIT Portfolio - 2026"
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    Give your portfolio a descriptive title (e.g., &ldquo;BSIT Portfolio - 2026&rdquo;)
                                </p>
                                <InputError message={form.errors.title} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={form.processing}>
                                    Create Portfolio
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/applicant/portfolios">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

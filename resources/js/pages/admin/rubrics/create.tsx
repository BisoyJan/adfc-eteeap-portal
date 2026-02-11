import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
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
    { title: 'Rubric Criteria', href: '/admin/rubrics' },
    { title: 'Create', href: '/admin/rubrics/create' },
];

export default function Create() {
    const form = useForm({
        name: '',
        description: '',
        max_score: 10,
        sort_order: 0,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/rubrics');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Rubric Criteria" />

            <div className="space-y-6 p-6">
                <Heading title="Create Rubric Criteria" description="Add a new evaluation rubric criteria" />

                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Criteria Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Criteria name"
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Optional description"
                                    rows={3}
                                />
                                <InputError message={form.errors.description} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="max_score">Max Score</Label>
                                    <Input
                                        id="max_score"
                                        type="number"
                                        min={1}
                                        value={form.data.max_score}
                                        onChange={(e) => form.setData('max_score', parseInt(e.target.value) || 0)}
                                    />
                                    <InputError message={form.errors.max_score} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Sort Order</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min={0}
                                        value={form.data.sort_order}
                                        onChange={(e) => form.setData('sort_order', parseInt(e.target.value) || 0)}
                                    />
                                    <InputError message={form.errors.sort_order} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={form.processing}>
                                    Create Criteria
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/rubrics">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

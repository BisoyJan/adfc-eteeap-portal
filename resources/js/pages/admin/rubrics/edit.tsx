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

interface Props {
    criteria: {
        id: number;
        name: string;
        description: string | null;
        max_score: number;
        sort_order: number;
        is_active: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rubric Criteria', href: '/admin/rubrics' },
    { title: 'Edit', href: '#' },
];

export default function Edit({ criteria }: Props) {
    const form = useForm({
        name: criteria.name,
        description: criteria.description ?? '',
        max_score: criteria.max_score,
        sort_order: criteria.sort_order,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.put(`/admin/rubrics/${criteria.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Rubric Criteria" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Edit Rubric Criteria"
                    description="Update evaluation rubric criteria details"
                />

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
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    placeholder="Criteria name"
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
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
                                        onChange={(e) =>
                                            form.setData(
                                                'max_score',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.max_score}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">
                                        Sort Order
                                    </Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min={0}
                                        value={form.data.sort_order}
                                        onChange={(e) =>
                                            form.setData(
                                                'sort_order',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.sort_order}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    Update Criteria
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

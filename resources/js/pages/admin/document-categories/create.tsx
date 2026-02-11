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
    { title: 'Document Categories', href: '/admin/document-categories' },
    { title: 'Create', href: '/admin/document-categories/create' },
];

export default function Create() {
    const form = useForm({
        name: '',
        description: '',
        is_required: true,
        sort_order: 0,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/document-categories');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Document Category" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Create Document Category"
                    description="Add a new document category for portfolio submissions"
                />

                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
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
                                    placeholder="Category name (e.g., Transcript of Records)"
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
                                    placeholder="Optional description to guide applicants"
                                    rows={3}
                                />
                                <InputError message={form.errors.description} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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

                                <div className="flex items-center gap-3 pt-7">
                                    <input
                                        id="is_required"
                                        type="checkbox"
                                        title="Indicates whether this document category is required for portfolio submission"
                                        className="h-4 w-4 rounded border-gray-300"
                                        checked={form.data.is_required}
                                        onChange={(e) =>
                                            form.setData(
                                                'is_required',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <Label htmlFor="is_required">
                                        Required for submission
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    Create Category
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/document-categories">
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

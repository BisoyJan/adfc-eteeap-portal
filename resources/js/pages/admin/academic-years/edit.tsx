import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Props {
    academicYear: {
        id: number;
        name: string;
        start_date: string;
        end_date: string;
        is_active: boolean;
        notes: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Academic Years', href: '/admin/academic-years' },
    { title: 'Edit', href: '#' },
];

export default function Edit({ academicYear }: Props) {
    const form = useForm({
        name: academicYear.name,
        start_date: academicYear.start_date,
        end_date: academicYear.end_date,
        is_active: academicYear.is_active,
        notes: academicYear.notes ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.put(`/admin/academic-years/${academicYear.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Academic Year" />
            <div className="space-y-6 p-6">
                <Heading title="Edit Academic Year" description="Update academic year details" />
                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Academic Year Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                <InputError message={form.errors.name} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input id="start_date" type="date" value={form.data.start_date} onChange={(e) => form.setData('start_date', e.target.value)} />
                                    <InputError message={form.errors.start_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input id="end_date" type="date" value={form.data.end_date} onChange={(e) => form.setData('end_date', e.target.value)} />
                                    <InputError message={form.errors.end_date} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    aria-label="Notes"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                />
                                <InputError message={form.errors.notes} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" checked={form.data.is_active} onCheckedChange={(v) => form.setData('is_active', !!v)} />
                                <Label htmlFor="is_active" className="cursor-pointer">Set as active academic year</Label>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={form.processing}>Update</Button>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/academic-years">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface AcademicYear {
    id: number;
    name: string;
    is_active: boolean;
}

interface Props {
    academicYears: AcademicYear[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Subjects', href: '/admin/subjects' },
    { title: 'Create', href: '/admin/subjects/create' },
];

export default function Create({ academicYears }: Props) {
    const activeYear = academicYears.find((y) => y.is_active) ?? academicYears[0];
    const form = useForm({
        academic_year_id: activeYear ? String(activeYear.id) : '',
        code: '',
        name: '',
        description: '',
        units: 3,
        is_active: true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/subjects');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Subject" />
            <div className="space-y-6 p-6">
                <Heading title="Add Subject" description="Create a new subject under an academic year" />
                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Subject Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="academic_year_id">Academic Year</Label>
                                <Select value={form.data.academic_year_id} onValueChange={(v) => form.setData('academic_year_id', v)}>
                                    <SelectTrigger id="academic_year_id">
                                        <SelectValue placeholder="Select academic year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((y) => (
                                            <SelectItem key={y.id} value={String(y.id)}>
                                                {y.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.academic_year_id} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input id="code" value={form.data.code} onChange={(e) => form.setData('code', e.target.value)} placeholder="IT101" />
                                    <InputError message={form.errors.code} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="units">Units</Label>
                                    <Input id="units" type="number" min={1} max={12} value={form.data.units} onChange={(e) => form.setData('units', parseInt(e.target.value) || 0)} />
                                    <InputError message={form.errors.units} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Introduction to Programming" />
                                <InputError message={form.errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    aria-label="Description"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                />
                                <InputError message={form.errors.description} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" checked={form.data.is_active} onCheckedChange={(v) => form.setData('is_active', !!v)} />
                                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={form.processing}>Create</Button>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/subjects">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Props {
    targetRoles: Array<{ value: string; label: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Announcements', href: '/admin/announcements' },
    { title: 'New Announcement', href: '/admin/announcements/create' },
];

export default function Create({ targetRoles }: Props) {
    const form = useForm({
        title: '',
        body: '',
        target_role: 'all',
        is_published: false,
        expires_at: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post('/admin/announcements');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Announcement" />

            <div className="space-y-6 p-6">
                <Heading
                    title="New Announcement"
                    description="Create a program-wide announcement for learners or evaluators"
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Announcement Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="Announcement title"
                                />
                                <InputError message={form.errors.title} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="body">Message</Label>
                                <textarea
                                    id="body"
                                    rows={6}
                                    value={form.data.body}
                                    onChange={(e) => form.setData('body', e.target.value)}
                                    placeholder="Write your announcement here..."
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <InputError message={form.errors.body} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Audience</Label>
                                <Select
                                    value={form.data.target_role}
                                    onValueChange={(v) => form.setData('target_role', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {targetRoles.map((r) => (
                                            <SelectItem key={r.value} value={r.value}>
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.target_role} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="expires_at">Expiry Date (optional)</Label>
                                <Input
                                    id="expires_at"
                                    type="datetime-local"
                                    value={form.data.expires_at}
                                    onChange={(e) => form.setData('expires_at', e.target.value)}
                                />
                                <InputError message={form.errors.expires_at} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="is_published"
                                    type="checkbox"
                                    checked={form.data.is_published}
                                    onChange={(e) => form.setData('is_published', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                    aria-label="Publish immediately"
                                />
                                <Label htmlFor="is_published">Publish immediately</Label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={form.processing}>
                                    {form.data.is_published ? 'Publish' : 'Save as Draft'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/announcements">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

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

interface Announcement {
    id: number;
    title: string;
    body: string;
    target_role: string;
    is_published: boolean;
    expires_at: string | null;
}

interface Props {
    announcement: Announcement;
    targetRoles: Array<{ value: string; label: string }>;
}

export default function Edit({ announcement, targetRoles }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Announcements', href: '/admin/announcements' },
        { title: 'Edit', href: `/admin/announcements/${announcement.id}/edit` },
    ];

    const form = useForm({
        title: announcement.title,
        body: announcement.body,
        target_role: announcement.target_role,
        is_published: announcement.is_published,
        expires_at: announcement.expires_at
            ? announcement.expires_at.slice(0, 16)
            : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(`/admin/announcements/${announcement.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Announcement" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Edit Announcement"
                    description="Update the announcement details"
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
                                        <SelectValue />
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
                                    aria-label="Published"
                                />
                                <Label htmlFor="is_published">Published</Label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={form.processing}>
                                    Save Changes
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

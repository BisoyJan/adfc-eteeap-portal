import { Head, router, useForm } from '@inertiajs/react';
import { Download, Trash2, Upload } from 'lucide-react';
import { useRef, type FormEvent } from 'react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Subject { id: number; code: string; name: string; academic_year: { id: number; name: string } | null }
interface Module {
    id: number;
    title: string;
    description: string | null;
    file_name: string;
    file_size: number;
    uploader: { id: number; name: string } | null;
    created_at: string;
}
interface Props { subject: Subject; modules: Module[] }

export default function SubjectModules({ subject, modules }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Subjects', href: '/admin/subjects' },
        { title: `${subject.code} ${subject.name}`, href: '#' },
        { title: 'Modules', href: '#' },
    ];

    const fileRef = useRef<HTMLInputElement>(null);
    const form = useForm<{ title: string; description: string; file: File | null }>({ title: '', description: '', file: null });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post(`/admin/subjects/${subject.id}/modules`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    }

    function destroy(id: number) {
        if (!confirm('Delete this module?')) return;
        router.delete(`/admin/subjects/${subject.id}/modules/${id}`, { preserveScroll: true });
    }

    function fmtSize(b: number) { return b < 1024 ? `${b} B` : b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/1024/1024).toFixed(1)} MB` }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subject Modules" />
            <div className="space-y-6 p-6">
                <Heading title={`Modules — ${subject.code} ${subject.name}`} description={subject.academic_year?.name ?? ''} />
                <FlashMessages />

                <Card>
                    <CardHeader><CardTitle>Upload Module</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} required />
                                <InputError message={form.errors.title} />
                            </div>
                            <div className="space-y-2">
                                <Label>File (max 50 MB)</Label>
                                <Input ref={fileRef} type="file" onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)} required />
                                <InputError message={form.errors.file} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Description</Label>
                                <textarea aria-label="Description" rows={2} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                                <InputError message={form.errors.description} />
                            </div>
                            <div className="md:col-span-2">
                                <Button type="submit" disabled={form.processing}>
                                    <Upload className="mr-2 h-4 w-4" /> Upload
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Modules ({modules.length})</CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-2 py-2 text-left">Title</th>
                                    <th className="px-2 py-2 text-left">File</th>
                                    <th className="px-2 py-2 text-left">Size</th>
                                    <th className="px-2 py-2 text-left">Uploaded By</th>
                                    <th className="px-2 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {modules.map((m) => (
                                    <tr key={m.id} className="border-b last:border-0">
                                        <td className="px-2 py-3">
                                            <div className="font-medium">{m.title}</div>
                                            {m.description && <div className="text-xs text-muted-foreground">{m.description}</div>}
                                        </td>
                                        <td className="px-2 py-3">{m.file_name}</td>
                                        <td className="px-2 py-3">{fmtSize(m.file_size)}</td>
                                        <td className="px-2 py-3">{m.uploader?.name ?? '—'}</td>
                                        <td className="px-2 py-3 text-right space-x-1">
                                            <Button variant="ghost" size="sm" asChild>
                                                <a aria-label="Download module" href={`/admin/subjects/${subject.id}/modules/${m.id}/download`}><Download className="h-4 w-4" /></a>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => destroy(m.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {modules.length === 0 && (
                                    <tr><td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">No modules uploaded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

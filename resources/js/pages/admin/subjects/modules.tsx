import { Head } from '@inertiajs/react';
import { Download } from 'lucide-react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    function fmtSize(b: number) { return b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB` }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subject Modules" />
            <div className="space-y-6 p-6">
                <Heading
                    title={`Modules — ${subject.code} ${subject.name}`}
                    description={`${subject.academic_year?.name ?? ''} · Admin view is read-only`}
                />
                <FlashMessages />

                <Card>
                    <CardHeader><CardTitle>Access Mode</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Subject module management is handled by evaluators. Admin users can view and download files only.
                        </p>
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
                                    <th className="px-2 py-2 text-right">Download</th>
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
                                        <td className="px-2 py-3 text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <a aria-label="Download module" href={`/admin/subjects/${subject.id}/modules/${m.id}/download`}><Download className="h-4 w-4" /></a>
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

import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Announcement {
    id: number;
    title: string;
    target_role: string;
    is_published: boolean;
    published_at: string | null;
    expires_at: string | null;
    author: { id: number; name: string };
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    announcements: {
        data: Announcement[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    targetRoles: Array<{ value: string; label: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Announcements', href: '/admin/announcements' },
];

function formatDate(dateString: string | null): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function roleBadge(role: string) {
    const map: Record<string, string> = {
        all: 'bg-purple-100 text-purple-700',
        applicant: 'bg-blue-100 text-blue-700',
        evaluator: 'bg-indigo-100 text-indigo-700',
    };
    const label = role.charAt(0).toUpperCase() + role.slice(1);
    return (
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${map[role] ?? 'bg-gray-100 text-gray-700'}`}>
            {label}
        </span>
    );
}

export default function Index({ announcements }: Props) {
    const [toDelete, setToDelete] = useState<Announcement | null>(null);

    function handleDelete(item: Announcement) {
        setToDelete(item);
    }

    function confirmDelete() {
        if (!toDelete) return;
        router.delete(`/admin/announcements/${toDelete.id}`, {
            preserveScroll: true,
            onFinish: () => setToDelete(null),
        });
    }

    function togglePublish(item: Announcement) {
        router.post(`/admin/announcements/${item.id}/toggle-publish`, {}, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Announcements"
                        description="Manage program-wide announcements for learners and evaluators"
                    />
                    <Button asChild>
                        <Link href="/admin/announcements/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Announcement
                        </Link>
                    </Button>
                </div>

                <FlashMessages />

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Title</th>
                                <th className="px-4 py-3 text-left font-medium">Audience</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Published</th>
                                <th className="px-4 py-3 text-left font-medium">Expires</th>
                                <th className="px-4 py-3 text-left font-medium">Author</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {announcements.data.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3 font-medium">{item.title}</td>
                                    <td className="px-4 py-3">{roleBadge(item.target_role)}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={item.is_published ? 'default' : 'secondary'}>
                                            {item.is_published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{formatDate(item.published_at)}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{formatDate(item.expires_at)}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.author.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => togglePublish(item)}
                                                title={item.is_published ? 'Unpublish' : 'Publish'}
                                            >
                                                {item.is_published ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/announcements/${item.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(item)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {announcements.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        No announcements yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {announcements.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {announcements.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{toDelete?.title}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

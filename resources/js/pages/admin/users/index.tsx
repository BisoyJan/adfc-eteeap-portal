import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, Pencil, Trash2, UserCheck, UserX, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    users: {
        data: User[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    roles: Array<{ value: string; label: string }>;
    evaluators: Array<{ id: number; name: string }>;
    filters: { search: string; role: string; status: string; evaluator_id: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/admin/users' },
];

const roleBadgeVariant: Record<
    string,
    'destructive' | 'default' | 'secondary' | 'outline'
> = {
    admin: 'default',
    evaluator: 'secondary',
    applicant: 'outline',
};

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatRole(role: string): string {
    return role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function Index({ users, roles, evaluators, filters }: Props) {
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [search, setSearch] = useState(filters.search);

    function handleFilter(key: string, value: string) {
        router.get('/admin/users', { ...filters, [key]: value }, { preserveState: true, replace: true });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        handleFilter('search', search);
    }

    function handleDelete(user: User) {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    }

    function handleConfirmDelete() {
        if (!userToDelete) {
            return;
        }

        router.delete(`/admin/users/${userToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Users" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Users"
                        description="Manage system users and their roles"
                    />
                    <Button asChild>
                        <Link href="/admin/users/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create User
                        </Link>
                    </Button>
                </div>

                <FlashMessages />

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Search name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64"
                        />
                        <Button type="submit" variant="outline" size="sm">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                    <Select value={filters.role || 'all'} onValueChange={(v) => handleFilter('role', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {roles.map((r) => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.evaluator_id || 'all'} onValueChange={(v) => handleFilter('evaluator_id', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by Assessor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Assessors</SelectItem>
                            {evaluators.map((e) => (
                                <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Email</th>
                                <th className="px-4 py-3 text-left font-medium">Role</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Created At</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={roleBadgeVariant[user.role] ?? 'outline'}>
                                            {formatRole(user.role)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{formatDate(user.created_at)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/users/${user.id}`}>
                                                    <Eye className="mr-1 h-4 w-4" />View
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/users/${user.id}/edit`}>
                                                    <Pencil className="mr-1 h-4 w-4" />Edit
                                                </Link>
                                            </Button>
                                            {user.is_active ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-amber-600 hover:text-amber-700"
                                                    onClick={() => router.post(`/admin/users/${user.id}/deactivate`, {}, { preserveScroll: true })}
                                                >
                                                    <UserX className="mr-1 h-4 w-4" />Deactivate
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-green-600 hover:text-green-700"
                                                    onClick={() => router.post(`/admin/users/${user.id}/activate`, {}, { preserveScroll: true })}
                                                >
                                                    <UserCheck className="mr-1 h-4 w-4" />Activate
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(user)}
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" />Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {users.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {users.current_page} of {users.last_page}
                        </p>
                        <div className="flex gap-2">
                            {users.links[0]?.url ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={users.links[0].url}>
                                        &larr; Previous
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    &larr; Previous
                                </Button>
                            )}
                            {users.links[users.links.length - 1]?.url ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={
                                            users.links[users.links.length - 1]
                                                .url!
                                        }
                                    >
                                        Next &rarr;
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    Next &rarr;
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open: boolean) => {
                    setDeleteDialogOpen(open);
                    if (!open) {
                        setUserToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {userToDelete
                                ? `"${userToDelete.name}" will be permanently removed.`
                                : 'This user will be permanently removed.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

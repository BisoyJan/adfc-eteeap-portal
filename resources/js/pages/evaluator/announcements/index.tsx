import { Head, router } from '@inertiajs/react';
import { Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Announcement {
    id: number;
    title: string;
    body: string;
    published_at: string | null;
    expires_at: string | null;
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
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/evaluator/dashboard' },
    { title: 'Announcements', href: '/evaluator/announcements' },
];

function formatDate(dateString: string | null): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function Index({ announcements }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading
                    title="Announcements"
                    description="Program-wide announcements from the administration"
                />

                {announcements.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                        <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-muted-foreground">No announcements at this time.</p>
                        <p className="mt-1 text-xs text-muted-foreground">Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.data.map((item) => (
                            <Card key={item.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-base">{item.title}</CardTitle>
                                        {item.published_at && (
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {formatDate(item.published_at)}
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-line text-sm text-muted-foreground">{item.body}</p>
                                    {item.expires_at && (
                                        <p className="mt-3 text-xs text-muted-foreground">
                                            Expires: {formatDate(item.expires_at)}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

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
        </AppLayout>
    );
}

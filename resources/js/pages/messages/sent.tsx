import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Message {
    id: number;
    subject: string;
    created_at: string;
    replies_count: number;
    receiver: {
        id: number;
        name: string;
        role: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    messages: {
        data: Message[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Sent', href: '/messages/sent' },
];

function timeAgo(dateString: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SentPage({ messages }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sent Messages" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Sent Messages" description="Messages you have sent" />
                    <Button asChild>
                        <Link href="/messages/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Compose
                        </Link>
                    </Button>
                </div>

                <FlashMessages />

                {/* Navigation tabs */}
                <div className="flex gap-1 border-b">
                    <Link
                        href="/messages/inbox"
                        className="flex items-center gap-2 border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        <Inbox className="h-4 w-4" />
                        Inbox
                    </Link>
                    <Link
                        href="/messages/sent"
                        className="flex items-center gap-2 border-b-2 border-primary px-4 py-2 text-sm font-medium text-primary"
                    >
                        <Send className="h-4 w-4" />
                        Sent
                    </Link>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {messages.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <Send className="h-10 w-10 text-muted-foreground/40" />
                                <p className="text-muted-foreground">No sent messages yet.</p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/messages/create">Compose</Link>
                                </Button>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {messages.data.map((msg) => (
                                    <li key={msg.id}>
                                        <Link
                                            href={`/messages/${msg.id}`}
                                            className="flex items-start gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                                        >
                                            <Send className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-medium">
                                                        To: {msg.receiver.name}
                                                        <span className="ml-1 text-xs font-normal text-muted-foreground capitalize">
                                                            ({msg.receiver.role})
                                                        </span>
                                                    </p>
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        {timeAgo(msg.created_at)}
                                                    </span>
                                                </div>
                                                <p className="truncate text-sm text-muted-foreground">{msg.subject}</p>
                                                {msg.replies_count > 0 && (
                                                    <p className="text-xs text-muted-foreground">{msg.replies_count} repl{msg.replies_count > 1 ? 'ies' : 'y'}</p>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {messages.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {messages.links.map((link, i) => (
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

import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Send, Plus, Mail, MailOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Message {
    id: number;
    subject: string;
    read_at: string | null;
    created_at: string;
    replies_count: number;
    sender: {
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
    unreadCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inbox', href: '/messages/inbox' },
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

export default function InboxPage({ messages, unreadCount }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inbox" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Inbox"
                        description={unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
                    />
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
                        className="flex items-center gap-2 border-b-2 border-primary px-4 py-2 text-sm font-medium text-primary"
                    >
                        <Inbox className="h-4 w-4" />
                        Inbox
                        {unreadCount > 0 && (
                            <Badge className="ml-1 h-5 px-1.5 text-xs">{unreadCount}</Badge>
                        )}
                    </Link>
                    <Link
                        href="/messages/sent"
                        className="flex items-center gap-2 border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        <Send className="h-4 w-4" />
                        Sent
                    </Link>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {messages.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <Inbox className="h-10 w-10 text-muted-foreground/40" />
                                <p className="text-muted-foreground">Your inbox is empty.</p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/messages/create">Send a Message</Link>
                                </Button>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {messages.data.map((msg) => (
                                    <li key={msg.id}>
                                        <Link
                                            href={`/messages/${msg.id}`}
                                            className={`flex items-start gap-4 px-4 py-3 transition-colors hover:bg-muted/50 ${!msg.read_at ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                                        >
                                            <div className="mt-0.5 shrink-0">
                                                {msg.read_at ? (
                                                    <MailOpen className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Mail className="h-4 w-4 text-blue-500" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`truncate text-sm ${!msg.read_at ? 'font-semibold' : 'font-medium'}`}>
                                                        {msg.sender.name}
                                                        <span className="ml-1 text-xs font-normal text-muted-foreground capitalize">
                                                            ({msg.sender.role})
                                                        </span>
                                                    </p>
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        {timeAgo(msg.created_at)}
                                                    </span>
                                                </div>
                                                <p className={`truncate text-sm ${!msg.read_at ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                                    {msg.subject}
                                                </p>
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

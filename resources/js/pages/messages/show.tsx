import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Paperclip, Download, Reply } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import FlashMessages from '@/components/flash-messages';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Attachment {
    id: number;
    file_name: string;
    file_size: number;
    mime_type: string;
}

interface MessageThread {
    id: number;
    subject: string;
    body: string;
    read_at: string | null;
    created_at: string;
    sender: { id: number; name: string; role: string };
    receiver: { id: number; name: string; role: string };
    attachments: Attachment[];
    replies: Array<{
        id: number;
        body: string;
        created_at: string;
        sender: { id: number; name: string; role: string };
        attachments: Attachment[];
    }>;
}

interface Props {
    message: MessageThread;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inbox', href: '/messages/inbox' },
    { title: 'Message', href: '#' },
];

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ShowPage({ message }: Props) {
    const [showReply, setShowReply] = useState(false);
    const form = useForm({ body: '' });

    function submitReply(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/messages/${message.id}/reply`, {
            onSuccess: () => {
                form.reset();
                setShowReply(false);
            },
        });
    }

    function handleDelete() {
        router.delete(`/messages/${message.id}`, {
            onSuccess: () => router.visit('/messages/inbox'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={message.subject} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/messages/inbox">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Inbox
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowReply(!showReply)}>
                            <Reply className="mr-1 h-4 w-4" />
                            Reply
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>

                <FlashMessages />

                <Heading title={message.subject} description="" />

                {/* Original Message */}
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between pb-3">
                        <div>
                            <p className="font-medium">{message.sender.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {message.sender.role} → {message.receiver.name}
                            </p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDateTime(message.created_at)}</span>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-sm">{message.body}</p>

                        {message.attachments.length > 0 && (
                            <div className="mt-4 space-y-2 border-t pt-4">
                                <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                    <Paperclip className="h-3 w-3" />
                                    Attachments
                                </p>
                                {message.attachments.map((att) => (
                                    <div key={att.id} className="flex items-center justify-between rounded border bg-muted/30 px-3 py-2">
                                        <div>
                                            <p className="text-sm font-medium">{att.file_name}</p>
                                            <p className="text-xs text-muted-foreground">{formatFileSize(att.file_size)}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={`/messages/attachments/${att.id}/download`} title={`Download ${att.file_name}`}>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Replies */}
                {message.replies.length > 0 && (
                    <div className="space-y-3 pl-6">
                        {message.replies.map((reply) => (
                            <Card key={reply.id} className="border-l-4 border-l-muted">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div>
                                        <p className="text-sm font-medium">{reply.sender.name}</p>
                                        <Badge variant="secondary" className="mt-0.5 text-xs capitalize">{reply.sender.role}</Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{formatDateTime(reply.created_at)}</span>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-sm">{reply.body}</p>
                                    {reply.attachments.length > 0 && (
                                        <div className="mt-3 space-y-1 border-t pt-3">
                                            {reply.attachments.map((att) => (
                                                <div key={att.id} className="flex items-center justify-between rounded bg-muted/30 px-2 py-1">
                                                    <span className="text-sm">{att.file_name}</span>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={`/messages/attachments/${att.id}/download`} title={`Download ${att.file_name}`}>
                                                            <Download className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Reply Form */}
                {showReply && (
                    <Card>
                        <CardHeader>
                            <p className="font-medium">Reply</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitReply} className="space-y-4">
                                <div>
                                    <textarea
                                        rows={5}
                                        value={form.data.body}
                                        onChange={(e) => form.setData('body', e.target.value)}
                                        placeholder="Write your reply..."
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                    <InputError message={form.errors.body} />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={form.processing}>
                                        Send Reply
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowReply(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

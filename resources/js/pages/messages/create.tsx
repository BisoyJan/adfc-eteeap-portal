import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Paperclip, X } from 'lucide-react';
import { type FormEventHandler, useRef } from 'react';
import FlashMessages from '@/components/flash-messages';
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

interface Recipient {
    id: number;
    name: string;
    role: string;
    email: string;
}

interface MessageTemplate {
    id: number;
    title: string;
    subject: string;
    body: string;
}

interface Props {
    recipients: Recipient[];
    preselectedId: number | null;
    templates: MessageTemplate[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inbox', href: '/messages/inbox' },
    { title: 'Compose', href: '/messages/create' },
];

function formatRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function CreatePage({ recipients, preselectedId, templates }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<{
        receiver_id: string;
        subject: string;
        body: string;
        attachments: File[];
    }>({
        receiver_id: preselectedId ? String(preselectedId) : '',
        subject: '',
        body: '',
        attachments: [],
    });

    const saveTemplateForm = useForm<{
        title: string;
        subject: string;
        body: string;
    }>({
        title: '',
        subject: '',
        body: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('receiver_id', form.data.receiver_id);
        data.append('subject', form.data.subject);
        data.append('body', form.data.body);
        form.data.attachments.forEach((file) => {
            data.append('attachments[]', file);
        });

        form.post('/messages', {
            forceFormData: true,
        });
    };

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        form.setData('attachments', [...form.data.attachments, ...files]);
    }

    function removeFile(index: number) {
        form.setData(
            'attachments',
            form.data.attachments.filter((_, i) => i !== index),
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compose Message" />

            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/messages/inbox">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <Heading title="Compose Message" description="" />
                </div>

                <FlashMessages />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>New Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label>To</Label>
                                <Select
                                    value={form.data.receiver_id}
                                    onValueChange={(v) => form.setData('receiver_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select recipient..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recipients.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.name} — {formatRole(r.role)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.receiver_id} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Use Template</Label>
                                <Select
                                    onValueChange={(val) => {
                                        const tpl = templates.find((t) => String(t.id) === val);
                                        if (tpl) {
                                            form.setData({
                                                ...form.data,
                                                subject: tpl.subject,
                                                body: tpl.body,
                                            });
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a template (optional)..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.length === 0 ? (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">No saved templates</div>
                                        ) : (
                                            templates.map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.title}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={form.data.subject}
                                    onChange={(e) => form.setData('subject', e.target.value)}
                                    placeholder="Message subject"
                                />
                                <InputError message={form.errors.subject} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="body">Message</Label>
                                <textarea
                                    id="body"
                                    rows={8}
                                    value={form.data.body}
                                    onChange={(e) => form.setData('body', e.target.value)}
                                    placeholder="Write your message..."
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <InputError message={form.errors.body} />
                            </div>

                            {/* Save as Template */}
                            {(form.data.subject || form.data.body) && (
                                <div className="rounded-md border border-dashed p-3 space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">Save current subject &amp; body as a template</p>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Template name..."
                                            value={saveTemplateForm.data.title}
                                            onChange={(e) => saveTemplateForm.setData('title', e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={!saveTemplateForm.data.title || saveTemplateForm.processing}
                                            onClick={() => {
                                                saveTemplateForm.setData({
                                                    title: saveTemplateForm.data.title,
                                                    subject: form.data.subject,
                                                    body: form.data.body,
                                                });
                                                saveTemplateForm.post('/message-templates', {
                                                    preserveScroll: true,
                                                    onSuccess: () => saveTemplateForm.reset(),
                                                });
                                            }}
                                        >
                                            Save Template
                                        </Button>
                                    </div>
                                    <InputError message={saveTemplateForm.errors.title} />
                                </div>
                            )}

                            {/* Attachments */}
                            <div className="space-y-2">
                                <Label>Attachments (optional)</Label>
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        className="hidden"
                                        aria-label="Attach files"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip className="mr-1.5 h-4 w-4" />
                                        Attach Files
                                    </Button>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        PDF, Word, or images · Max 5 MB each
                                    </p>
                                </div>

                                {form.data.attachments.length > 0 && (
                                    <ul className="space-y-1">
                                        {form.data.attachments.map((file, i) => (
                                            <li key={i} className="flex items-center justify-between rounded border bg-muted/30 px-3 py-1.5">
                                                <span className="text-sm">{file.name}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-auto p-0 text-muted-foreground"
                                                    onClick={() => removeFile(i)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={form.processing}>
                                    Send Message
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/messages/inbox">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

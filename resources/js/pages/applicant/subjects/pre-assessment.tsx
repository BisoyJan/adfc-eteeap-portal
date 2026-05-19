import { Head, useForm } from '@inertiajs/react';
import { Save, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import FlashMessages from '@/components/flash-messages';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Question { id: number; question: string; sort_order: number }
interface Answer { id: number; question_id: number; answer: string | null }
interface Props {
    portfolioSubject: {
        id: number;
        subject: { id: number; code: string; name: string; pre_assessment_questions: Question[] };
    };
    attempt: {
        id: number;
        attempt_number: number;
        narrative: string | null;
        submitted_at: string | null;
        answers: Answer[];
    };
    readOnly: boolean;
}

export default function PreAssessment({ portfolioSubject, attempt, readOnly }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Subjects', href: '/applicant/subjects' },
        { title: `${portfolioSubject.subject.code} ${portfolioSubject.subject.name}`, href: `/applicant/subjects/${portfolioSubject.id}` },
        { title: `Pre-Assessment Attempt #${attempt.attempt_number}`, href: '#' },
    ];

    const initialAnswers: Record<number, string> = {};
    portfolioSubject.subject.pre_assessment_questions.forEach((q) => {
        const existing = attempt.answers.find((a) => a.question_id === q.id);
        initialAnswers[q.id] = existing?.answer ?? '';
    });

    const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers);
    const form = useForm<{ narrative: string; answers: { question_id: number; answer: string }[]; submit: boolean }>({
        narrative: attempt.narrative ?? '',
        answers: [],
        submit: false,
    });

    function buildPayload(submit: boolean) {
        form.transform((data) => ({
            ...data,
            submit,
            answers: portfolioSubject.subject.pre_assessment_questions.map((q) => ({
                question_id: q.id,
                answer: answers[q.id] ?? '',
            })),
        }));
    }

    function save(e: FormEvent) {
        e.preventDefault();
        buildPayload(false);
        form.put(`/applicant/subjects/${portfolioSubject.id}/pre-assessment/${attempt.id}`, { preserveScroll: true });
    }

    function submit() {
        if (!confirm('Submit this pre-assessment? You will be able to start a new attempt later but not edit this one.')) return;
        buildPayload(true);
        form.put(`/applicant/subjects/${portfolioSubject.id}/pre-assessment/${attempt.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pre-Assessment" />
            <div className="space-y-6 p-6">
                <Heading title={`Pre-Assessment — Attempt #${attempt.attempt_number}`} description={`${portfolioSubject.subject.code} ${portfolioSubject.subject.name}`} />
                <FlashMessages />

                <form onSubmit={save} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Questions</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {portfolioSubject.subject.pre_assessment_questions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No questions defined for this subject yet.</p>
                            ) : portfolioSubject.subject.pre_assessment_questions.map((q, i) => (
                                <div key={q.id} className="space-y-2">
                                    <Label>{i + 1}. {q.question}</Label>
                                    <textarea
                                        rows={3}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
                                        value={answers[q.id] ?? ''}
                                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                        disabled={readOnly}
                                        placeholder="Your answer..."
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Self-Assessment Narrative</CardTitle></CardHeader>
                        <CardContent>
                            <textarea
                                rows={8}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
                                value={form.data.narrative}
                                onChange={(e) => form.setData('narrative', e.target.value)}
                                disabled={readOnly}
                                placeholder="Describe your relevant experience, skills, and accomplishments for this subject..."
                            />
                        </CardContent>
                    </Card>

                    {!readOnly && (
                        <div className="flex gap-2">
                            <Button type="submit" variant="outline" disabled={form.processing}><Save className="mr-2 h-4 w-4" /> Save Draft</Button>
                            <Button type="button" onClick={submit} disabled={form.processing}><Send className="mr-2 h-4 w-4" /> Submit</Button>
                        </div>
                    )}
                    {readOnly && (
                        <p className="text-sm text-muted-foreground">This attempt has been submitted. Start a new attempt from the subject page to make changes.</p>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}

import { Head, Link, usePage } from '@inertiajs/react';
import { FileUp, ClipboardCheck, BarChart3, Shield, GraduationCap, ArrowRight } from 'lucide-react';

import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';

const features = [
    {
        title: 'Submit Your Portfolio',
        description: 'Upload and organize your ETEEAP documents by category. Track your submission progress in real-time.',
        icon: FileUp,
    },
    {
        title: 'Expert Evaluation',
        description: 'Qualified evaluators review your portfolio using standardized rubrics for fair and consistent assessment.',
        icon: ClipboardCheck,
    },
    {
        title: 'Track Progress',
        description: 'Monitor your portfolio status from submission to approval. Receive instant notifications on updates.',
        icon: BarChart3,
    },
    {
        title: 'Secure & Transparent',
        description: 'Your documents are securely stored. The entire process is transparent with clear status tracking.',
        icon: Shield,
    },
];

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                ETEEAP Gateway
                            </span>
                        </Link>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
                                >
                                    Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative isolate overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-linear-to-br from-indigo-50 via-white to-cyan-50 dark:from-indigo-950/40 dark:via-neutral-950 dark:to-cyan-950/30" />
                    <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/5 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center dark:bg-neutral-950 dark:shadow-indigo-400/5 dark:ring-neutral-800" />

                    <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:py-40">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                            <GraduationCap className="h-4 w-4" />
                            Asian Development Foundation College
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
                            ETEEAP Gateway
                        </h1>

                        <p className="mt-4 text-lg font-medium text-indigo-600 sm:text-xl dark:text-indigo-400">
                            A Web-Based Portfolio & Evaluation System with Progress Tracking
                        </p>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
                            Streamline your ETEEAP portfolio submission, evaluation, and tracking process — all in one
                            secure digital platform.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
                                        >
                                            Get Started
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    )}
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700 dark:focus:ring-offset-neutral-950"
                                    >
                                        Log in
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="border-t border-gray-200 bg-white py-20 sm:py-28 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                How It Works
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
                                From submission to evaluation, every step is streamlined and transparent.
                            </p>
                        </div>

                        <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:border-indigo-300 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-indigo-700"
                                >
                                    <div className="mb-4 inline-flex rounded-lg bg-indigo-100 p-2.5 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-gray-50 dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <p className="text-center text-sm text-gray-500 dark:text-gray-500">
                            &copy; 2026 Asian Development Foundation College. ETEEAP Gateway.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

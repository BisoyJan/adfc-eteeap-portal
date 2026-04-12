import { Head, Link, usePage } from '@inertiajs/react';
import {
    FileUp,
    ClipboardCheck,
    BarChart3,
    Shield,
    GraduationCap,
    ArrowRight,
    Users,
    Award,
    CheckCircle,
    Clock,
    BookOpen,
    Sparkles,
} from 'lucide-react';

import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';

const steps = [
    {
        step: '01',
        title: 'Create Your Account',
        description:
            'Register and set up your profile to begin your ETEEAP accreditation journey.',
        icon: Users,
    },
    {
        step: '02',
        title: 'Submit Your Portfolio',
        description:
            'Upload and organize your documents by category. Track your submission progress in real-time.',
        icon: FileUp,
    },
    {
        step: '03',
        title: 'Expert Evaluation',
        description:
            'Qualified evaluators review your portfolio using standardized rubrics for fair assessment.',
        icon: ClipboardCheck,
    },
    {
        step: '04',
        title: 'Get Your Results',
        description:
            'Receive detailed evaluation scores and feedback. Track your path to accreditation.',
        icon: Award,
    },
];

const benefits = [
    {
        title: 'Real-Time Tracking',
        description:
            'Monitor your portfolio status from submission through every stage of evaluation.',
        icon: BarChart3,
    },
    {
        title: 'Secure Document Storage',
        description:
            'Your files are encrypted and securely stored with role-based access controls.',
        icon: Shield,
    },
    {
        title: 'Instant Notifications',
        description:
            'Get notified immediately when your portfolio status changes or feedback is available.',
        icon: Clock,
    },
    {
        title: 'Standardized Rubrics',
        description:
            'Every portfolio is evaluated using consistent criteria for transparent and fair results.',
        icon: BookOpen,
    },
    {
        title: 'Progress Dashboard',
        description:
            'A personalized dashboard showing your overall progress, scores, and next actions.',
        icon: Sparkles,
    },
    {
        title: 'Complete Transparency',
        description:
            'Full visibility into every step of the process with clear status indicators.',
        icon: CheckCircle,
    },
];

const stats = [
    { label: 'Active Applicants', value: '500+' },
    { label: 'Portfolios Evaluated', value: '1,200+' },
    { label: 'Expert Evaluators', value: '50+' },
    { label: 'Approval Rate', value: '92%' },
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-white dark:bg-neutral-950">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                ETEEAP Gateway
                            </span>
                        </Link>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-neutral-950"
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
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-neutral-950"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative isolate overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-indigo-100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,var(--color-indigo-950),var(--color-neutral-950))]" />
                    <div className="absolute top-0 right-0 -z-10 h-full w-1/2 opacity-20 dark:opacity-10">
                        <svg
                            className="h-full w-full text-indigo-200 dark:text-indigo-800"
                            viewBox="0 0 800 800"
                            fill="none"
                        >
                            <circle
                                cx="400"
                                cy="400"
                                r="300"
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                            <circle
                                cx="400"
                                cy="400"
                                r="200"
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                            <circle
                                cx="400"
                                cy="400"
                                r="100"
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                        </svg>
                    </div>

                    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:flex lg:items-center lg:gap-16 lg:py-36">
                        <div className="mx-auto max-w-2xl lg:mx-0 lg:shrink-0">
                            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                                <GraduationCap className="h-4 w-4" />
                                Asian Development Foundation College
                            </div>

                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
                                Your Path to{' '}
                                <span className="bg-linear-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-cyan-400">
                                    ETEEAP Accreditation
                                </span>{' '}
                                Starts Here
                            </h1>

                            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                                Streamline your portfolio submission, evaluation,
                                and tracking process — all in one secure digital
                                platform designed for working professionals.
                            </p>

                            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:shadow-indigo-500/10 dark:focus:ring-offset-neutral-950"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                ) : (
                                    <>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:shadow-indigo-500/10 dark:focus:ring-offset-neutral-950"
                                            >
                                                Start Your Application
                                                <ArrowRight className="h-5 w-5" />
                                            </Link>
                                        )}
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700 dark:focus:ring-offset-neutral-950"
                                        >
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-16 hidden lg:mt-0 lg:flex lg:shrink-0 lg:justify-end">
                            <div className="relative">
                                <div className="absolute -inset-4 rounded-3xl bg-linear-to-tr from-indigo-500/20 to-cyan-500/20 blur-2xl dark:from-indigo-500/10 dark:to-cyan-500/10" />
                                <div className="relative grid w-80 grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                            <FileUp className="mb-3 h-8 w-8 text-indigo-500" />
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Upload Documents</p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Organize by category</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                            <BarChart3 className="mb-3 h-8 w-8 text-emerald-500" />
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Track Progress</p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Real-time updates</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 space-y-4">
                                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                            <ClipboardCheck className="mb-3 h-8 w-8 text-amber-500" />
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Get Evaluated</p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Expert review</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                            <Award className="mb-3 h-8 w-8 text-purple-500" />
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Get Accredited</p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Achieve your degree</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="border-y border-gray-100 bg-gray-50/50 dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="text-center"
                                >
                                    <p className="text-3xl font-bold text-indigo-600 sm:text-4xl dark:text-indigo-400">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="bg-white py-20 sm:py-28 dark:bg-neutral-950">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
                                Simple Process
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                How It Works
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
                                From registration to accreditation, every step is
                                streamlined and transparent.
                            </p>
                        </div>

                        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step, index) => (
                                <div key={step.title} className="relative">
                                    {index < steps.length - 1 && (
                                        <div className="absolute top-10 left-full z-10 hidden h-0.5 w-full bg-linear-to-r from-indigo-300 to-transparent lg:block dark:from-indigo-700" />
                                    )}
                                    <div className="group relative rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-800">
                                        <span className="mb-4 block text-3xl font-black text-indigo-100 dark:text-indigo-900/50">
                                            {step.step}
                                        </span>
                                        <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
                                            <step.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="border-t border-gray-100 bg-gray-50 py-20 sm:py-28 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
                                Why Choose Us
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Everything You Need to Succeed
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
                                Built with features that make the accreditation
                                process smooth, secure, and transparent.
                            </p>
                        </div>

                        <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit.title}
                                    className="group flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
                                        <benefit.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                            {benefit.title}
                                        </h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative overflow-hidden bg-indigo-600 dark:bg-indigo-700">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-indigo-500),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--color-cyan-500),transparent_50%)] opacity-30" />

                    <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ready to Begin Your ETEEAP Journey?
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
                            Join hundreds of working professionals who are
                            earning their degrees through the ETEEAP program.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-50 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 focus:outline-none"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-50 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 focus:outline-none"
                                        >
                                            Create Free Account
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    )}
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 focus:outline-none"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
                                    <GraduationCap className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    ETEEAP Gateway
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                &copy; {new Date().getFullYear()} Asian
                                Development Foundation College. All rights
                                reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

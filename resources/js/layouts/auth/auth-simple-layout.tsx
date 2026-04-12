import { Link } from '@inertiajs/react';
import {
    GraduationCap,
    FileUp,
    ClipboardCheck,
    BarChart3,
    Shield,
} from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const highlights = [
    {
        icon: FileUp,
        text: 'Upload and organize your ETEEAP portfolio documents',
    },
    {
        icon: ClipboardCheck,
        text: 'Expert evaluation with standardized rubrics',
    },
    {
        icon: BarChart3,
        text: 'Real-time progress tracking and notifications',
    },
    {
        icon: Shield,
        text: 'Secure document storage with full transparency',
    },
];

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Left Panel - Branding */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-indigo-600 p-10 lg:flex dark:bg-indigo-700">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-indigo-500),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--color-cyan-500),transparent_50%)] opacity-20" />
                <div className="absolute top-0 right-0 h-full w-1/2 opacity-10">
                    <svg
                        className="h-full w-full text-white"
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

                <div className="relative z-10">
                    <Link
                        href={home()}
                        className="flex items-center gap-2.5"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            ETEEAP Gateway
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">
                            Your Path to
                            <br />
                            Accreditation
                        </h2>
                        <p className="mt-3 max-w-sm text-base leading-relaxed text-indigo-100">
                            A streamlined digital platform for ETEEAP portfolio
                            submission, evaluation, and tracking.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {highlights.map((item) => (
                            <div
                                key={item.text}
                                className="flex items-start gap-3"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                                    <item.icon className="h-4 w-4 text-white" />
                                </div>
                                <p className="pt-1 text-sm leading-snug text-indigo-100">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-sm text-indigo-200">
                        &copy; {new Date().getFullYear()} Asian Development
                        Foundation College
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex flex-col items-center justify-center bg-background p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex items-center gap-2 font-medium lg:hidden"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-foreground">
                                    ETEEAP Gateway
                                </span>
                            </Link>

                            <div className="w-full space-y-2 text-center lg:text-left">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {title}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

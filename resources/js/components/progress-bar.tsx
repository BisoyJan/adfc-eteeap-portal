import { useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    /** Percentage value (0-100) controlling the fill width */
    percentage: number;
    /** Height class for the bar track (default: "h-2") */
    height?: string;
    /** Additional Tailwind classes for the fill element */
    fillClassName?: string;
    /** Additional Tailwind classes for the track element */
    trackClassName?: string;
    /** Content rendered inside the fill bar (e.g. count label) */
    children?: React.ReactNode;
}

export default function ProgressBar({
    percentage,
    height = 'h-2',
    fillClassName = 'bg-primary',
    trackClassName,
    children,
}: ProgressBarProps) {
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    const fillRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (node) {
                node.style.width = `${clampedPercentage}%`;
            }
        },
        [clampedPercentage],
    );

    return (
        <div
            className={cn(
                'w-full overflow-hidden rounded-full bg-secondary',
                height,
                trackClassName,
            )}
        >
            <div
                ref={fillRef}
                className={cn(
                    'h-full rounded-full transition-all duration-300',
                    fillClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
}

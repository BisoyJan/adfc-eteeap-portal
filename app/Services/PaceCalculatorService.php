<?php

namespace App\Services;

use App\Enums\PortfolioStatus;
use App\Models\Portfolio;

class PaceCalculatorService
{
    /**
     * Calculate ETA data for a portfolio based on document upload velocity.
     *
     * @return array{
     *     is_applicable: bool,
     *     days_active: int,
     *     required_total: int,
     *     required_completed: int,
     *     upload_velocity_per_week: float,
     *     estimated_days_remaining: int|null,
     *     estimated_completion_date: string|null,
     *     earliest_due_date: string|null,
     *     at_risk: bool,
     *     confidence: string,
     * }
     */
    public function calculate(Portfolio $portfolio, int $requiredTotal, int $requiredCompleted): array
    {
        $daysActive = max(1, (int) $portfolio->created_at->diffInDays(now()));

        $isTerminal = in_array($portfolio->status, [
            PortfolioStatus::Approved,
            PortfolioStatus::Rejected,
        ]);

        $earliestDueDate = $portfolio->relationLoaded('assignments')
            ? $portfolio->assignments
                ->whereNotNull('due_date')
                ->sortBy('due_date')
                ->first()?->due_date?->toDateString()
            : null;

        if ($isTerminal || $requiredTotal === 0) {
            return [
                'is_applicable' => false,
                'days_active' => $daysActive,
                'required_total' => $requiredTotal,
                'required_completed' => $requiredCompleted,
                'upload_velocity_per_week' => 0.0,
                'estimated_days_remaining' => null,
                'estimated_completion_date' => null,
                'earliest_due_date' => $earliestDueDate,
                'at_risk' => false,
                'confidence' => 'none',
            ];
        }

        $remaining = $requiredTotal - $requiredCompleted;
        $velocityPerDay = $requiredCompleted / $daysActive;
        $velocityPerWeek = round($velocityPerDay * 7, 2);

        $estimatedDaysRemaining = null;
        $estimatedCompletionDate = null;
        $confidence = 'none';

        if ($remaining === 0) {
            $estimatedDaysRemaining = 0;
            $estimatedCompletionDate = now()->toDateString();
            $confidence = 'high';
        } elseif ($velocityPerDay > 0) {
            $estimatedDaysRemaining = (int) ceil($remaining / $velocityPerDay);
            $estimatedCompletionDate = now()->addDays($estimatedDaysRemaining)->toDateString();

            if ($requiredCompleted >= 3 && $daysActive >= 7) {
                $confidence = 'high';
            } elseif ($requiredCompleted >= 1) {
                $confidence = 'medium';
            } else {
                $confidence = 'low';
            }
        } else {
            // No uploads yet — can't estimate
            $confidence = 'none';
        }

        $atRisk = false;
        if ($earliestDueDate !== null && $estimatedCompletionDate !== null) {
            $atRisk = $estimatedCompletionDate > $earliestDueDate;
        }

        return [
            'is_applicable' => true,
            'days_active' => $daysActive,
            'required_total' => $requiredTotal,
            'required_completed' => $requiredCompleted,
            'upload_velocity_per_week' => $velocityPerWeek,
            'estimated_days_remaining' => $estimatedDaysRemaining,
            'estimated_completion_date' => $estimatedCompletionDate,
            'earliest_due_date' => $earliestDueDate,
            'at_risk' => $atRisk,
            'confidence' => $confidence,
        ];
    }
}

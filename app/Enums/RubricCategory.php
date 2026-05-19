<?php

namespace App\Enums;

enum RubricCategory: string
{
    case Interview = 'interview';
    case PreAssessment = 'pre_assessment';
    case WorksiteVisit = 'worksite_visit';
    case WrittenExam = 'written_exam';
    case Portfolio = 'portfolio';

    public function label(): string
    {
        return match ($this) {
            self::Interview => 'Interview',
            self::PreAssessment => 'Pre-Assessment',
            self::WorksiteVisit => 'Worksite Visit',
            self::WrittenExam => 'Written Examination',
            self::Portfolio => 'Portfolio (General)',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases(),
        );
    }
}

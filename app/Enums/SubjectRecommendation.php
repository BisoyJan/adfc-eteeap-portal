<?php

namespace App\Enums;

enum SubjectRecommendation: string
{
    case FullCredit = 'full_credit';
    case PartialCredit = 'partial_credit';
    case AdditionalReview = 'additional_review';
    case NotRecommended = 'not_recommended';

    public function label(): string
    {
        return match ($this) {
            self::FullCredit => 'Full Credit',
            self::PartialCredit => 'Partial Credit',
            self::AdditionalReview => 'Additional Review',
            self::NotRecommended => 'Not Recommended',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $c) => $c->value, self::cases());
    }

    /**
     * @return list<array{value:string,label:string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $c) => ['value' => $c->value, 'label' => $c->label()], self::cases());
    }
}

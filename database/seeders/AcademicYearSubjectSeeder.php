<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class AcademicYearSubjectSeeder extends Seeder
{
    public function run(): void
    {
        $year = AcademicYear::updateOrCreate(
            ['name' => 'AY 2025-2026'],
            [
                'start_date' => '2025-08-01',
                'end_date' => '2026-07-31',
                'is_active' => true,
                'notes' => 'Default seeded academic year.',
            ],
        );

        $subjects = [
            ['code' => 'IT101', 'name' => 'Introduction to Programming', 'units' => 3],
            ['code' => 'IT102', 'name' => 'Database Management Systems', 'units' => 3],
            ['code' => 'IT103', 'name' => 'Networking Fundamentals', 'units' => 3],
            ['code' => 'IT104', 'name' => 'Systems Analysis & Design', 'units' => 3],
        ];

        foreach ($subjects as $subject) {
            Subject::updateOrCreate(
                ['academic_year_id' => $year->id, 'code' => $subject['code']],
                [...$subject, 'is_active' => true],
            );
        }
    }
}

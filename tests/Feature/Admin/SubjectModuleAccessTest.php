<?php

namespace Tests\Feature\Admin;

use App\Models\AcademicYear;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class SubjectModuleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_admin_cannot_upload_subject_modules(): void
    {
        $admin = User::factory()->admin()->create();
        $subject = $this->createSubject();

        $response = $this->actingAs($admin)->post("/admin/subjects/{$subject->id}/modules", [
            'title' => 'Blocked Upload',
            'description' => 'Should not be accepted',
            'file' => UploadedFile::fake()->create('blocked.pdf', 128, 'application/pdf'),
        ]);

        $response->assertStatus(405);

        $this->assertDatabaseMissing('subject_modules', [
            'subject_id' => $subject->id,
            'title' => 'Blocked Upload',
        ]);
    }

    private function createSubject(): Subject
    {
        $year = AcademicYear::create([
            'name' => 'AY 2027-2028',
            'start_date' => now()->startOfYear()->toDateString(),
            'end_date' => now()->endOfYear()->toDateString(),
            'is_active' => true,
        ]);

        return Subject::create([
            'academic_year_id' => $year->id,
            'code' => 'IT201',
            'name' => 'Systems Administration',
            'description' => 'Admin test subject',
            'units' => 3,
            'is_active' => true,
        ]);
    }
}

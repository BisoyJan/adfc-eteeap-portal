<?php

namespace Tests\Feature\Applicant;

use App\Enums\PortfolioStatus;
use App\Enums\SubjectAssignmentStatus;
use App\Models\AcademicYear;
use App\Models\Portfolio;
use App\Models\PortfolioSubject;
use App\Models\Subject;
use App\Models\SubjectModule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SubjectFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_applicant_subject_index_only_shows_subjects_from_unlocked_portfolios(): void
    {
        $applicant = User::factory()->applicant()->create();

        $visibleSubject = $this->createPortfolioSubjectForApplicant($applicant, PortfolioStatus::Approved);
        $this->createPortfolioSubjectForApplicant($applicant, PortfolioStatus::Submitted);

        $response = $this->actingAs($applicant)->get(route('applicant.subjects.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('applicant/subjects/index')
                ->has('portfolioSubjects', 1)
                ->where('portfolioSubjects.0.id', $visibleSubject->id)
        );
    }

    public function test_applicant_cannot_open_subject_from_locked_portfolio(): void
    {
        $applicant = User::factory()->applicant()->create();
        $lockedSubject = $this->createPortfolioSubjectForApplicant($applicant, PortfolioStatus::Submitted);

        $this->actingAs($applicant)
            ->get(route('applicant.subjects.show', $lockedSubject))
            ->assertForbidden();
    }

    public function test_applicant_can_upload_module_for_visible_subject(): void
    {
        Storage::fake('public');

        $applicant = User::factory()->applicant()->create();
        $portfolioSubject = $this->createPortfolioSubjectForApplicant($applicant, PortfolioStatus::Approved);

        $response = $this->actingAs($applicant)->post(route('applicant.subjects.modules.store', $portfolioSubject), [
            'title' => 'Applicant Module',
            'description' => 'Uploaded by applicant.',
            'file' => UploadedFile::fake()->create('applicant-module.pdf', 256, 'application/pdf'),
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $module = SubjectModule::query()->where('subject_id', $portfolioSubject->subject_id)->first();

        $this->assertNotNull($module);
        $this->assertSame($applicant->id, $module->uploaded_by);
        Storage::disk('public')->assertExists($module->file_path);
    }

    public function test_applicant_cannot_upload_module_for_locked_subject(): void
    {
        Storage::fake('public');

        $applicant = User::factory()->applicant()->create();
        $portfolioSubject = $this->createPortfolioSubjectForApplicant($applicant, PortfolioStatus::Submitted);

        $this->actingAs($applicant)->post(route('applicant.subjects.modules.store', $portfolioSubject), [
            'title' => 'Blocked Applicant Module',
            'description' => 'Should not be accepted.',
            'file' => UploadedFile::fake()->create('blocked.pdf', 128, 'application/pdf'),
        ])->assertForbidden();

        $this->assertDatabaseCount('subject_modules', 0);
    }

    private function createPortfolioSubjectForApplicant(User $applicant, PortfolioStatus $portfolioStatus): PortfolioSubject
    {
        $subject = $this->createSubject();
        $evaluator = User::factory()->evaluator()->create();

        $portfolio = Portfolio::factory()->create([
            'user_id' => $applicant->id,
            'status' => $portfolioStatus,
        ]);

        return PortfolioSubject::create([
            'portfolio_id' => $portfolio->id,
            'subject_id' => $subject->id,
            'evaluator_id' => $evaluator->id,
            'assigned_by' => $evaluator->id,
            'status' => SubjectAssignmentStatus::Pending,
            'assigned_at' => now(),
        ]);
    }

    private function createSubject(): Subject
    {
        $year = AcademicYear::create([
            'name' => fake()->unique()->numerify('AY 20##-20##'),
            'start_date' => now()->startOfYear()->toDateString(),
            'end_date' => now()->endOfYear()->toDateString(),
            'is_active' => true,
        ]);

        return Subject::create([
            'academic_year_id' => $year->id,
            'code' => fake()->unique()->bothify('IT###'),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'units' => 3,
            'is_active' => true,
        ]);
    }
}

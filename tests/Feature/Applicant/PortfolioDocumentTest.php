<?php

namespace Tests\Feature\Applicant;

use App\Models\DocumentCategory;
use App\Models\Portfolio;
use App\Models\PortfolioDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PortfolioDocumentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_applicant_can_upload_document_to_draft_portfolio(): void
    {
        Storage::fake('local');

        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $applicant->id]);
        $category = DocumentCategory::factory()->create();

        $file = UploadedFile::fake()->create('test.pdf', 1024, 'application/pdf');

        $response = $this->actingAs($applicant)->post(
            route('applicant.portfolios.documents.store', $portfolio),
            [
                'document_category_id' => $category->id,
                'file' => $file,
            ]
        );

        $response->assertRedirect();

        $this->assertDatabaseHas('portfolio_documents', [
            'portfolio_id' => $portfolio->id,
            'document_category_id' => $category->id,
            'file_name' => 'test.pdf',
            'mime_type' => 'application/pdf',
        ]);
    }

    public function test_applicant_cannot_upload_document_to_submitted_portfolio(): void
    {
        Storage::fake('local');

        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->submitted()->create(['user_id' => $applicant->id]);
        $category = DocumentCategory::factory()->create();

        $file = UploadedFile::fake()->create('test.pdf', 1024, 'application/pdf');

        $response = $this->actingAs($applicant)->post(
            route('applicant.portfolios.documents.store', $portfolio),
            [
                'document_category_id' => $category->id,
                'file' => $file,
            ]
        );

        $response->assertStatus(403);
    }

    public function test_applicant_cannot_upload_oversized_file(): void
    {
        Storage::fake('local');

        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $applicant->id]);
        $category = DocumentCategory::factory()->create();

        $file = UploadedFile::fake()->create('large.pdf', 11264, 'application/pdf');

        $response = $this->actingAs($applicant)->post(
            route('applicant.portfolios.documents.store', $portfolio),
            [
                'document_category_id' => $category->id,
                'file' => $file,
            ]
        );

        $response->assertSessionHasErrors('file');
    }

    public function test_applicant_cannot_upload_invalid_file_type(): void
    {
        Storage::fake('local');

        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $applicant->id]);
        $category = DocumentCategory::factory()->create();

        $file = UploadedFile::fake()->create('malware.exe', 1024, 'application/x-msdownload');

        $response = $this->actingAs($applicant)->post(
            route('applicant.portfolios.documents.store', $portfolio),
            [
                'document_category_id' => $category->id,
                'file' => $file,
            ]
        );

        $response->assertSessionHasErrors('file');
    }

    public function test_applicant_can_delete_document_from_draft_portfolio(): void
    {
        Storage::fake('local');

        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $applicant->id]);

        $filePath = "portfolios/{$portfolio->id}/test.pdf";
        Storage::disk('local')->put($filePath, 'dummy content');

        $document = PortfolioDocument::factory()->create([
            'portfolio_id' => $portfolio->id,
            'file_path' => $filePath,
        ]);

        $response = $this->actingAs($applicant)->delete(
            route('applicant.portfolios.documents.destroy', [$portfolio, $document])
        );

        $response->assertRedirect();

        $this->assertDatabaseMissing('portfolio_documents', [
            'id' => $document->id,
        ]);
    }

    public function test_applicant_cannot_delete_document_from_submitted_portfolio(): void
    {
        Storage::fake('local');

        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->submitted()->create(['user_id' => $applicant->id]);
        $document = PortfolioDocument::factory()->create([
            'portfolio_id' => $portfolio->id,
        ]);

        $response = $this->actingAs($applicant)->delete(
            route('applicant.portfolios.documents.destroy', [$portfolio, $document])
        );

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('portfolio_documents', [
            'id' => $document->id,
        ]);
    }

    public function test_applicant_can_download_document(): void
    {
        Storage::fake('local');

        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $applicant->id]);

        $filePath = "portfolios/{$portfolio->id}/test.pdf";
        Storage::disk('local')->put($filePath, 'dummy pdf content');

        $document = PortfolioDocument::factory()->create([
            'portfolio_id' => $portfolio->id,
            'file_path' => $filePath,
            'file_name' => 'test.pdf',
        ]);

        $response = $this->actingAs($applicant)->get(
            route('applicant.portfolios.documents.download', [$portfolio, $document])
        );

        $response->assertStatus(200);
    }

    public function test_applicant_cannot_download_other_users_document(): void
    {
        Storage::fake('local');

        $applicant = User::factory()->applicant()->create();
        $otherApplicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $otherApplicant->id]);
        $document = PortfolioDocument::factory()->create([
            'portfolio_id' => $portfolio->id,
        ]);

        $response = $this->actingAs($applicant)->get(
            route('applicant.portfolios.documents.download', [$portfolio, $document])
        );

        $response->assertStatus(403);
    }
}

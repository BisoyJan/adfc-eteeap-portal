<?php

namespace Tests\Feature;

use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\PortfolioDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentDownloadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_owner_can_download_document(): void
    {
        Storage::fake('local');

        $owner = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $owner->id]);

        $path = "portfolios/{$portfolio->id}/test.pdf";
        Storage::disk('local')->put($path, 'pdf');

        $document = PortfolioDocument::factory()->create([
            'portfolio_id' => $portfolio->id,
            'file_name' => 'test.pdf',
            'file_path' => $path,
            'mime_type' => 'application/pdf',
            'file_size' => 3,
        ]);

        $response = $this->actingAs($owner)->get(route('documents.download', $document));

        $response->assertOk();

        $contentDisposition = (string) $response->headers->get('content-disposition');
        $this->assertStringContainsString('attachment', $contentDisposition);
    }

    public function test_owner_can_preview_document_inline(): void
    {
        Storage::fake('local');

        $owner = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $owner->id]);

        $path = "portfolios/{$portfolio->id}/test.pdf";
        Storage::disk('local')->put($path, 'pdf');

        $document = PortfolioDocument::factory()->create([
            'portfolio_id' => $portfolio->id,
            'file_name' => 'test.pdf',
            'file_path' => $path,
            'mime_type' => 'application/pdf',
            'file_size' => 3,
        ]);

        $response = $this->actingAs($owner)->get(route('documents.download', [$document, 'preview' => 1]));

        $response->assertOk();

        $contentDisposition = (string) $response->headers->get('content-disposition');
        $this->assertStringContainsString('inline', $contentDisposition);
    }

    public function test_admin_can_download_document(): void
    {
        Storage::fake('local');

        $admin = User::factory()->admin()->create();
        $owner = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $owner->id]);

        $path = "portfolios/{$portfolio->id}/test.pdf";
        Storage::disk('local')->put($path, 'pdf');

        $document = PortfolioDocument::factory()->create([
            'portfolio_id' => $portfolio->id,
            'file_name' => 'test.pdf',
            'file_path' => $path,
            'mime_type' => 'application/pdf',
            'file_size' => 3,
        ]);

        $response = $this->actingAs($admin)->get(route('documents.download', $document));

        $response->assertOk();
    }

    public function test_assigned_evaluator_can_download_document(): void
    {
        Storage::fake('local');

        $evaluator = User::factory()->evaluator()->create();
        $owner = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $owner->id]);

        PortfolioAssignment::factory()->create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
        ]);

        $path = "portfolios/{$portfolio->id}/test.pdf";
        Storage::disk('local')->put($path, 'pdf');

        $document = PortfolioDocument::factory()->create([
            'portfolio_id' => $portfolio->id,
            'file_name' => 'test.pdf',
            'file_path' => $path,
            'mime_type' => 'application/pdf',
            'file_size' => 3,
        ]);

        $response = $this->actingAs($evaluator)->get(route('documents.download', $document));

        $response->assertOk();
    }

    public function test_other_user_cannot_download_document(): void
    {
        Storage::fake('local');

        $owner = User::factory()->applicant()->create();
        $otherUser = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->create(['user_id' => $owner->id]);

        $path = "portfolios/{$portfolio->id}/test.pdf";
        Storage::disk('local')->put($path, 'pdf');

        $document = PortfolioDocument::factory()->create([
            'portfolio_id' => $portfolio->id,
            'file_name' => 'test.pdf',
            'file_path' => $path,
            'mime_type' => 'application/pdf',
            'file_size' => 3,
        ]);

        $response = $this->actingAs($otherUser)->get(route('documents.download', $document));

        $response->assertStatus(403);
    }
}

<?php

namespace Tests\Feature\Admin;

use App\Models\DocumentCategory;
use App\Models\PortfolioDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentCategoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_admin_can_view_document_categories_list(): void
    {
        $admin = User::factory()->admin()->create();
        DocumentCategory::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get(route('admin.document-categories.index'));

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_view_document_categories(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $applicant = User::factory()->applicant()->create();

        $this->actingAs($evaluator)->get(route('admin.document-categories.index'))->assertStatus(403);
        $this->actingAs($applicant)->get(route('admin.document-categories.index'))->assertStatus(403);
    }

    public function test_admin_can_view_create_form(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.document-categories.create'));

        $response->assertStatus(200);
    }

    public function test_admin_can_create_document_category(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.document-categories.store'), [
            'name' => 'Professional License',
            'description' => 'A valid professional license.',
            'is_required' => true,
            'sort_order' => 5,
        ]);

        $response->assertRedirect(route('admin.document-categories.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('document_categories', [
            'name' => 'Professional License',
            'slug' => 'professional-license',
            'is_required' => true,
        ]);
    }

    public function test_admin_cannot_create_category_with_duplicate_name(): void
    {
        $admin = User::factory()->admin()->create();
        DocumentCategory::factory()->create(['name' => 'Test Category']);

        $response = $this->actingAs($admin)->post(route('admin.document-categories.store'), [
            'name' => 'Test Category',
            'is_required' => false,
            'sort_order' => 0,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_admin_cannot_create_category_without_name(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.document-categories.store'), [
            'description' => 'Some description.',
            'is_required' => false,
            'sort_order' => 0,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_admin_can_view_edit_form(): void
    {
        $admin = User::factory()->admin()->create();
        $category = DocumentCategory::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.document-categories.edit', $category));

        $response->assertStatus(200);
    }

    public function test_admin_can_update_document_category(): void
    {
        $admin = User::factory()->admin()->create();
        $category = DocumentCategory::factory()->create();

        $response = $this->actingAs($admin)->put(route('admin.document-categories.update', $category), [
            'name' => 'Updated Category',
            'description' => 'Updated description.',
            'is_required' => false,
            'sort_order' => 10,
        ]);

        $response->assertRedirect(route('admin.document-categories.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('document_categories', [
            'id' => $category->id,
            'name' => 'Updated Category',
            'slug' => 'updated-category',
        ]);
    }

    public function test_admin_can_delete_unused_document_category(): void
    {
        $admin = User::factory()->admin()->create();
        $category = DocumentCategory::factory()->create();

        $response = $this->actingAs($admin)->delete(route('admin.document-categories.destroy', $category));

        $response->assertRedirect(route('admin.document-categories.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('document_categories', ['id' => $category->id]);
    }

    public function test_admin_cannot_delete_category_with_documents(): void
    {
        $admin = User::factory()->admin()->create();
        $category = DocumentCategory::factory()->create();
        PortfolioDocument::factory()->create(['document_category_id' => $category->id]);

        $response = $this->actingAs($admin)->delete(route('admin.document-categories.destroy', $category));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('document_categories', ['id' => $category->id]);
    }

    public function test_super_admin_can_manage_document_categories(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)->get(route('admin.document-categories.index'))->assertStatus(200);
        $this->actingAs($superAdmin)->get(route('admin.document-categories.create'))->assertStatus(200);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDocumentCategoryRequest;
use App\Http\Requests\Admin\UpdateDocumentCategoryRequest;
use App\Models\DocumentCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DocumentCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = DocumentCategory::query()
            ->withCount('documents')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('admin/document-categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/document-categories/create');
    }

    public function store(StoreDocumentCategoryRequest $request): RedirectResponse
    {
        DocumentCategory::create([
            ...$request->validated(),
            'slug' => Str::slug($request->validated('name')),
        ]);

        return redirect()->route('admin.document-categories.index')
            ->with('success', 'Document category created successfully.');
    }

    public function edit(DocumentCategory $documentCategory): Response
    {
        return Inertia::render('admin/document-categories/edit', [
            'category' => $documentCategory,
        ]);
    }

    public function update(UpdateDocumentCategoryRequest $request, DocumentCategory $documentCategory): RedirectResponse
    {
        $documentCategory->update([
            ...$request->validated(),
            'slug' => Str::slug($request->validated('name')),
        ]);

        return redirect()->route('admin.document-categories.index')
            ->with('success', 'Document category updated successfully.');
    }

    public function destroy(DocumentCategory $documentCategory): RedirectResponse
    {
        if ($documentCategory->documents()->exists()) {
            return back()->with('error', 'Cannot delete a category that has uploaded documents.');
        }

        $documentCategory->delete();

        return redirect()->route('admin.document-categories.index')
            ->with('success', 'Document category deleted successfully.');
    }
}

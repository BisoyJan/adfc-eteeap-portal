<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Applicant\StorePortfolioDocumentRequest;
use App\Models\Portfolio;
use App\Models\PortfolioDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PortfolioDocumentController extends Controller
{
    public function store(StorePortfolioDocumentRequest $request, Portfolio $portfolio): RedirectResponse
    {
        $file = $request->file('file');
        $path = $file->store("portfolios/{$portfolio->id}", 'local');

        $portfolio->documents()->create([
            'document_category_id' => $request->validated('document_category_id'),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'notes' => $request->validated('notes'),
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function destroy(Portfolio $portfolio, PortfolioDocument $document): RedirectResponse
    {
        if ($portfolio->user_id !== auth()->id()) {
            abort(403);
        }

        if (! $portfolio->canBeEdited()) {
            return back()->with('error', 'Documents cannot be removed from this portfolio.');
        }

        if ($document->portfolio_id !== $portfolio->id) {
            abort(404);
        }

        Storage::disk('local')->delete($document->file_path);

        $document->delete();

        return back()->with('success', 'Document removed successfully.');
    }

    public function download(Portfolio $portfolio, PortfolioDocument $document): StreamedResponse
    {
        if ($portfolio->user_id !== auth()->id()) {
            abort(403);
        }

        if ($document->portfolio_id !== $portfolio->id) {
            abort(404);
        }

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }
}

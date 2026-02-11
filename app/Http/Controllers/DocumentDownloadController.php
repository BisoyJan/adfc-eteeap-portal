<?php

namespace App\Http\Controllers;

use App\Models\PortfolioDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentDownloadController extends Controller
{
    /**
     * Download a portfolio document.
     *
     * Accessible by the document owner, admins, super admins,
     * and evaluators assigned to the portfolio.
     */
    public function __invoke(Request $request, PortfolioDocument $document): StreamedResponse
    {
        $user = auth()->user();
        $portfolio = $document->portfolio;

        $isOwner = $portfolio->user_id === $user->id;
        $isAdmin = $user->isAdministrative();
        $isAssignedEvaluator = $user->isEvaluator() && $portfolio->assignments()
            ->where('evaluator_id', $user->id)
            ->exists();

        if (! $isOwner && ! $isAdmin && ! $isAssignedEvaluator) {
            abort(403);
        }

        $isPreview = (bool) $request->boolean('preview');

        if ($isPreview) {
            return Storage::disk('local')->response(
                $document->file_path,
                $document->file_name,
                [
                    'Content-Type' => $document->mime_type,
                    'Content-Disposition' => 'inline; filename="'.$document->file_name.'"',
                ],
            );
        }

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }
}

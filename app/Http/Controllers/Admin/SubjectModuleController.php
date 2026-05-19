<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SubjectModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SubjectModuleController extends Controller
{
    public function index(Subject $subject): Response
    {
        $subject->load('academicYear');
        $modules = $subject->modules()->with('uploader:id,name')->latest()->get();

        return Inertia::render('admin/subjects/modules', [
            'subject' => $subject,
            'modules' => $modules,
        ]);
    }

    public function store(Request $request, Subject $subject): RedirectResponse
    {
        abort(403, 'Only evaluators can upload subject modules.');
    }

    public function destroy(Subject $subject, SubjectModule $module): RedirectResponse
    {
        abort(403, 'Admin module access is read-only.');
    }

    public function download(Subject $subject, SubjectModule $module): StreamedResponse
    {
        abort_unless($module->subject_id === $subject->id, 404);

        return Storage::disk('public')->download($module->file_path, $module->file_name);
    }
}

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
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'file' => ['required', 'file', 'max:51200'], // 50 MB
        ]);

        $file = $request->file('file');
        $path = $file->store("subjects/{$subject->id}/modules", 'public');

        SubjectModule::create([
            'subject_id' => $subject->id,
            'uploaded_by' => auth()->id(),
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return back()->with('success', 'Module uploaded.');
    }

    public function destroy(Subject $subject, SubjectModule $module): RedirectResponse
    {
        abort_unless($module->subject_id === $subject->id, 404);

        if ($module->file_path && Storage::disk('public')->exists($module->file_path)) {
            Storage::disk('public')->delete($module->file_path);
        }
        $module->delete();

        return back()->with('success', 'Module deleted.');
    }

    public function download(Subject $subject, SubjectModule $module): StreamedResponse
    {
        abort_unless($module->subject_id === $subject->id, 404);

        return Storage::disk('public')->download($module->file_path, $module->file_name);
    }
}

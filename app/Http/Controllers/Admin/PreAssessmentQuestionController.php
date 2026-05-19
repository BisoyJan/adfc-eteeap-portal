<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PreAssessmentQuestion;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PreAssessmentQuestionController extends Controller
{
    public function index(Subject $subject): Response
    {
        $subject->load('academicYear');
        $questions = $subject->preAssessmentQuestions()->ordered()->get();

        return Inertia::render('admin/subjects/pre-assessment-questions', [
            'subject' => $subject,
            'questions' => $questions,
        ]);
    }

    public function store(Request $request, Subject $subject): RedirectResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:2000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $subject->preAssessmentQuestions()->create([
            'question' => $data['question'],
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return back()->with('success', 'Question added.');
    }

    public function update(Request $request, Subject $subject, PreAssessmentQuestion $question): RedirectResponse
    {
        abort_unless($question->subject_id === $subject->id, 404);

        $data = $request->validate([
            'question' => ['required', 'string', 'max:2000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $question->update([
            'question' => $data['question'],
            'sort_order' => $data['sort_order'] ?? $question->sort_order,
            'is_active' => $data['is_active'] ?? $question->is_active,
        ]);

        return back()->with('success', 'Question updated.');
    }

    public function destroy(Subject $subject, PreAssessmentQuestion $question): RedirectResponse
    {
        abort_unless($question->subject_id === $subject->id, 404);
        $question->delete();

        return back()->with('success', 'Question removed.');
    }
}

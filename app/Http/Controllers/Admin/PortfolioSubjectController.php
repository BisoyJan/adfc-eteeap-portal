<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SubjectAssignmentStatus;
use App\Enums\SubjectRecommendation;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Models\PortfolioSubject;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioSubjectController extends Controller
{
    public function index(Portfolio $portfolio): Response
    {
        $portfolio->load([
            'user',
            'portfolioSubjects.subject.academicYear',
            'portfolioSubjects.evaluator',
        ]);

        $subjects = Subject::with('academicYear')
            ->active()
            ->orderBy('academic_year_id')
            ->orderBy('code')
            ->get();

        $evaluators = User::where('role', UserRole::Evaluator)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/portfolios/subjects', [
            'portfolio' => $portfolio,
            'allSubjects' => $subjects,
            'evaluators' => $evaluators,
            'statuses' => SubjectAssignmentStatus::options(),
            'recommendations' => SubjectRecommendation::options(),
        ]);
    }

    public function store(Request $request, Portfolio $portfolio): RedirectResponse
    {
        $data = $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'evaluator_id' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $exists = PortfolioSubject::where('portfolio_id', $portfolio->id)
            ->where('subject_id', $data['subject_id'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'That subject is already assigned to this portfolio.');
        }

        PortfolioSubject::create([
            'portfolio_id' => $portfolio->id,
            'subject_id' => $data['subject_id'],
            'evaluator_id' => $data['evaluator_id'] ?? null,
            'assigned_by' => auth()->id(),
            'status' => SubjectAssignmentStatus::Pending,
            'notes' => $data['notes'] ?? null,
            'assigned_at' => now(),
        ]);

        return back()->with('success', 'Subject assigned to portfolio.');
    }

    public function update(Request $request, Portfolio $portfolio, PortfolioSubject $portfolioSubject): RedirectResponse
    {
        abort_unless($portfolioSubject->portfolio_id === $portfolio->id, 404);

        $data = $request->validate([
            'evaluator_id' => ['nullable', 'exists:users,id'],
            'status' => ['required', 'string', 'in:'.implode(',', SubjectAssignmentStatus::values())],
            'recommendation' => ['nullable', 'string', 'in:'.implode(',', SubjectRecommendation::values())],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $portfolioSubject->update([
            ...$data,
            'completed_at' => $data['status'] === SubjectAssignmentStatus::Completed->value
                ? ($portfolioSubject->completed_at ?? now())
                : null,
        ]);

        return back()->with('success', 'Subject assignment updated.');
    }

    public function destroy(Portfolio $portfolio, PortfolioSubject $portfolioSubject): RedirectResponse
    {
        abort_unless($portfolioSubject->portfolio_id === $portfolio->id, 404);

        $portfolioSubject->delete();

        return back()->with('success', 'Subject removed from portfolio.');
    }
}

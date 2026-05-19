<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubjectRequest;
use App\Http\Requests\Admin\UpdateSubjectRequest;
use App\Models\AcademicYear;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(Request $request): Response
    {
        $academicYears = AcademicYear::query()
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'is_active']);

        $activeYearId = (int) $request->query('academic_year_id', 0);
        if ($activeYearId === 0) {
            $activeYearId = (int) ($academicYears->firstWhere('is_active', true)?->id ?? $academicYears->first()?->id ?? 0);
        }

        $subjects = Subject::query()
            ->with('academicYear:id,name')
            ->when($activeYearId > 0, fn ($q) => $q->where('academic_year_id', $activeYearId))
            ->orderBy('code')
            ->get();

        return Inertia::render('admin/subjects/index', [
            'subjects' => $subjects,
            'academicYears' => $academicYears,
            'filters' => [
                'academic_year_id' => $activeYearId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/subjects/create', [
            'academicYears' => AcademicYear::query()
                ->orderByDesc('start_date')
                ->get(['id', 'name', 'is_active']),
        ]);
    }

    public function store(StoreSubjectRequest $request): RedirectResponse
    {
        Subject::create($request->validated());

        return redirect()->route('admin.subjects.index', [
            'academic_year_id' => $request->validated('academic_year_id'),
        ])->with('success', 'Subject created successfully.');
    }

    public function edit(Subject $subject): Response
    {
        return Inertia::render('admin/subjects/edit', [
            'subject' => $subject,
            'academicYears' => AcademicYear::query()
                ->orderByDesc('start_date')
                ->get(['id', 'name', 'is_active']),
        ]);
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): RedirectResponse
    {
        $subject->update($request->validated());

        return redirect()->route('admin.subjects.index', [
            'academic_year_id' => $subject->academic_year_id,
        ])->with('success', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $subject->delete();

        return back()->with('success', 'Subject deleted successfully.');
    }

    public function toggleActive(Subject $subject): RedirectResponse
    {
        $subject->update(['is_active' => ! $subject->is_active]);

        $status = $subject->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Subject {$status} successfully.");
    }
}

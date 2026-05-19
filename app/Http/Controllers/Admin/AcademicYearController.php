<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAcademicYearRequest;
use App\Http\Requests\Admin\UpdateAcademicYearRequest;
use App\Models\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AcademicYearController extends Controller
{
    public function index(): Response
    {
        $years = AcademicYear::query()
            ->withCount('subjects')
            ->orderByDesc('start_date')
            ->get();

        return Inertia::render('admin/academic-years/index', [
            'academicYears' => $years,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/academic-years/create');
    }

    public function store(StoreAcademicYearRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            if (! empty($data['is_active'])) {
                AcademicYear::query()->update(['is_active' => false]);
            }
            AcademicYear::create($data);
        });

        return redirect()->route('admin.academic-years.index')
            ->with('success', 'Academic year created successfully.');
    }

    public function edit(AcademicYear $academicYear): Response
    {
        return Inertia::render('admin/academic-years/edit', [
            'academicYear' => $academicYear,
        ]);
    }

    public function update(UpdateAcademicYearRequest $request, AcademicYear $academicYear): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $academicYear) {
            if (! empty($data['is_active'])) {
                AcademicYear::query()->where('id', '!=', $academicYear->id)->update(['is_active' => false]);
            }
            $academicYear->update($data);
        });

        return redirect()->route('admin.academic-years.index')
            ->with('success', 'Academic year updated successfully.');
    }

    public function destroy(AcademicYear $academicYear): RedirectResponse
    {
        if ($academicYear->subjects()->exists()) {
            return back()->with('error', 'Cannot delete an academic year that has subjects.');
        }

        $academicYear->delete();

        return redirect()->route('admin.academic-years.index')
            ->with('success', 'Academic year deleted successfully.');
    }

    public function setActive(AcademicYear $academicYear): RedirectResponse
    {
        DB::transaction(function () use ($academicYear) {
            AcademicYear::query()->update(['is_active' => false]);
            $academicYear->update(['is_active' => true]);
        });

        return back()->with('success', "{$academicYear->name} is now the active academic year.");
    }
}

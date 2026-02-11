<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRubricCriteriaRequest;
use App\Http\Requests\Admin\UpdateRubricCriteriaRequest;
use App\Models\RubricCriteria;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RubricCriteriaController extends Controller
{
    public function index(): Response
    {
        $criteria = RubricCriteria::query()
            ->ordered()
            ->get();

        return Inertia::render('admin/rubrics/index', [
            'criteria' => $criteria,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/rubrics/create');
    }

    public function store(StoreRubricCriteriaRequest $request): RedirectResponse
    {
        RubricCriteria::create($request->validated());

        return redirect()->route('admin.rubrics.index')
            ->with('success', 'Rubric criteria created successfully.');
    }

    public function edit(RubricCriteria $rubric): Response
    {
        return Inertia::render('admin/rubrics/edit', [
            'criteria' => $rubric,
        ]);
    }

    public function update(UpdateRubricCriteriaRequest $request, RubricCriteria $rubric): RedirectResponse
    {
        $rubric->update($request->validated());

        return redirect()->route('admin.rubrics.index')
            ->with('success', 'Rubric criteria updated successfully.');
    }

    public function destroy(RubricCriteria $rubric): RedirectResponse
    {
        if ($rubric->scores()->exists()) {
            return back()->with('error', 'Cannot delete criteria that has been used in evaluations.');
        }

        $rubric->delete();

        return redirect()->route('admin.rubrics.index')
            ->with('success', 'Rubric criteria deleted successfully.');
    }

    public function toggleActive(RubricCriteria $rubric): RedirectResponse
    {
        $rubric->update(['is_active' => ! $rubric->is_active]);

        $status = $rubric->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Rubric criteria {$status} successfully.");
    }
}

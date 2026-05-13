<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        $announcements = Announcement::query()
            ->with('author:id,name')
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/announcements/index', [
            'announcements' => $announcements,
            'targetRoles' => Announcement::targetRoleOptions(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/announcements/create', [
            'targetRoles' => Announcement::targetRoleOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'target_role' => ['required', 'string', 'in:all,applicant,evaluator'],
            'is_published' => ['boolean'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $validated['author_id'] = auth()->id();

        if (! empty($validated['is_published'])) {
            $validated['published_at'] = now();
        }

        Announcement::create($validated);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement created successfully.');
    }

    public function edit(Announcement $announcement): Response
    {
        return Inertia::render('admin/announcements/edit', [
            'announcement' => $announcement,
            'targetRoles' => Announcement::targetRoleOptions(),
        ]);
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'target_role' => ['required', 'string', 'in:all,applicant,evaluator'],
            'is_published' => ['boolean'],
            'expires_at' => ['nullable', 'date'],
        ]);

        if (! empty($validated['is_published']) && ! $announcement->is_published) {
            $validated['published_at'] = now();
        } elseif (empty($validated['is_published'])) {
            $validated['published_at'] = null;
        }

        $announcement->update($validated);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement updated successfully.');
    }

    public function togglePublish(Announcement $announcement): RedirectResponse
    {
        if ($announcement->is_published) {
            $announcement->update(['is_published' => false, 'published_at' => null]);
        } else {
            $announcement->update(['is_published' => true, 'published_at' => now()]);
        }

        return back()->with('success', 'Announcement status updated.');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement deleted successfully.');
    }
}

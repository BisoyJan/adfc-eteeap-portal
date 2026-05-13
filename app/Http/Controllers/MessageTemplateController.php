<?php

namespace App\Http\Controllers;

use App\Models\MessageTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageTemplateController extends Controller
{
    public function index(): Response
    {
        $templates = MessageTemplate::where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('messages/templates/index', [
            'templates' => $templates,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
        ]);

        MessageTemplate::create([
            'user_id' => auth()->id(),
            ...$validated,
        ]);

        return back()->with('success', 'Template saved.');
    }

    public function update(Request $request, MessageTemplate $messageTemplate): RedirectResponse
    {
        if ($messageTemplate->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
        ]);

        $messageTemplate->update($validated);

        return back()->with('success', 'Template updated.');
    }

    public function destroy(MessageTemplate $messageTemplate): RedirectResponse
    {
        if ($messageTemplate->user_id !== auth()->id()) {
            abort(403);
        }

        $messageTemplate->delete();

        return back()->with('success', 'Template deleted.');
    }
}

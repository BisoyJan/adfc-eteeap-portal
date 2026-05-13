<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\MessageTemplate;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function inbox(): Response
    {
        $messages = Message::query()
            ->where('receiver_id', auth()->id())
            ->whereNull('parent_id')
            ->whereNull('receiver_deleted_at')
            ->with('sender:id,name,role')
            ->withCount(['replies' => fn ($q) => $q->where('receiver_id', auth()->id())])
            ->latest()
            ->paginate(20);

        return Inertia::render('messages/inbox', [
            'messages' => $messages,
            'unreadCount' => auth()->user()->unreadMessagesCount(),
        ]);
    }

    public function sent(): Response
    {
        $messages = Message::query()
            ->where('sender_id', auth()->id())
            ->whereNull('parent_id')
            ->whereNull('sender_deleted_at')
            ->with('receiver:id,name,role')
            ->withCount('replies')
            ->latest()
            ->paginate(20);

        return Inertia::render('messages/sent', [
            'messages' => $messages,
        ]);
    }

    public function show(Message $message): Response|RedirectResponse
    {
        $userId = auth()->id();

        if ($message->sender_id !== $userId && $message->receiver_id !== $userId) {
            abort(403);
        }

        if ($message->receiver_id === $userId && $message->read_at === null) {
            $message->update(['read_at' => now()]);
        }

        $message->load(['sender:id,name,role', 'receiver:id,name,role', 'attachments',
            'replies' => fn ($q) => $q->with(['sender:id,name,role', 'attachments'])->orderBy('created_at'),
        ]);

        return Inertia::render('messages/show', [
            'message' => $message,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = auth()->user();

        $recipients = $this->getAvailableRecipients($user);

        $preselectedId = $request->input('to');

        $templates = MessageTemplate::where('user_id', $user->id)
            ->latest()
            ->get(['id', 'title', 'subject', 'body']);

        return Inertia::render('messages/create', [
            'recipients' => $recipients,
            'preselectedId' => $preselectedId ? (int) $preselectedId : null,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'attachments.*' => ['nullable', 'file', 'max:5120', 'mimes:pdf,doc,docx,jpg,jpeg,png'],
        ]);

        if ((int) $validated['receiver_id'] === auth()->id()) {
            return back()->withErrors(['receiver_id' => 'You cannot send a message to yourself.']);
        }

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $validated['receiver_id'],
            'subject' => $validated['subject'],
            'body' => $validated['body'],
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('message-attachments', 'local');
                MessageAttachment::create([
                    'message_id' => $message->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        $message->load('sender');
        $message->receiver->notify(new NewMessageNotification($message));

        return redirect()->route('messages.sent')
            ->with('success', 'Message sent successfully.');
    }

    public function bulkStore(Request $request): RedirectResponse
    {
        if (! auth()->user()->isAdministrative()) {
            abort(403);
        }

        $validated = $request->validate([
            'receiver_ids' => ['required', 'array', 'min:1'],
            'receiver_ids.*' => ['required', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
        ]);

        foreach ($validated['receiver_ids'] as $receiverId) {
            if ((int) $receiverId !== auth()->id()) {
                Message::create([
                    'sender_id' => auth()->id(),
                    'receiver_id' => $receiverId,
                    'subject' => $validated['subject'],
                    'body' => $validated['body'],
                ]);
            }
        }

        return redirect()->route('messages.sent')
            ->with('success', 'Bulk message sent to '.count($validated['receiver_ids']).' recipients.');
    }

    public function reply(Request $request, Message $message): RedirectResponse
    {
        $userId = auth()->id();

        if ($message->sender_id !== $userId && $message->receiver_id !== $userId) {
            abort(403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:10000'],
        ]);

        $receiverId = $message->sender_id === $userId
            ? $message->receiver_id
            : $message->sender_id;

        $reply = Message::create([
            'sender_id' => $userId,
            'receiver_id' => $receiverId,
            'parent_id' => $message->id,
            'subject' => 'Re: '.$message->subject,
            'body' => $validated['body'],
        ]);

        $reply->load('sender');
        $reply->receiver->notify(new NewMessageNotification($reply));

        return back()->with('success', 'Reply sent.');
    }

    public function destroy(Message $message): RedirectResponse
    {
        $userId = auth()->id();

        if ($message->sender_id === $userId) {
            $message->update(['sender_deleted_at' => now()]);
        } elseif ($message->receiver_id === $userId) {
            $message->update(['receiver_deleted_at' => now()]);
        } else {
            abort(403);
        }

        return redirect()->route('messages.inbox')
            ->with('success', 'Message deleted.');
    }

    public function downloadAttachment(MessageAttachment $attachment): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $userId = auth()->id();
        $message = $attachment->message;

        if ($message->sender_id !== $userId && $message->receiver_id !== $userId) {
            abort(403);
        }

        return response()->download(
            Storage::disk('local')->path($attachment->file_path),
            $attachment->file_name,
        );
    }

    private function getAvailableRecipients(User $user): \Illuminate\Support\Collection
    {
        if ($user->isAdmin()) {
            return User::where('id', '!=', $user->id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'role', 'email']);
        }

        if ($user->isEvaluator()) {
            $assignedApplicantIds = $user->evaluatorAssignments()
                ->with('portfolio.user')
                ->get()
                ->pluck('portfolio.user_id')
                ->unique();

            return User::whereIn('id', $assignedApplicantIds)
                ->orWhere('role', UserRole::Admin)
                ->where('id', '!=', $user->id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'role', 'email']);
        }

        // Applicant: can message their assigned evaluators and admins
        $assignedEvaluatorIds = $user->portfolios()
            ->with('assignments.evaluator')
            ->get()
            ->flatMap(fn ($p) => $p->assignments)
            ->pluck('evaluator_id')
            ->unique();

        return User::whereIn('id', $assignedEvaluatorIds)
            ->orWhere('role', UserRole::Admin)
            ->where('id', '!=', $user->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'email']);
    }
}

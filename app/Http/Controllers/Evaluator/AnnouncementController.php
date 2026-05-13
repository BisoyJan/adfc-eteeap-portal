<?php

namespace App\Http\Controllers\Evaluator;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function __invoke(): Response
    {
        $announcements = Announcement::query()
            ->published()
            ->forRole('evaluator')
            ->latest('published_at')
            ->paginate(15);

        return Inertia::render('evaluator/announcements/index', [
            'announcements' => $announcements,
        ]);
    }
}

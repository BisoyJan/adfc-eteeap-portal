<?php

namespace App\Http\Controllers\Applicant;

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
            ->forRole('applicant')
            ->latest('published_at')
            ->paginate(15);

        return Inertia::render('applicant/announcements/index', [
            'announcements' => $announcements,
        ]);
    }
}

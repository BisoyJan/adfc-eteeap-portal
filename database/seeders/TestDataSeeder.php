<?php

namespace Database\Seeders;

use App\Enums\AssignmentStatus;
use App\Enums\EvaluationStatus;
use App\Enums\PortfolioStatus;
use App\Enums\SubjectAssignmentStatus;
use App\Enums\SubjectRecommendation;
use App\Models\AcademicYear;
use App\Models\DocumentCategory;
use App\Models\Evaluation;
use App\Models\EvaluationScore;
use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\PortfolioDocument;
use App\Models\PortfolioSubject;
use App\Models\PreAssessmentAnswer;
use App\Models\PreAssessmentAttempt;
use App\Models\PreAssessmentQuestion;
use App\Models\RubricCriteria;
use App\Models\Subject;
use App\Models\SubjectEvaluation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ────────────────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@adfc.edu.ph'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => \App\Enums\UserRole::Admin,
                'email_verified_at' => now(),
            ]
        );

        $evaluator1 = User::firstOrCreate(
            ['email' => 'evaluator@adfc.edu.ph'],
            [
                'name' => 'Maria Santos',
                'password' => Hash::make('password'),
                'role' => \App\Enums\UserRole::Evaluator,
                'email_verified_at' => now(),
            ]
        );

        $evaluator2 = User::firstOrCreate(
            ['email' => 'evaluator2@adfc.edu.ph'],
            [
                'name' => 'Jose Reyes',
                'password' => Hash::make('password'),
                'role' => \App\Enums\UserRole::Evaluator,
                'email_verified_at' => now(),
            ]
        );

        // Applicants with profile data
        $applicants = [
            [
                'email' => 'applicant@adfc.edu.ph',
                'name' => 'Juan dela Cruz',
                'current_position' => 'IT Support Specialist',
                'years_it_experience' => 5,
                'company' => 'TechCorp Philippines',
                'highest_education' => 'Associate Degree in Computer Technology',
            ],
            [
                'email' => 'applicant2@adfc.edu.ph',
                'name' => 'Ana Reyes',
                'current_position' => 'Junior Software Developer',
                'years_it_experience' => 3,
                'company' => 'Outsource Corp',
                'highest_education' => 'Associate Degree in Information Technology',
            ],
            [
                'email' => 'applicant3@adfc.edu.ph',
                'name' => 'Carlo Mendoza',
                'current_position' => 'Network Administrator',
                'years_it_experience' => 7,
                'company' => 'Globe Telecom',
                'highest_education' => 'Two-year Vocational Course (ICT)',
            ],
            [
                'email' => 'applicant4@adfc.edu.ph',
                'name' => 'Liza Garcia',
                'current_position' => 'Data Analyst',
                'years_it_experience' => 4,
                'company' => 'BDO Unibank',
                'highest_education' => 'Bachelor of Science in Business Administration',
            ],
            [
                'email' => 'applicant5@adfc.edu.ph',
                'name' => 'Rico Bautista',
                'current_position' => 'Systems Administrator',
                'years_it_experience' => 6,
                'company' => 'PLDT',
                'highest_education' => 'Diploma in Computer Hardware Technology',
            ],
        ];

        $applicantUsers = [];
        foreach ($applicants as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'role' => \App\Enums\UserRole::Applicant,
                    'email_verified_at' => now(),
                    'current_position' => $data['current_position'],
                    'years_it_experience' => $data['years_it_experience'],
                    'company' => $data['company'],
                    'highest_education' => $data['highest_education'],
                ]
            );
            $applicantUsers[] = $user;
        }

        // ── Supporting data ───────────────────────────────────────────────────
        $academicYear = AcademicYear::where('name', 'AY 2025-2026')->first();
        $subjects = Subject::where('academic_year_id', $academicYear?->id)->get();
        $docCategories = DocumentCategory::all();
        $rubricCriteria = RubricCriteria::all();

        // ── Pre-Assessment Questions (3 per subject) ──────────────────────────
        $this->seedPreAssessmentQuestions($subjects);

        // ── Portfolio 1: Draft (applicant 1) ─────────────────────────────────
        $portfolio1 = Portfolio::firstOrCreate(
            ['user_id' => $applicantUsers[0]->id, 'title' => 'Juan dela Cruz — BSIT Portfolio'],
            [
                'status' => PortfolioStatus::Draft,
                'submitted_at' => null,
                'admin_notes' => null,
            ]
        );
        $this->attachDocuments($portfolio1, $docCategories, 2);

        // ── Portfolio 2: Submitted (applicant 2) ─────────────────────────────
        $portfolio2 = Portfolio::firstOrCreate(
            ['user_id' => $applicantUsers[1]->id, 'title' => 'Ana Reyes — BSIT Portfolio'],
            [
                'status' => PortfolioStatus::Submitted,
                'submitted_at' => now()->subDays(3),
                'admin_notes' => null,
            ]
        );
        $this->attachDocuments($portfolio2, $docCategories, 4);

        // ── Portfolio 3: Under Review + Assigned to evaluator1 (applicant 3) ──
        $portfolio3 = Portfolio::firstOrCreate(
            ['user_id' => $applicantUsers[2]->id, 'title' => 'Carlo Mendoza — BSIT Portfolio'],
            [
                'status' => PortfolioStatus::UnderReview,
                'submitted_at' => now()->subDays(7),
                'admin_notes' => null,
            ]
        );
        $this->attachDocuments($portfolio3, $docCategories, 5);

        $assignment3 = PortfolioAssignment::firstOrCreate(
            ['portfolio_id' => $portfolio3->id, 'evaluator_id' => $evaluator1->id],
            [
                'assigned_by' => $admin->id,
                'status' => AssignmentStatus::InProgress,
                'due_date' => now()->addDays(7),
                'notes' => 'Priority review — applicant has strong work history.',
                'assigned_at' => now()->subDays(5),
                'completed_at' => null,
            ]
        );

        // Assign subjects to portfolio3 with evaluator
        $this->assignSubjectsToPortfolio($portfolio3, $subjects, $evaluator1, $admin);

        // Draft evaluation for portfolio3
        $this->createDraftEvaluation($portfolio3, $evaluator1, $assignment3, $rubricCriteria);

        // ── Portfolio 4: Under Review + Assigned to evaluator2 (applicant 4) ──
        $portfolio4 = Portfolio::firstOrCreate(
            ['user_id' => $applicantUsers[3]->id, 'title' => 'Liza Garcia — BSIT Portfolio'],
            [
                'status' => PortfolioStatus::UnderReview,
                'submitted_at' => now()->subDays(10),
                'admin_notes' => null,
            ]
        );
        $this->attachDocuments($portfolio4, $docCategories, 5);

        $assignment4 = PortfolioAssignment::firstOrCreate(
            ['portfolio_id' => $portfolio4->id, 'evaluator_id' => $evaluator2->id],
            [
                'assigned_by' => $admin->id,
                'status' => AssignmentStatus::Pending,
                'due_date' => now()->addDays(14),
                'notes' => null,
                'assigned_at' => now()->subDays(2),
                'completed_at' => null,
            ]
        );

        $this->assignSubjectsToPortfolio($portfolio4, $subjects, $evaluator2, $admin);

        // ── Portfolio 5: Evaluated + Approved (applicant 5) ──────────────────
        $portfolio5 = Portfolio::firstOrCreate(
            ['user_id' => $applicantUsers[4]->id, 'title' => 'Rico Bautista — BSIT Portfolio'],
            [
                'status' => PortfolioStatus::Approved,
                'submitted_at' => now()->subDays(30),
                'admin_notes' => 'Excellent portfolio. Applicant has strong experience.',
            ]
        );
        $this->attachDocuments($portfolio5, $docCategories, 6);

        $assignment5 = PortfolioAssignment::firstOrCreate(
            ['portfolio_id' => $portfolio5->id, 'evaluator_id' => $evaluator1->id],
            [
                'assigned_by' => $admin->id,
                'status' => AssignmentStatus::Completed,
                'due_date' => now()->subDays(10),
                'notes' => 'Completed ahead of schedule.',
                'assigned_at' => now()->subDays(28),
                'completed_at' => now()->subDays(14),
            ]
        );

        $this->assignSubjectsToPortfolio($portfolio5, $subjects, $evaluator1, $admin, completed: true);
        $this->createSubmittedEvaluation($portfolio5, $evaluator1, $assignment5, $rubricCriteria);

        // Pre-assessment attempts for portfolio3 (submitted but ungraded)
        $this->seedPreAssessmentAttempts($portfolio3, submitted: true, graded: false, grader: null);

        // Pre-assessment attempts for portfolio5 (submitted + graded)
        $this->seedPreAssessmentAttempts($portfolio5, submitted: true, graded: true, grader: $evaluator1);

        // ── Portfolio 6: Revision Requested (applicant 1, second portfolio) ───
        $portfolio6 = Portfolio::firstOrCreate(
            ['user_id' => $applicantUsers[0]->id, 'title' => 'Juan dela Cruz — Revised Portfolio'],
            [
                'status' => PortfolioStatus::RevisionRequested,
                'submitted_at' => now()->subDays(15),
                'admin_notes' => 'Please provide updated employment records and additional work samples.',
            ]
        );
        $this->attachDocuments($portfolio6, $docCategories, 3);

        $this->command->info('TestDataSeeder: seeded portfolios, assignments, subjects, evaluations, and pre-assessment data.');
    }

    /**
     * Seed 3 pre-assessment questions per subject.
     *
     * @param  \Illuminate\Database\Eloquent\Collection<int, Subject>  $subjects
     */
    private function seedPreAssessmentQuestions($subjects): void
    {
        $questionSets = [
            'IT101' => [
                'Describe your experience with any programming language. What projects have you built?',
                'Explain the difference between procedural and object-oriented programming with a real-world example from your work.',
                'How have you used scripting or automation in your current role?',
            ],
            'IT102' => [
                'Describe a database system you have worked with. What type of queries did you write regularly?',
                'Explain how you have designed or maintained a database schema in a professional setting.',
                'What challenges did you face with data integrity or performance, and how did you resolve them?',
            ],
            'IT103' => [
                'Describe your hands-on experience with network infrastructure (routers, switches, firewalls, VPNs, etc.).',
                'How have you troubleshot network connectivity issues in your workplace?',
                'Explain the OSI model and identify which layers you interact with most in your role.',
            ],
            'IT104' => [
                'Describe a project where you were involved in gathering requirements or designing a system.',
                'What methodologies (Agile, Waterfall, etc.) have you used, and what was your role?',
                'How did you document system workflows or processes in your current or previous job?',
            ],
        ];

        $fallback = [
            'Describe how this subject area is relevant to your current job responsibilities.',
            'Provide a specific example from your work experience that demonstrates knowledge in this subject.',
            'What formal or informal training have you completed related to this subject?',
        ];

        foreach ($subjects as $subject) {
            $questions = $questionSets[$subject->code] ?? $fallback;

            foreach ($questions as $order => $question) {
                PreAssessmentQuestion::firstOrCreate(
                    ['subject_id' => $subject->id, 'sort_order' => $order + 1],
                    [
                        'question' => $question,
                        'is_active' => true,
                    ]
                );
            }
        }
    }

    /**
     * Seed pre-assessment attempts with answers for all portfolio subjects.
     */
    private function seedPreAssessmentAttempts(
        Portfolio $portfolio,
        bool $submitted,
        bool $graded,
        ?User $grader,
    ): void {
        $portfolio->loadMissing('user');
        $portfolioSubjects = PortfolioSubject::where('portfolio_id', $portfolio->id)
            ->with('subject')
            ->get();

        $preAssessmentCriteria = RubricCriteria::where('category', 'pre_assessment')->get();
        $maxScore = $preAssessmentCriteria->sum('max_score');

        foreach ($portfolioSubjects as $portfolioSubject) {
            $questions = PreAssessmentQuestion::where('subject_id', $portfolioSubject->subject_id)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();

            if ($questions->isEmpty()) {
                continue;
            }

            $attempt = PreAssessmentAttempt::firstOrCreate(
                ['portfolio_subject_id' => $portfolioSubject->id, 'attempt_number' => 1],
                [
                    'narrative' => $submitted
                        ? 'I have been working in IT for several years and have applied the concepts from this subject extensively in my day-to-day responsibilities. My experience spans both technical implementation and project coordination, giving me a well-rounded foundation in '.strtolower($portfolioSubject->subject->name ?? 'this subject').'.'
                        : null,
                    'submitted_at' => $submitted ? now()->subDays(rand(5, 15)) : null,
                    'score' => $graded ? round($maxScore * (rand(70, 95) / 100), 2) : null,
                    'max_score' => $graded ? $maxScore : null,
                    'graded_by' => $graded ? $grader?->id : null,
                    'graded_at' => $graded ? now()->subDays(rand(1, 4)) : null,
                    'grader_comments' => $graded
                        ? 'The applicant provided detailed and relevant answers demonstrating strong practical knowledge.'
                        : null,
                ]
            );

            if ($submitted) {
                $sampleAnswers = [
                    'I have extensive hands-on experience in this area through my work at '.($portfolio->user->company ?? 'my company').'. The knowledge I gained on the job directly aligns with what this subject covers.',
                    'In my role as '.($portfolio->user->current_position ?? 'an IT professional').', I regularly apply these concepts to solve real-world problems. I have '.($portfolio->user->years_it_experience ?? 3).' years of practical experience in this domain.',
                    'I have completed multiple training programs and certifications related to this subject and have used this knowledge extensively in production environments.',
                ];

                foreach ($questions as $index => $question) {
                    PreAssessmentAnswer::firstOrCreate(
                        ['attempt_id' => $attempt->id, 'question_id' => $question->id],
                        ['answer' => $sampleAnswers[$index % count($sampleAnswers)]]
                    );
                }
            }
        }
    }

    /**
     * Attach a number of documents (cycling through categories) to a portfolio.
     *
     * @param  \Illuminate\Database\Eloquent\Collection<int, DocumentCategory>  $docCategories
     */
    private function attachDocuments(Portfolio $portfolio, $docCategories, int $count): void
    {
        $categories = $docCategories->take($count);

        foreach ($categories as $category) {
            PortfolioDocument::firstOrCreate(
                ['portfolio_id' => $portfolio->id, 'document_category_id' => $category->id],
                [
                    'file_name' => str_replace(' ', '_', strtolower($category->name)).'.pdf',
                    'file_path' => 'portfolios/'.$portfolio->id.'/'.$category->slug.'.pdf',
                    'file_size' => rand(51200, 2097152),
                    'mime_type' => 'application/pdf',
                    'notes' => null,
                ]
            );
        }
    }

    /**
     * Assign all subjects to a portfolio for evaluation.
     *
     * @param  \Illuminate\Database\Eloquent\Collection<int, Subject>  $subjects
     */
    private function assignSubjectsToPortfolio(
        Portfolio $portfolio,
        $subjects,
        User $evaluator,
        User $admin,
        bool $completed = false,
    ): void {
        foreach ($subjects as $subject) {
            PortfolioSubject::firstOrCreate(
                ['portfolio_id' => $portfolio->id, 'subject_id' => $subject->id],
                [
                    'evaluator_id' => $evaluator->id,
                    'assigned_by' => $admin->id,
                    'status' => $completed ? SubjectAssignmentStatus::Completed : SubjectAssignmentStatus::InProgress,
                    'recommendation' => $completed ? SubjectRecommendation::FullCredit : null,
                    'notes' => $completed ? 'Subject evaluation completed.' : null,
                    'assigned_at' => now()->subDays(rand(5, 20)),
                    'completed_at' => $completed ? now()->subDays(rand(1, 4)) : null,
                ]
            );
        }
    }

    /**
     * Create a draft evaluation with no scores.
     */
    private function createDraftEvaluation(
        Portfolio $portfolio,
        User $evaluator,
        PortfolioAssignment $assignment,
        $rubricCriteria,
    ): void {
        Evaluation::firstOrCreate(
            ['portfolio_id' => $portfolio->id, 'evaluator_id' => $evaluator->id],
            [
                'assignment_id' => $assignment->id,
                'status' => EvaluationStatus::Draft,
                'overall_comments' => null,
                'recommendation' => null,
                'total_score' => null,
                'max_possible_score' => null,
                'submitted_at' => null,
            ]
        );
    }

    /**
     * Create a fully submitted evaluation with scores for all portfolio-category rubric criteria.
     */
    private function createSubmittedEvaluation(
        Portfolio $portfolio,
        User $evaluator,
        PortfolioAssignment $assignment,
        $rubricCriteria,
    ): void {
        $portfolioCriteria = $rubricCriteria->where('category', 'portfolio');
        $maxPossible = $portfolioCriteria->sum('max_score');
        $totalScore = 0;

        $evaluation = Evaluation::firstOrCreate(
            ['portfolio_id' => $portfolio->id, 'evaluator_id' => $evaluator->id],
            [
                'assignment_id' => $assignment->id,
                'status' => EvaluationStatus::Submitted,
                'overall_comments' => 'The applicant demonstrates excellent IT knowledge and work experience directly relevant to the BSIT program. Strong documentation and professional references.',
                'recommendation' => 'approve',
                'total_score' => 0,
                'max_possible_score' => $maxPossible,
                'submitted_at' => now()->subDays(14),
            ]
        );

        foreach ($portfolioCriteria as $criteria) {
            $score = round($criteria->max_score * (rand(75, 100) / 100), 2);
            $totalScore += $score;

            EvaluationScore::firstOrCreate(
                ['evaluation_id' => $evaluation->id, 'rubric_criteria_id' => $criteria->id],
                [
                    'score' => $score,
                    'comments' => 'Well documented and clearly relevant to the subject matter.',
                ]
            );
        }

        $evaluation->update(['total_score' => $totalScore]);

        // Subject evaluations for each portfolio subject (interview category)
        $portfolioSubjects = PortfolioSubject::where('portfolio_id', $portfolio->id)->get();
        $interviewCriteria = $rubricCriteria->where('category', 'interview');

        foreach ($portfolioSubjects as $portfolioSubject) {
            $subjectMax = $interviewCriteria->sum('max_score');
            $subjectScore = 0;

            $subjectEval = SubjectEvaluation::firstOrCreate(
                [
                    'portfolio_subject_id' => $portfolioSubject->id,
                    'evaluator_id' => $evaluator->id,
                    'category' => 'interview',
                    'attempt_number' => 1,
                ],
                [
                    'status' => 'submitted',
                    'score' => 0,
                    'max_score' => $subjectMax,
                    'comments' => 'Applicant demonstrated solid understanding of the subject.',
                    'conducted_at' => now()->subDays(18),
                    'submitted_at' => now()->subDays(17),
                ]
            );

            foreach ($interviewCriteria as $criteria) {
                $score = round($criteria->max_score * (rand(70, 100) / 100), 2);
                $subjectScore += $score;

                \App\Models\SubjectEvaluationScore::firstOrCreate(
                    [
                        'subject_evaluation_id' => $subjectEval->id,
                        'rubric_criteria_id' => $criteria->id,
                    ],
                    [
                        'score' => $score,
                        'comments' => null,
                    ]
                );
            }

            $subjectEval->update(['score' => $subjectScore]);
        }
    }
}

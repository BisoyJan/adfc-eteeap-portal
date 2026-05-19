<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subject_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluator_id')->constrained('users')->cascadeOnDelete();
            $table->string('category', 40)->index(); // interview, worksite_visit, written_exam
            $table->unsignedTinyInteger('attempt_number')->default(1);
            $table->string('status', 20)->default('draft');
            $table->decimal('score', 6, 2)->default(0);
            $table->decimal('max_score', 6, 2)->default(0);
            $table->text('comments')->nullable();
            $table->timestamp('conducted_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['portfolio_subject_id', 'category', 'attempt_number'], 'subj_eval_unique');
        });

        Schema::create('subject_evaluation_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_evaluation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rubric_criteria_id')->constrained('rubric_criterias')->cascadeOnDelete();
            $table->decimal('score', 6, 2)->default(0);
            $table->text('comments')->nullable();
            $table->timestamps();

            $table->unique(['subject_evaluation_id', 'rubric_criteria_id'], 'subj_eval_score_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_evaluation_scores');
        Schema::dropIfExists('subject_evaluations');
    }
};

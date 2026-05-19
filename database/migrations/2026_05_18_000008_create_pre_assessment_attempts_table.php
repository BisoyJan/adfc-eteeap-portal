<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pre_assessment_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_subject_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('attempt_number')->default(1);
            $table->text('narrative')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->decimal('score', 6, 2)->nullable();
            $table->decimal('max_score', 6, 2)->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('graded_at')->nullable();
            $table->text('grader_comments')->nullable();
            $table->timestamps();

            $table->unique(['portfolio_subject_id', 'attempt_number'], 'pa_attempts_ps_attempt_unique');
        });

        Schema::create('pre_assessment_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('pre_assessment_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('pre_assessment_questions')->cascadeOnDelete();
            $table->text('answer')->nullable();
            $table->timestamps();

            $table->unique(['attempt_id', 'question_id'], 'pa_answers_attempt_q_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pre_assessment_answers');
        Schema::dropIfExists('pre_assessment_attempts');
    }
};

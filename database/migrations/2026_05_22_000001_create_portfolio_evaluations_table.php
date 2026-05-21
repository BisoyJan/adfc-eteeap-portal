<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluator_id')->constrained('users')->cascadeOnDelete();
            $table->string('category', 40)->index(); // interview, worksite_visit
            $table->unsignedTinyInteger('attempt_number')->default(1);
            $table->string('status', 20)->default('draft');
            $table->decimal('score', 6, 2)->default(0);
            $table->decimal('max_score', 6, 2)->default(0);
            $table->text('comments')->nullable();
            $table->timestamp('conducted_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['portfolio_id', 'category', 'attempt_number'], 'portfolio_eval_unique');
        });

        Schema::create('portfolio_evaluation_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_evaluation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rubric_criteria_id')->constrained('rubric_criterias')->cascadeOnDelete();
            $table->decimal('score', 6, 2)->default(0);
            $table->text('comments')->nullable();
            $table->timestamps();

            $table->unique(['portfolio_evaluation_id', 'rubric_criteria_id'], 'portfolio_eval_score_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_evaluation_scores');
        Schema::dropIfExists('portfolio_evaluations');
    }
};

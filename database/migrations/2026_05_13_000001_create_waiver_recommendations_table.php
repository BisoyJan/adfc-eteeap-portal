<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waiver_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluator_id')->constrained('users')->cascadeOnDelete();
            $table->string('course_code', 20);
            $table->string('course_name');
            $table->unsignedTinyInteger('academic_units')->default(3);
            $table->text('rationale')->nullable();
            $table->enum('status', ['recommended', 'not_recommended'])->default('recommended');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waiver_recommendations');
    }
};

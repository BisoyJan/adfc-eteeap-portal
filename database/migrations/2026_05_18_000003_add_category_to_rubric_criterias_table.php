<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rubric_criterias', function (Blueprint $table) {
            // Categories: interview | pre_assessment | worksite_visit | written_exam | portfolio
            // 'portfolio' preserves the legacy/general rubric used by existing evaluations.
            $table->string('category', 40)->default('portfolio')->after('description');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::table('rubric_criterias', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });
    }
};

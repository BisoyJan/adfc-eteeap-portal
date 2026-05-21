<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subject_modules', function (Blueprint $table) {
            $table->foreignId('portfolio_subject_id')
                ->nullable()
                ->after('subject_id')
                ->constrained('portfolio_subjects')
                ->cascadeOnDelete();

            // subject_id is now optional; ownership is via portfolio_subject_id
            $table->foreignId('subject_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('subject_modules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('portfolio_subject_id');
            $table->foreignId('subject_id')->nullable(false)->change();
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('current_position')->nullable()->after('email');
            $table->unsignedTinyInteger('years_it_experience')->nullable()->after('current_position');
            $table->string('company')->nullable()->after('years_it_experience');
            $table->string('highest_education')->nullable()->after('company');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'current_position',
                'years_it_experience',
                'company',
                'highest_education',
            ]);
        });
    }
};

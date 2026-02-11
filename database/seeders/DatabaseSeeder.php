<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->superAdmin()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@adfc.edu.ph',
        ]);

        User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@adfc.edu.ph',
        ]);

        User::factory()->evaluator()->create([
            'name' => 'Evaluator User',
            'email' => 'evaluator@adfc.edu.ph',
        ]);

        User::factory()->applicant()->create([
            'name' => 'Applicant User',
            'email' => 'applicant@adfc.edu.ph',
        ]);

        $this->call([
            DocumentCategorySeeder::class,
            RubricCriteriaSeeder::class,
        ]);
    }
}

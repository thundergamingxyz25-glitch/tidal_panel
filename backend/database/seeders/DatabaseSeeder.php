<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(['email' => 'admin@gmail.com'], [
            'name' => 'TidePanel Administrator',
            'password' => 'admin123',
            'is_admin' => true,
            'failed_login_attempts' => 0,
            'locked_until' => null,
        ]);
    }
}

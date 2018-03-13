<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // $this->call(UsersTableSeeder::class);
        DB::table('tasks')->insert([
            ['name' => 'task 1','content' => 'task 1','level' => 0],
            ['name' => 'task 2','content' => 'task 2','level' => 0],
            ['name' => 'task 3', 'content' => 'task 3', 'level'=> 1],
            ['name' => 'task 4', 'content' => 'task 4', 'level'=> 2],
            ['name' => 'task 5', 'content' => 'task 5', 'level'=> 1]
        ]);
    }
}

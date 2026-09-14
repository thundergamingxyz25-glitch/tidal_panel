<?php

use App\Services\LocalNodeService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

function renderDashboard(string $title, LocalNodeService $node): \Inertia\Response
{
    return Inertia::render('Dashboard', [
        'title' => $title,
        'servers' => auth()->user()?->servers()->latest()->get() ?? [],
        'node' => $node->health(),
    ]);
}

Route::get('/login', fn () => Inertia::render('Login'))->name('login');
Route::get('/register', fn () => Inertia::render('Register'))->name('register');
Route::get('/servers', fn () => Inertia::render('Servers'))->name('servers');
Route::get('/account/settings', fn () => Inertia::render('AccountSettings'))->name('account.settings');
Route::get('/admin', fn () => Inertia::render('AdminDashboard', ['title' => 'Infrastructure']))->name('admin.dashboard');
Route::get('/admin/{section}', function (string $section) {
    $titles = [
        'servers' => 'Servers',
        'users' => 'Users',
        'nodes' => 'Nodes & allocations',
        'eggs' => 'Nests & Eggs',
        'api' => 'Application API',
        'audit-logs' => 'Audit logs',
        'deploy' => 'Deploy server',
    ];
    abort_unless(array_key_exists($section, $titles), 404);
    return Inertia::render($section === 'deploy' ? 'AdminDeploy' : 'AdminDashboard', ['title' => $titles[$section]]);
})->whereIn('section', ['servers', 'users', 'nodes', 'eggs', 'api', 'audit-logs', 'deploy']);

Route::get('/', function (LocalNodeService $node) {
    return Inertia::render('Servers');
});

Route::get('/servers/{server}', function (string $server, LocalNodeService $node) {
    return Inertia::render('Dashboard', ['title' => 'Overview', 'serverId' => $server, 'servers' => [], 'node' => $node->health()]);
});

Route::get('/servers/{server}/{section}', function (string $server, string $section, LocalNodeService $node) {
    $titles = ['console' => 'Console', 'files' => 'Files', 'databases' => 'Databases', 'backups' => 'Backups', 'startup' => 'Startup', 'installer' => 'Installer', 'settings' => 'Server settings'];
    abort_unless(array_key_exists($section, $titles), 404);
    return Inertia::render('Dashboard', ['title' => $titles[$section], 'serverId' => $server, 'servers' => [], 'node' => $node->health()]);
})->whereIn('section', ['console', 'files', 'databases', 'backups', 'startup', 'installer', 'settings']);


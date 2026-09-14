<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ServerController;
use App\Http\Middleware\EnsureTwoFactorVerified;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\RegistrationController;
use App\Services\LocalNodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function (LocalNodeService $node) {
    return response()->json(['ok' => true, 'service' => 'tidepanel-api', 'node' => $node->health()]);
});

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/register', [RegistrationController::class, 'store'])->middleware('throttle:login');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/sessions', [AuthController::class, 'sessions']);
    Route::delete('/auth/sessions/{session}', [AuthController::class, 'revokeSession']);
});

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::apiResource('servers', ServerController::class)->only(['index', 'store', 'show']);
    Route::post('/servers/{server}/command', [ServerController::class, 'command']);
    Route::get('/servers/{server}/stats', [ServerController::class, 'stats']);
    Route::get('/servers/{server}/logs', [ServerController::class, 'logs']);
    Route::post('/servers/{server}/power', [ServerController::class, 'power']);
});

Route::middleware(['auth:sanctum', EnsureAdmin::class, 'throttle:api'])->prefix('admin')->group(function () {
    Route::get('/overview', [AdminController::class, 'overview']);
    Route::post('/servers', [AdminController::class, 'deploy']);
    Route::post('/users/{user}/impersonate', [AdminController::class, 'impersonate']);
    Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
});

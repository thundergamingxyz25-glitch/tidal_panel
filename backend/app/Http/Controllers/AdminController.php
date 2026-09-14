<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\AuthSession;
use App\Models\Server;
use App\Models\User;
use App\Services\LocalNodeService;
use App\Services\DockerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function deploy(Request $request, DockerService $docker): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'template' => ['required', 'in:python,nodejs,minecraft'],
            'template_version' => ['required', 'string', 'max:32'],
            'owner_id' => ['nullable', 'integer', 'exists:users,id'],
            'docker_image' => ['required', 'string', 'max:255'],
            'start_command' => ['nullable', 'string', 'max:4096'],
            'port' => ['required', 'integer', 'min:1', 'max:65535'],
            'cpu' => ['required', 'integer', 'min:1', 'max:6400'],
            'memory' => ['required', 'integer', 'min:128', 'max:1048576'],
            'disk' => ['required', 'integer', 'min:1024', 'max:10485760'],
        ]);
        $templates = [
            'minecraft' => [
                'Java 17' => ['itzg/minecraft-server:java17', 'java -Xms128M -Xmx${SERVER_MEMORY}M -jar server.jar nogui'],
                'Java 21' => ['itzg/minecraft-server:java21', 'java -Xms128M -Xmx${SERVER_MEMORY}M -jar server.jar nogui'],
            ],
            'nodejs' => [
                '20' => ['node:20-bookworm-slim', 'npm install --omit=dev && npm start'],
                '22' => ['node:22-bookworm-slim', 'npm install --omit=dev && npm start'],
            ],
            'python' => [
                '3.11' => ['python:3.11-slim', 'pip install -r requirements.txt && python main.py'],
                '3.12' => ['python:3.12-slim', 'pip install -r requirements.txt && python main.py'],
            ],
        ];
        abort_unless(isset($templates[$data['template']][$data['template_version']]), 422, 'Unsupported template version.');
        [$data['docker_image'], $data['start_command']] = $templates[$data['template']][$data['template_version']];
        $uuid = (string) Str::orderedUuid();
        $server = Server::create([
            ...$data,
            'uuid' => $uuid,
            'owner_id' => $data['owner_id'] ?? $request->user()->id,
            'container_name' => 'tidepanel-'.$uuid,
            'status' => 'installing',
        ]);
        try {
            $runtime = $docker->createAndStart($server);
            $server->forceFill(['status' => 'running'])->save();
            AuditLog::create(['actor_user_id' => $request->user()->id, 'subject_user_id' => $server->owner_id, 'action' => 'server.deployed', 'ip_address' => $request->ip(), 'metadata' => ['server_id' => $server->id, 'uuid' => $server->uuid, ...$runtime]]);
        } catch (\Throwable $error) {
            $server->forceFill(['status' => 'failed'])->save();
            AuditLog::create(['actor_user_id' => $request->user()->id, 'subject_user_id' => $server->owner_id, 'action' => 'server.deploy_failed', 'ip_address' => $request->ip(), 'metadata' => ['server_id' => $server->id, 'error' => $error->getMessage()]]);
            return response()->json(['message' => 'Docker provisioning failed.', 'detail' => $error->getMessage(), 'data' => $server], 502);
        }

        return response()->json(['data' => $server], 201);
    }

    public function overview(LocalNodeService $node): JsonResponse
    {
        return response()->json([
            'metrics' => [
                'users' => User::count(),
                'servers' => Server::count(),
                'running_servers' => Server::where('status', 'running')->count(),
                'active_sessions' => AuthSession::whereNull('revoked_at')->count(),
            ],
            'node' => $node->health(),
            'recent_activity' => AuditLog::latest('created_at')->limit(8)->get(),
        ]);
    }

    public function impersonate(Request $request, User $user): JsonResponse
    {
        abort_if($user->is_admin, 422, 'Administrative accounts cannot be impersonated.');
        $token = $user->createToken('admin-impersonation', ['impersonation']);
        AuthSession::create([
            'id' => (string) Str::uuid(),
            'authenticatable_type' => User::class,
            'authenticatable_id' => $user->id,
            'token_id' => $token->accessToken->id,
            'ip_address' => $request->ip(),
            'user_agent' => 'admin-impersonation: '.$request->userAgent(),
            'last_used_at' => now(),
        ]);
        AuditLog::create([
            'actor_user_id' => $request->user()->id,
            'subject_user_id' => $user->id,
            'action' => 'user.impersonated',
            'ip_address' => $request->ip(),
            'metadata' => ['token_id' => $token->accessToken->id, 'expires_in_minutes' => 30],
        ]);

        return response()->json(['token' => $token->plainTextToken, 'user' => $user, 'is_impersonating' => true, 'expires_in' => 1800]);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        return response()->json(['data' => AuditLog::latest('created_at')->limit(100)->get()]);
    }
}

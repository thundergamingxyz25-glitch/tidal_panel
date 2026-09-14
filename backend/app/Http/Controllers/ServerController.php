<?php

namespace App\Http\Controllers;

use App\Models\Server;
use App\Services\LocalNodeService;
use App\Services\DockerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->servers()->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'docker_image' => ['nullable', 'string', 'max:255'],
            'memory' => ['nullable', 'integer', 'min:128', 'max:1048576'],
            'disk' => ['nullable', 'integer', 'min:1024', 'max:10485760'],
            'cpu' => ['nullable', 'integer', 'min:1', 'max:6400'],
            'start_command' => ['nullable', 'string', 'max:4096'],
            'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
        ]);
        $data['container_name'] = 'tidepanel-' . Str::lower(Str::random(12));
        $server = $request->user()->servers()->create($data);

        return response()->json(['data' => $server], 201);
    }

    public function show(Request $request, Server $server): JsonResponse
    {
        $this->authorizeServer($request, $server);
        return response()->json(['data' => $server]);
    }

    public function command(Request $request, Server $server, LocalNodeService $node): JsonResponse
    {
        $this->authorizeServer($request, $server);
        $data = $request->validate(['command' => ['required', 'string', 'max:4096']]);
        abort_unless($server->container_name, 409, 'Server has no local container.');
        $node->sendCommand($server->container_name, $data['command']);

        return response()->json(['accepted' => true, 'command' => $data['command']]);
    }

    public function stats(Request $request, Server $server, DockerService $docker): JsonResponse
    {
        $this->authorizeServer($request, $server);
        return response()->json(['data' => $docker->getContainerStats($server)]);
    }

    public function logs(Request $request, Server $server, DockerService $docker): JsonResponse
    {
        $this->authorizeServer($request, $server);
        return response()->json(['data' => $docker->getContainerLogs($server)]);
    }

    public function power(Request $request, Server $server, DockerService $docker): JsonResponse
    {
        $this->authorizeServer($request, $server);
        $action = $request->validate(['action' => ['required', 'in:start,stop,restart,kill']])['action'];
        match ($action) {
            'start' => $docker->startContainer($server),
            'stop' => $docker->stopContainer($server),
            'restart' => $docker->restartContainer($server),
            'kill' => $docker->killContainer($server),
        };
        $server->forceFill(['status' => $action === 'start' || $action === 'restart' ? 'running' : 'offline'])->save();
        return response()->json(['accepted' => true, 'status' => $server->status]);
    }

    private function authorizeServer(Request $request, Server $server): void
    {
        abort_unless($server->owner_id === $request->user()->id, 403, 'You do not own this server.');
    }
}

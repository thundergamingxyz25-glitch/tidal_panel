<?php

namespace App\Services;

use Illuminate\Support\Facades\Process;

class LocalNodeService
{
    public function health(): array
    {
        $socket = '/var/run/docker.sock';
        $reachable = is_readable($socket) && is_writable($socket);

        return [
            'name' => 'local-node',
            'driver' => 'docker-engine',
            'socket' => $socket,
            'reachable' => $reachable,
            'status' => $reachable ? 'online' : 'unavailable',
        ];
    }

    public function sendCommand(string $container, string $command): void
    {
        abort_unless(preg_match('/^[a-zA-Z0-9_.-]+$/', $container), 422, 'Invalid container name.');
        abort_unless(mb_strlen($command) <= 4096, 422, 'Command is too long.');

        $result = Process::run(['docker', 'exec', $container, 'sh', '-lc', 'printf %s\\n ' . escapeshellarg($command)]);

        abort_unless($result->successful(), 502, 'Docker command failed: ' . trim($result->errorOutput()));
    }
}

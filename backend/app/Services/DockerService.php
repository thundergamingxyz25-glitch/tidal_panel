<?php

namespace App\Services;

use App\Models\Server;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\RequestOptions;
use Illuminate\Support\Facades\File;
use RuntimeException;

class DockerService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => 'http://localhost/v1.45/',
            'handler' => HandlerStack::create(),
            'curl' => [CURLOPT_UNIX_SOCKET_PATH => config('services.docker.socket', '/var/run/docker.sock')],
            'timeout' => 30,
            'http_errors' => false,
        ]);
    }

    public function createAndStart(Server $server): array
    {
        $volumeRoot = rtrim(config('services.docker.volume_root', '/var/lib/pterodactyl/volumes'), '/');
        $volumePath = $volumeRoot.'/'.$server->uuid;
        File::ensureDirectoryExists($volumePath, 0750, true);
        $this->pullImage($server->docker_image);
        $container = $this->request('POST', 'containers/create?name='.rawurlencode($server->container_name), [RequestOptions::JSON => [
            'Image' => $server->docker_image,
            'Tty' => true,
            'OpenStdin' => true,
            'AttachStdin' => true,
            'AttachStdout' => true,
            'AttachStderr' => true,
            'WorkingDir' => '/home/container',
            'Env' => ['EULA=TRUE', 'SERVER_MEMORY='.$server->memory],
            'Cmd' => $server->start_command ? ['sh', '-lc', $server->start_command] : null,
            'HostConfig' => [
                'Binds' => [$volumePath.':/home/container'],
                'Memory' => $server->memory * 1024 * 1024,
                'NanoCpus' => (int) round($server->cpu * 10000000),
                'PortBindings' => [$server->port.'/tcp' => [['HostPort' => (string) $server->port]], $server->port.'/udp' => [['HostPort' => (string) $server->port]]],
            ],
            'ExposedPorts' => [$server->port.'/tcp' => new \stdClass(), $server->port.'/udp' => new \stdClass()],
        ]]);
        $this->request('POST', "containers/{$server->container_name}/start");
        return ['container_id' => $container['Id'] ?? null, 'volume_path' => $volumePath];
    }

    public function startContainer(Server $server): void { $this->request('POST', "containers/{$this->containerName($server)}/start"); }
    public function stopContainer(Server $server): void { $this->request('POST', "containers/{$this->containerName($server)}/stop"); }
    public function restartContainer(Server $server): void { $this->request('POST', "containers/{$this->containerName($server)}/restart"); }
    public function killContainer(Server $server): void { $this->request('POST', "containers/{$this->containerName($server)}/kill"); }
    public function getContainerStats(Server $server): array { return $this->request('GET', "containers/{$this->containerName($server)}/stats?stream=false"); }
    public function getContainerLogs(Server $server): string { return $this->requestRaw('GET', "containers/{$this->containerName($server)}/logs?stdout=1&stderr=1&timestamps=1&tail=200"); }
    private function pullImage(string $image): void { $this->request('POST', 'images/create', [RequestOptions::QUERY => ['fromImage' => $image]]); }
    private function containerName(Server $server): string
    {
        abort_unless((bool) preg_match('/^[a-zA-Z0-9_.-]{1,128}$/', $server->container_name), 422, 'Invalid container name.');
        return $server->container_name;
    }

    private function request(string $method, string $uri, array $options = []): array
    {
        $options[RequestOptions::HEADERS] = ['Accept' => 'application/json', ...($options[RequestOptions::HEADERS] ?? [])];
        $response = $this->client->request($method, $uri, $options);
        $status = $response->getStatusCode();
        $payload = json_decode((string) $response->getBody(), true) ?: [];
        if ($status >= 400) throw new RuntimeException($payload['message'] ?? "Docker API returned HTTP {$status}.");
        return $payload;
    }

    private function requestRaw(string $method, string $uri): string
    {
        $response = $this->client->request($method, $uri, [RequestOptions::HEADERS => ['Accept' => 'text/plain']]);
        if ($response->getStatusCode() >= 400) throw new RuntimeException("Docker API returned HTTP {$response->getStatusCode()}.");
        return (string) $response->getBody();
    }
}

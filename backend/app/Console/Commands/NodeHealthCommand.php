<?php

namespace App\Console\Commands;

use App\Services\LocalNodeService;
use Illuminate\Console\Command;

class NodeHealthCommand extends Command
{
    protected $signature = 'tidepanel:node-health';
    protected $description = 'Check the local Docker node bridge';

    public function handle(LocalNodeService $node): int
    {
        $health = $node->health();
        $this->line(json_encode($health, JSON_PRETTY_PRINT));

        return $health['reachable'] ? self::SUCCESS : self::FAILURE;
    }
}

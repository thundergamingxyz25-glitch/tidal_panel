# TidePanel

A Laravel + React foundation for a local-node game server control plane.

## Development

```bash
cd backend && php artisan serve
cd frontend && npm install && npm run dev
```

The first vertical slice includes a responsive navy operations dashboard, resource telemetry visualization, audit activity preview, terminal preview, and a Laravel API boundary for local Docker-node health and command dispatch.

The Docker bridge intentionally lives in `backend/app/Services/LocalNodeService.php`; production deployments should run the app with a narrowly scoped Docker socket proxy or equivalent least-privilege policy.

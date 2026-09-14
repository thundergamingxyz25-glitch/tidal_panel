<!DOCTYPE html>
<html lang="en" class="bg-navy-950">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="min-h-screen bg-navy-950 text-white antialiased">
    @inertia
</body>
</html>

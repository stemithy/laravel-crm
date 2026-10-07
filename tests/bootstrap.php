<?php

use VentureDrake\LaravelCrm\Tests\Stubs\User;

require __DIR__.'/../vendor/autoload.php';

// Alias App\User once so models that reference it can resolve. We deliberately
// do NOT alias App\Models\User: the package service provider checks for that
// class to decide whether to call class_alias() itself, and a second boot in
// the same PHP process would then fail with a "cannot redeclare" fatal error.
if (! class_exists('App\\User', false)) {
    class_alias(User::class, 'App\\User');
}

// Provide a stub Vite manifest for the package build directory so view renders
// that call Vite do not fail under Testbench. The asset files themselves are
// not needed for assertions — only the manifest lookup must succeed.
$public = __DIR__.'/../vendor/orchestra/testbench-core/laravel/public/vendor/laravel-crm';
@mkdir($public, 0777, true);
@file_put_contents($public.'/manifest.json', json_encode([
    'resources/js/app.js' => [
        'file' => 'assets/app.js',
        'isEntry' => true,
        'src' => 'resources/js/app.js',
        'css' => ['assets/app.css']
    ],
    'resources/css/app.css' => [
        'file' => 'assets/app.css',
        'isEntry' => true,
        'src' => 'resources/css/app.css'
    ],
]));

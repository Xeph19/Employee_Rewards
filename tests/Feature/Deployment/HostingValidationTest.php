<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

it('validates database connectivity and required tables exist for hosting', function () {
    expect(DB::connection()->getPdo())->not->toBeNull();

    $tables = [
        'users',
        'roles',
        'role_user',
        'employees',
        'occasions',
        'company_values',
        'company_value_occasion',
        'wallets',
        'recognitions',
        'company_value_recognition',
        'ledger_entries',
        'personal_access_tokens',
    ];

    foreach ($tables as $table) {
        expect(Schema::hasTable($table))->toBeTrue("Expected table {$table} to exist");
    }
});

it('validates health and connectivity endpoints for production monitoring', function () {
    $this->get('/up')->assertOk();

    $this->getJson(route('api.connectivity'))
        ->assertOk()
        ->assertExactJson([
            'status' => 'ok',
            'services' => ['api' => 'connected', 'database' => 'connected'],
        ]);

    $this->getJson(route('api.health'))
        ->assertOk()
        ->assertExactJson([
            'status' => 'ok',
            'services' => ['api' => 'connected', 'database' => 'connected'],
        ]);
});

it('validates CORS and Sanctum configuration parsing for multi-domain hosting', function () {
    $allowedOrigins = config('cors.allowed_origins');
    expect($allowedOrigins)->toBeArray();
    expect(config('cors.supports_credentials'))->toBeTrue();

    $statefulDomains = config('sanctum.stateful');
    expect($statefulDomains)->toBeArray();
    expect(count($statefulDomains))->toBeGreaterThan(0);
});

it('validates root endpoint returns application metadata for load balancer health probes', function () {
    $this->getJson(route('home'))
        ->assertOk()
        ->assertJsonStructure(['application', 'api', 'status'])
        ->assertJsonPath('status', 'ok');
});

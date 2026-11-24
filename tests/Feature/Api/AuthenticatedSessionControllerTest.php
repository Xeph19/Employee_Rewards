<?php

use App\Models\User;

it('creates a stateful API session for valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'employee@example.com',
        'password' => 'password',
    ]);

    $response = $this
        ->withHeader('Origin', 'http://localhost:5173')
        ->postJson(route('api.session.store'), [
            'email' => 'employee@example.com',
            'password' => 'password',
        ]);

    $response->assertOk()->assertJsonPath('data.id', $user->id);
    $this->assertAuthenticatedAs($user);
});

it('returns 422 for invalid credentials', function () {
    User::factory()->create(['email' => 'employee@example.com']);

    $this
        ->withHeader('Origin', 'http://localhost:5173')
        ->postJson(route('api.session.store'), [
            'email' => 'employee@example.com',
            'password' => 'incorrect-password',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

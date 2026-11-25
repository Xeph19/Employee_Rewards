<?php

use App\Enums\RecognitionType;
use App\Enums\RoleName;
use App\Models\Recognition;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Str;

it('returns recognitions five at a time in descending order (latest to oldest)', function () {
    $role = Role::query()->create(['name' => RoleName::Employee->value, 'label' => 'Employee']);
    $viewer = User::factory()->create();
    $viewer->roles()->attach($role);
    $recipient = User::factory()->create();
    $awarder = User::factory()->create();

    $recognitions = collect(range(1, 11))->map(fn (int $number) => Recognition::query()->create([
        'public_id' => (string) Str::uuid(),
        'recipient_id' => $recipient->id,
        'awarded_by' => $awarder->id,
        'type' => RecognitionType::AdHoc,
        'message' => "Recognition {$number}",
        'points' => 100,
        'request_key' => "feed-{$number}",
        'created_at' => now()->addMinutes($number),
    ]));

    $firstPage = $this->actingAs($viewer)->getJson(route('api.recognitions.index'));
    $secondPage = $this->actingAs($viewer)->getJson(route('api.recognitions.index', ['page' => 2]));

    $firstPage->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('meta.per_page', 5)
        ->assertJsonPath('meta.total', 11)
        ->assertJsonPath('data.0.id', $recognitions->last()->id)
        ->assertJsonPath('data.4.id', $recognitions->get(6)->id);
    $secondPage->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('data.0.id', $recognitions->get(5)->id);
});

it('requires authentication to view the recognition feed', function () {
    $this->getJson(route('api.recognitions.index'))->assertUnauthorized();
});

<?php

use App\Enums\RoleName;
use App\Models\CompanyValue;
use App\Models\Employee;
use App\Models\Occasion;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Http;

function suggestionManager(): User
{
    $role = Role::query()->create(['name' => RoleName::Manager->value, 'label' => 'Manager']);
    $user = User::factory()->create();
    $user->roles()->attach($role);
    Employee::query()->create(['user_id' => $user->id, 'employee_number' => 'M-300', 'department' => 'Engineering', 'job_title' => 'Manager']);

    return $user;
}

it('returns an editable Gemini message suggestion', function () {
    Http::preventStrayRequests();
    Http::fake(['generativelanguage.googleapis.com/*' => Http::response([
        'candidates' => [['content' => ['parts' => [['text' => 'Thank you for putting customers first and helping the team succeed.']]]]],
    ])]);
    config()->set('services.gemini.key', 'test-key');
    $manager = suggestionManager();
    $occasion = Occasion::query()->create(['name' => 'Above & Beyond']);
    $value = CompanyValue::query()->create(['name' => 'Customer First', 'color' => '#F11F18']);

    $response = $this->actingAs($manager)->postJson(route('api.message-suggestions.store'), [
        'occasion_id' => $occasion->id,
        'company_value_ids' => [$value->id],
        'recipient_name' => 'Amelia',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.source', 'gemini')
        ->assertJsonPath('data.message', 'Thank you for putting customers first and helping the team succeed.');
    Http::assertSentCount(1);
});

it('uses the manual fallback when Gemini is not configured', function () {
    Http::preventStrayRequests();
    config()->set('services.gemini.key', null);
    $manager = suggestionManager();
    $value = CompanyValue::query()->create(['name' => 'One Team', 'color' => '#F11F18']);

    $response = $this->actingAs($manager)->postJson(route('api.message-suggestions.store'), [
        'company_value_ids' => [$value->id],
        'recipient_name' => 'Kai',
    ]);

    $response->assertOk()->assertJsonPath('data.source', 'fallback')->assertJsonFragment(['source' => 'fallback']);
    expect($response->json('data.message'))->toContain('Kai')->toContain('One Team');
    Http::assertNothingSent();
});

it('generates a message for an occasion without company values', function () {
    Http::preventStrayRequests();
    config()->set('services.gemini.key', null);
    $manager = suggestionManager();
    $occasion = Occasion::query()->create(['name' => 'Work Anniversary']);

    $response = $this->actingAs($manager)->postJson(route('api.message-suggestions.store'), [
        'occasion_id' => $occasion->id,
        'company_value_ids' => [],
        'recipient_name' => 'Ari',
    ]);

    $response->assertOk()->assertJsonPath('data.source', 'fallback');
    expect($response->json('data.message'))->toContain('Ari')->toContain('Work Anniversary');
    Http::assertNothingSent();
});

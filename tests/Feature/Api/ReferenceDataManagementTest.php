<?php

use App\Enums\RoleName;
use App\Models\CompanyValue;
use App\Models\Occasion;
use App\Models\Recognition;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Str;

function referenceDataUser(RoleName $roleName): User
{
    $role = Role::query()->create(['name' => $roleName->value, 'label' => ucfirst($roleName->value)]);
    $user = User::factory()->create();
    $user->roles()->attach($role);

    return $user;
}

it('allows an administrator to update and deactivate reference data', function () {
    $admin = referenceDataUser(RoleName::Admin);
    $value = CompanyValue::query()->create(['name' => 'Ownership', 'description' => 'Own outcomes.', 'color' => '#F11F18']);
    $occasion = Occasion::query()->create(['name' => 'Delivery', 'default_points' => 50]);

    $this->actingAs($admin)->patchJson(route('api.company-values.update', $value), [
        'name' => 'Customer Ownership',
        'description' => 'Own customer outcomes.',
        'color' => '#F11F18',
    ])->assertOk();

    $this->actingAs($admin)->patchJson(route('api.occasions.update', $occasion), [
        'name' => 'Project Delivery',
        'default_points' => 100,
        'company_value_ids' => [$value->id],
    ])->assertOk()->assertJsonPath('data.company_values.0.id', $value->id);

    $this->actingAs($admin)->deleteJson(route('api.company-values.destroy', $value))->assertNoContent();
    $this->actingAs($admin)->deleteJson(route('api.occasions.destroy', $occasion))->assertNoContent();

    $this->assertDatabaseHas('company_values', ['id' => $value->id, 'name' => 'Customer Ownership', 'is_active' => false]);
    $this->assertDatabaseHas('occasions', ['id' => $occasion->id, 'name' => 'Project Delivery', 'is_active' => false]);

    // Reactivation
    $this->actingAs($admin)->patchJson(route('api.company-values.update', $value), ['is_active' => true])->assertOk();
    $this->actingAs($admin)->patchJson(route('api.occasions.update', $occasion), ['is_active' => true])->assertOk();
    $this->assertDatabaseHas('company_values', ['id' => $value->id, 'is_active' => true]);
    $this->assertDatabaseHas('occasions', ['id' => $occasion->id, 'is_active' => true]);

    // Force deletion
    $this->actingAs($admin)->deleteJson(route('api.company-values.destroy', $value), ['force' => true])->assertNoContent();
    $this->actingAs($admin)->deleteJson(route('api.occasions.destroy', $occasion), ['force' => true])->assertNoContent();
    $this->assertDatabaseMissing('company_values', ['id' => $value->id]);
    $this->assertDatabaseMissing('occasions', ['id' => $occasion->id]);
});

it('blocks permanent deletion of a company value used in recognitions', function () {
    $admin = referenceDataUser(RoleName::Admin);
    $recipient = User::factory()->create();
    $value = CompanyValue::query()->create(['name' => 'Integrity', 'color' => '#112233']);

    $recognition = Recognition::query()->create([
        'public_id' => (string) Str::uuid(),
        'recipient_id' => $recipient->id,
        'awarded_by' => $admin->id,
        'type' => 'ad_hoc',
        'message' => 'Integrity in action.',
        'points' => 100,
        'request_key' => 'unique-test-key-integrity',
    ]);
    $recognition->companyValues()->attach($value->id);

    $this->actingAs($admin)->deleteJson(route('api.company-values.destroy', $value), ['force' => true])
        ->assertStatus(422)
        ->assertJsonPath('message', 'Cannot permanently delete a company value used in existing recognitions. Deactivate it instead.');

    $this->assertDatabaseHas('company_values', ['id' => $value->id]);
});

it('forbids employees from managing reference data', function () {
    $employee = referenceDataUser(RoleName::Employee);
    $value = CompanyValue::query()->create(['name' => 'One Team', 'color' => '#F11F18']);

    $this->actingAs($employee)->patchJson(route('api.company-values.update', $value), ['name' => 'Changed'])
        ->assertForbidden();
});

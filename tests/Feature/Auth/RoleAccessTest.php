<?php

use App\Enums\RoleName;
use App\Models\Role;
use App\Models\User;

it('allows each seeded role to access the authenticated dashboard', function (RoleName $roleName) {
    $role = Role::query()->create(['name' => $roleName->value, 'label' => ucfirst($roleName->value)]);
    $user = User::factory()->create();
    $user->roles()->attach($role);

    $this->actingAs($user)->getJson(route('api.dashboard'))->assertOk();
})->with(RoleName::cases());

it('returns 401 from the dashboard for guests', function () {
    $this->getJson(route('api.dashboard'))->assertUnauthorized();
});

<?php

use App\Enums\RoleName;
use App\Models\Employee;
use App\Models\Merchant;
use App\Models\Redemption;
use App\Models\Reward;
use App\Models\Role;
use App\Models\User;
use App\Models\Wallet;

function redemptionFixture(int $balance = 500, int $cost = 100): array
{
    $role = Role::query()->create(['name' => RoleName::Employee->value, 'label' => 'Employee']);
    $user = User::factory()->create();
    $user->roles()->attach($role);
    Employee::query()->create(['user_id' => $user->id, 'employee_number' => 'E-200', 'department' => 'Engineering', 'job_title' => 'Engineer']);
    $wallet = Wallet::query()->create(['user_id' => $user->id, 'balance' => $balance]);
    $merchant = Merchant::query()->create(['name' => 'Marina Test Market', 'slug' => 'marina-test-market', 'category' => 'Dining']);
    $reward = Reward::query()->create(['merchant_id' => $merchant->id, 'name' => 'Test Voucher', 'slug' => 'test-voucher', 'points_cost' => $cost, 'stock_quantity' => 2]);

    return compact('user', 'wallet', 'reward');
}

it('redeems once for a duplicate request key', function () {
    ['user' => $user, 'wallet' => $wallet, 'reward' => $reward] = redemptionFixture();
    $payload = ['reward_id' => $reward->id, 'request_key' => 'redeem-once'];

    $first = $this->actingAs($user)->postJson(route('api.redemptions.store'), $payload)->assertCreated();
    $second = $this->actingAs($user)->postJson(route('api.redemptions.store'), $payload)->assertCreated();

    expect($second->json('data.id'))->toBe($first->json('data.id'));
    $this->assertDatabaseCount('redemptions', 1);
    $this->assertDatabaseCount('ledger_entries', 1);
    $this->assertDatabaseHas('wallets', ['id' => $wallet->id, 'balance' => 400]);
    $this->assertDatabaseHas('rewards', ['id' => $reward->id, 'stock_quantity' => 1]);
});

it('rejects redemption with insufficient funds without changing state', function () {
    ['user' => $user, 'wallet' => $wallet, 'reward' => $reward] = redemptionFixture(balance: 50, cost: 100);

    $this->actingAs($user)->postJson(route('api.redemptions.store'), ['reward_id' => $reward->id, 'request_key' => 'too-expensive'])
        ->assertUnprocessable()->assertJsonValidationErrors('reward_id');

    $this->assertDatabaseCount('redemptions', 0);
    $this->assertDatabaseHas('wallets', ['id' => $wallet->id, 'balance' => 50]);
});

it('prevents competing requests from overspending the locked wallet', function () {
    ['user' => $user, 'wallet' => $wallet, 'reward' => $reward] = redemptionFixture(balance: 100, cost: 100);

    $this->actingAs($user)->postJson(route('api.redemptions.store'), ['reward_id' => $reward->id, 'request_key' => 'competing-a'])->assertCreated();
    $this->actingAs($user)->postJson(route('api.redemptions.store'), ['reward_id' => $reward->id, 'request_key' => 'competing-b'])->assertUnprocessable();

    $this->assertDatabaseCount('redemptions', 1);
    $this->assertDatabaseHas('wallets', ['id' => $wallet->id, 'balance' => 0]);
    expect(Redemption::query()->sum('points_spent'))->toBe(100);
});

it('returns only the authenticated users redemption history', function () {
    ['user' => $user, 'reward' => $reward] = redemptionFixture();
    $this->actingAs($user)->postJson(route('api.redemptions.store'), ['reward_id' => $reward->id, 'request_key' => 'history-one'])->assertCreated();
    $other = User::factory()->create();

    $response = $this->actingAs($user)->getJson(route('api.redemptions.index'));

    $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.user_id', $user->id);
    expect($response->json('data.0.user_id'))->not->toBe($other->id);
});

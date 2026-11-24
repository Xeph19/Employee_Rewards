<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_the_api_status_from_the_home_page(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk()->assertJsonPath('status', 'ok');
    }
}

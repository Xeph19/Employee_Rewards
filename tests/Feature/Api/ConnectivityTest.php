<?php

it('reports API and database connectivity', function () {
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

    $this->getJson(route('health'))
        ->assertOk()
        ->assertExactJson([
            'status' => 'ok',
            'services' => ['api' => 'connected', 'database' => 'connected'],
        ]);
});

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $manager_id
 * @property string $employee_number
 * @property string $department
 * @property string $job_title
 * @property string|null $joined_at
 * @property string|null $birth_date
 * @property bool $is_active
 * @property-read User|null $user
 * @property-read Employee|null $manager
 */
#[Fillable(['user_id', 'manager_id', 'employee_number', 'department', 'job_title', 'joined_at', 'birth_date', 'is_active'])]
class Employee extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(self::class, 'manager_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(self::class, 'manager_id');
    }

    protected function casts(): array
    {
        return [
            'joined_at' => 'date',
            'birth_date' => 'date',
            'is_active' => 'boolean',
        ];
    }
}

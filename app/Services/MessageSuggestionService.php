<?php

namespace App\Services;

use App\Models\CompanyValue;
use App\Models\Occasion;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class MessageSuggestionService
{
    /** @param list<int> $companyValueIds */
    public function suggest(?Occasion $occasion, array $companyValueIds, ?string $recipientName): array
    {
        $values = CompanyValue::query()->whereKey($companyValueIds)->active()->orderBy('name')->pluck('name');
        $fallback = $this->fallback($occasion?->name, $values->all(), $recipientName);
        $apiKey = config('services.gemini.key');

        if (! is_string($apiKey) || $apiKey === '') {
            return ['message' => $fallback, 'source' => 'fallback'];
        }

        $prompt = 'Write one warm, specific workplace appreciation message under 80 words. '
            .'Do not include quotation marks, headings, placeholders, or points. '
            .'Recipient: '.($recipientName ?: 'a colleague').'. '
            .'Occasion: '.($occasion?->name ?: 'ad hoc recognition').'. '
            .'Company values: '.($values->isEmpty() ? 'none selected' : $values->join(', ')).'.';

        try {
            $response = Http::asJson()
                ->withHeaders(['x-goog-api-key' => $apiKey])
                ->connectTimeout(2)
                ->timeout(6)
                ->post(rtrim(config('services.gemini.base_url'), '/').'/models/'.config('services.gemini.model').':generateContent', [
                    'contents' => [['parts' => [['text' => $prompt]]]],
                    'generationConfig' => ['temperature' => 0.7, 'maxOutputTokens' => 160],
                ]);

            if (! $response->successful()) {
                return ['message' => $fallback, 'source' => 'fallback'];
            }

            $message = Str::of((string) $response->json('candidates.0.content.parts.0.text'))->stripTags()->trim()->limit(1000, '')->toString();

            return $message !== '' ? ['message' => $message, 'source' => 'gemini'] : ['message' => $fallback, 'source' => 'fallback'];
        } catch (Throwable) {
            return ['message' => $fallback, 'source' => 'fallback'];
        }
    }

    /** @param list<string> $values */
    private function fallback(?string $occasion, array $values, ?string $recipientName): string
    {
        $name = $recipientName ?: 'there';
        $valueText = $values === [] ? 'the difference you make' : implode(' and ', $values);
        $occasionText = $occasion ? " on {$occasion}" : '';

        return "Thank you, {$name}, for demonstrating {$valueText}{$occasionText}. Your contribution made a meaningful impact on the team, and it is genuinely appreciated.";
    }
}

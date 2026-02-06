import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  private readonly apiUrl =
    'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';
  private readonly hfToken = process.env.HF_TOKEN;

  async embed(text: string, retries = 2): Promise<number[]> {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json',
            'X-Wait-For-Model': 'true',
          },
          body: JSON.stringify({ inputs: text }),
        });

        // Handle "Model is loading" 503 error
        if (response.status === 503 && i < retries) {
          await new Promise((res) => setTimeout(res, 5000));
          continue;
        }

        if (!response.ok)
          throw new Error(`HF API error: ${response.statusText}`);

        return await response.json(); // ✅ Return 1
      } catch (error) {
        if (i === retries) {
          throw new HttpException(
            'AI Service Timeout',
            HttpStatus.GATEWAY_TIMEOUT,
          ); // ✅ Return 2 (Throw)
        }
        console.log(`Retry ${i + 1}...`);
      }
    }

    // ⬇️ ADD THIS LINE HERE ⬇️
    throw new HttpException(
      'Unexpected Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

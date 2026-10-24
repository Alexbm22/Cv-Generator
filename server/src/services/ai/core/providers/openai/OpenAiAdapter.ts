import { AiCompletionRequest, AiCompletionResult, AiService } from '../../AiService';
import { openai } from './client';

type FinishReason = AiCompletionResult['finishReason'];

function mapFinishReason(reason: string | null | undefined): FinishReason {
  switch (reason) {
    case 'stop':
    case 'length':
    case 'content_filter':
      return reason;
    default:
      return reason ? 'other' : null;
  }
}

export class OpenAiAdapter implements AiService {
  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const completion = await openai.chat.completions.create(
      {
        model: request.model.modelId,
        messages: request.messages,
        temperature: request.model.params.temperature,
        max_tokens: request.model.params.maxOutputTokens,
        response_format: request.responseFormat === 'json' ? { type: 'json_object' as const } : undefined,
      },
      { signal: request.signal },
    );

    const choice = completion.choices[0];
    return {
      content: choice?.message?.content ?? null,
      model: completion.model,
      usage: completion.usage
        ? {
            inputTokens: completion.usage.prompt_tokens,
            outputTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : null,
      finishReason: mapFinishReason(choice?.finish_reason),
    };
  }
}

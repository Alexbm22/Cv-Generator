import { AiPurpose, ModelSelection } from '../pipeline/types';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionRequest {
  purpose: AiPurpose;
  messages: AiMessage[];
  model: ModelSelection;
  responseFormat: 'json' | 'text';
  signal?: AbortSignal;
}

export interface AiCompletionResult {
  content: string | null;
  model: string;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number } | null;
  finishReason: 'stop' | 'length' | 'content_filter' | 'other' | null;
}

export interface AiService {
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
}

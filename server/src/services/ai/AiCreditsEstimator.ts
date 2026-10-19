import { defaultConfig } from '../../config/aiCreditsEstimator.config';
import { FEATURES } from '../../ai/models.catalog';
import type { Feature, TokenLimits } from '../../ai/models.catalog';
import { resolveModelPolicy } from '../../ai/policy.service';
import { getPriceAt } from '../../ai/pricing.service';

export type EditType = Feature;

export type TokenKind = 'input' | 'output';

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ModelPricing {
  inputPerMTok: number;
  outputPerMTok: number;
}

export interface EstimatorTarget {
  model: string;
  pricing: ModelPricing;
  limits: TokenLimits;
}

export interface EstimatorConfig {
  creditValueUsd: number;
  charsPerToken: number;
  safetyMargin: number;
  systemPromptTokens: Record<EditType, number>;
  output: Record<EditType, { minTokens: number; maxTokens: number }>;
  difficulty: {
    promptCharsSaturation: number;
    dataCharsSaturation: number;
    weights: Record<EditType, { prompt: number; data: number }>;
  };
}

const EDIT_TYPES: readonly EditType[] = FEATURES;
const WEIGHT_SUM_TOLERANCE = 1e-9;

/**
 * Estimates export/edit credits for an AI request. Estimation is pure and synchronous;
 * model, pricing and limits come from the AI configuration layer via `forPlan`.
 */
export class AiCreditsEstimator {
  private readonly config: EstimatorConfig;
  private readonly editType: EditType;
  private readonly pricePerMTok: Record<TokenKind, number>;
  private readonly limits: TokenLimits;
  public readonly model: string;

  /**
   * Resolves the model, limits and current price configured for a plan.
   * @throws AppError if no price is configured for the resolved model.
   */
  static async forPlan(
    editType: EditType,
    planId: string,
    config: EstimatorConfig = defaultConfig,
  ): Promise<AiCreditsEstimator> {
    const policy = await resolveModelPolicy(editType, planId);
    const price = await getPriceAt(policy.model);
    return new AiCreditsEstimator(
      {
        model: policy.model,
        pricing: { inputPerMTok: Number(price.inputPerMTok), outputPerMTok: Number(price.outputPerMTok) },
        limits: policy.limits,
      },
      editType,
      config,
    );
  }

  /**
   * @throws Error if the target pricing, edit type or config is invalid.
   */
  constructor(target: EstimatorTarget, editType: EditType, config: EstimatorConfig = defaultConfig) {
    validateConfig(config);
    if (!EDIT_TYPES.includes(editType)) {
      throw new Error(`Unknown edit type "${editType}"`);
    }
    const { pricing } = target;
    if (!Number.isFinite(pricing.inputPerMTok) || pricing.inputPerMTok < 0
      || !Number.isFinite(pricing.outputPerMTok) || pricing.outputPerMTok < 0) {
      throw new Error(`Invalid pricing for model "${target.model}"`);
    }

    this.config = config;
    this.editType = editType;
    this.model = target.model;
    this.limits = target.limits;
    this.pricePerMTok = { input: pricing.inputPerMTok, output: pricing.outputPerMTok };
  }

  /**
   * Estimates the credits needed to send a plain text as input. Empty text costs 0.
   */
  public estimateFromString(text: string): number {
    if (text.length === 0) return 0;

    const tokens = this.countTokens(text.length);
    return Math.ceil(this.tokensToCredits(tokens, 'input') * this.config.safetyMargin);
  }

  /**
   * Estimates the credits for one edit request, including the expected output. Minimum is 1.
   * Object data is serialized with JSON.stringify before measuring.
   */
  public estimateEdit(history: HistoryMessage[], prompt: string, data: string | object): number {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const historyLength = history.reduce((sum, message) => sum + message.content.length, 0);

    const inputTokens =
      this.config.systemPromptTokens[this.editType] +
      this.countTokens(historyLength) +
      this.countTokens(prompt.length) +
      this.countTokens(dataString.length);

    const difficulty = this.computeDifficulty(prompt.length, dataString.length, this.editType);
    const { minTokens, maxTokens } = this.config.output[this.editType];
    const outputTokens = Math.min(
      minTokens + difficulty * (maxTokens - minTokens),
      this.limits.maxOutputTokens,
    );

    const credits =
      this.tokensToCredits(inputTokens, 'input') + this.tokensToCredits(outputTokens, 'output');
    return Math.max(1, Math.ceil(credits * this.config.safetyMargin));
  }

  private countTokens(length: number): number {
    return Math.ceil(length / this.config.charsPerToken);
  }

  private computeDifficulty(promptLength: number, dataLength: number, editType: EditType): number {
    if (!isValidLength(promptLength) || !isValidLength(dataLength)) {
      throw new RangeError('Lengths must be finite and non-negative');
    }

    const { promptCharsSaturation, dataCharsSaturation, weights } = this.config.difficulty;
    const promptRatio = Math.min(promptLength / promptCharsSaturation, 1);
    const dataRatio = Math.min(dataLength / dataCharsSaturation, 1);
    const { prompt, data } = weights[editType];

    return Math.min(Math.max(prompt * promptRatio + data * dataRatio, 0), 1);
  }

  private tokensToCredits(tokens: number, kind: TokenKind): number {
    return (tokens * this.pricePerMTok[kind]) / 1_000_000 / this.config.creditValueUsd;
  }
}

function isValidLength(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function validateConfig(config: EstimatorConfig): void {
  const fail = (message: string): never => {
    throw new Error(`Invalid AiCreditsEstimator config: ${message}`);
  };
  const isPositive = (value: number): boolean => Number.isFinite(value) && value > 0;
  const isNonNegative = (value: number): boolean => Number.isFinite(value) && value >= 0;

  if (!isPositive(config.creditValueUsd)) fail('creditValueUsd must be > 0');
  if (!isPositive(config.charsPerToken)) fail('charsPerToken must be > 0');
  if (!isPositive(config.safetyMargin)) fail('safetyMargin must be > 0');

  for (const editType of EDIT_TYPES) {
    if (!isNonNegative(config.systemPromptTokens[editType])) {
      fail(`systemPromptTokens.${editType} must be >= 0`);
    }

    const output = config.output[editType];
    if (!isNonNegative(output.minTokens) || !isNonNegative(output.maxTokens) || output.minTokens > output.maxTokens) {
      fail(`output.${editType} must satisfy 0 <= minTokens <= maxTokens`);
    }

    const { prompt, data } = config.difficulty.weights[editType];
    if (!isNonNegative(prompt) || !isNonNegative(data)) {
      fail(`difficulty.weights.${editType} must be >= 0`);
    }
    if (Math.abs(prompt + data - 1) > WEIGHT_SUM_TOLERANCE) {
      fail(`difficulty.weights.${editType} must sum to 1`);
    }
  }

  if (!isPositive(config.difficulty.promptCharsSaturation)) fail('promptCharsSaturation must be > 0');
  if (!isPositive(config.difficulty.dataCharsSaturation)) fail('dataCharsSaturation must be > 0');
}

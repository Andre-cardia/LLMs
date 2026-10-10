import { assertModelPricing } from '../contracts/model-pricing.mjs';

export const STANDARD_TASK = Object.freeze({ inputTokens: 2000, outputTokens: 1000 });
const REASONING_CAVEAT = 'Estimativa aproximada: tokens de raciocínio não estão incluídos.';

function scaledDecimal(decimal) {
  const [whole, fraction = ''] = decimal.split('.');
  return { integer: BigInt(whole + fraction), scale: fraction.length };
}

function decimalString(integer, scale) {
  const digits = integer.toString().padStart(scale + 1, '0');
  const whole = digits.slice(0, -scale);
  const fraction = digits.slice(-scale).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}

/** Calcula (2.000 × entrada + 1.000 × saída) / 1.000.000 sem ponto flutuante. */
export function estimateStandardTaskCost(pricing) {
  assertModelPricing(pricing);
  const missingPrices = ['inputUsdPerMillion', 'outputUsdPerMillion']
    .filter(field => pricing[field] === null);
  const result = {
    currency: 'USD', task: STANDARD_TASK, approximate: pricing.reasoning,
    caveat: pricing.reasoning ? REASONING_CAVEAT : null, missingPrices,
  };
  if (missingPrices.length) return { ...result, status: 'unavailable', usd: null };

  const input = scaledDecimal(pricing.inputUsdPerMillion);
  const output = scaledDecimal(pricing.outputUsdPerMillion);
  const scale = Math.max(input.scale, output.scale);
  const sum = input.integer * 10n ** BigInt(scale - input.scale) * BigInt(STANDARD_TASK.inputTokens) +
    output.integer * 10n ** BigInt(scale - output.scale) * BigInt(STANDARD_TASK.outputTokens);
  return { ...result, status: 'available', usd: decimalString(sum, scale + 6) };
}

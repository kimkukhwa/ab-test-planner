/**
 * A presentation-agnostic statistical engine for fixed-horizon A/B tests of
 * binary conversion rates. Every rate is expressed as a decimal in [0, 1].
 */

const SQRT_2 = Math.sqrt(2);

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number.`);
}

function assertProbability(value, name, { allowZero = true, allowOne = true } = {}) {
  assertFiniteNumber(value, name);
  const lower = allowZero ? value >= 0 : value > 0;
  const upper = allowOne ? value <= 1 : value < 1;
  if (!lower || !upper) throw new RangeError(`${name} must be between ${allowZero ? '0' : '0 (exclusive)'} and ${allowOne ? '1' : '1 (exclusive)'}.`);
}

function normalCdf(x) {
  // Abramowitz and Stegun 7.1.26; maximum absolute error about 7.5e-8.
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / SQRT_2;
  const t = 1 / (1 + 0.3275911 * z);
  const polynomial = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  return 0.5 * (1 + sign * (1 - polynomial * Math.exp(-z * z)));
}

/** Inverse standard-normal CDF (Peter John Acklam's rational approximation). */
export function inverseNormalCdf(probability) {
  assertProbability(probability, 'probability', { allowZero: false, allowOne: false });
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const low = 0.02425;
  const high = 1 - low;
  let q, r;
  if (probability < low) {
    q = Math.sqrt(-2 * Math.log(probability));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (probability > high) {
    q = Math.sqrt(-2 * Math.log(1 - probability));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  q = probability - 0.5;
  r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

function validateTestInputs({ baselineRate, variantRate, alpha = 0.05, power = 0.8 }) {
  assertProbability(baselineRate, 'baselineRate', { allowZero: false, allowOne: false });
  assertProbability(variantRate, 'variantRate', { allowZero: false, allowOne: false });
  assertProbability(alpha, 'alpha', { allowZero: false, allowOne: false });
  assertProbability(power, 'power', { allowZero: false, allowOne: false });
  if (baselineRate === variantRate) throw new RangeError('variantRate must differ from baselineRate.');
}

/**
 * Returns the required observations for a two-sided, equal-allocation
 * two-proportion z-test. The result is rounded up per group.
 */
export function requiredSampleSize({ baselineRate, variantRate, alpha = 0.05, power = 0.8 }) {
  validateTestInputs({ baselineRate, variantRate, alpha, power });
  const zAlpha = inverseNormalCdf(1 - alpha / 2);
  const zPower = inverseNormalCdf(power);
  const pooledRate = (baselineRate + variantRate) / 2;
  const effect = Math.abs(variantRate - baselineRate);
  const numerator = zAlpha * Math.sqrt(2 * pooledRate * (1 - pooledRate)) +
    zPower * Math.sqrt(baselineRate * (1 - baselineRate) + variantRate * (1 - variantRate));
  const perVariant = Math.ceil((numerator * numerator) / (effect * effect));
  return { perVariant, total: perVariant * 2, effectAbsolute: effect, effectRelative: effect / baselineRate };
}

/** Calculates achieved power for a two-sided two-proportion z-test. */
export function achievedPower({ baselineRate, variantRate, sampleSizeControl, sampleSizeVariant, alpha = 0.05 }) {
  validateTestInputs({ baselineRate, variantRate, alpha, power: 0.8 });
  assertFiniteNumber(sampleSizeControl, 'sampleSizeControl');
  assertFiniteNumber(sampleSizeVariant, 'sampleSizeVariant');
  if (sampleSizeControl <= 0 || sampleSizeVariant <= 0) throw new RangeError('Sample sizes must be greater than zero.');
  const difference = variantRate - baselineRate;
  const pooledRate = (baselineRate * sampleSizeControl + variantRate * sampleSizeVariant) / (sampleSizeControl + sampleSizeVariant);
  const nullStandardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1 / sampleSizeControl + 1 / sampleSizeVariant));
  const alternativeStandardError = Math.sqrt(baselineRate * (1 - baselineRate) / sampleSizeControl + variantRate * (1 - variantRate) / sampleSizeVariant);
  const criticalDifference = inverseNormalCdf(1 - alpha / 2) * nullStandardError;
  return normalCdf((-criticalDifference - difference) / alternativeStandardError) +
    1 - normalCdf((criticalDifference - difference) / alternativeStandardError);
}

/**
 * Estimates collection time from total daily eligible traffic and allocation.
 * Fractional days are retained so callers can choose their own display format.
 */
export function estimateTestDuration({ requiredPerVariant, dailyTraffic, controlAllocation = 0.5 }) {
  assertFiniteNumber(requiredPerVariant, 'requiredPerVariant');
  assertFiniteNumber(dailyTraffic, 'dailyTraffic');
  assertProbability(controlAllocation, 'controlAllocation', { allowZero: false, allowOne: false });
  if (requiredPerVariant <= 0) throw new RangeError('requiredPerVariant must be greater than zero.');
  if (dailyTraffic <= 0) throw new RangeError('dailyTraffic must be greater than zero.');
  const variantAllocation = 1 - controlAllocation;
  const controlDays = requiredPerVariant / (dailyTraffic * controlAllocation);
  const variantDays = requiredPerVariant / (dailyTraffic * variantAllocation);
  return { days: Math.max(controlDays, variantDays), calendarDaysRoundedUp: Math.ceil(Math.max(controlDays, variantDays)), controlAllocation, variantAllocation };
}

/** Convenience composition for the common "sample size and duration" question. */
export function planAbTest({ baselineRate, variantRate, alpha = 0.05, power = 0.8, dailyTraffic, controlAllocation = 0.5 }) {
  const sampleSize = requiredSampleSize({ baselineRate, variantRate, alpha, power });
  return { ...sampleSize, ...estimateTestDuration({ requiredPerVariant: sampleSize.perVariant, dailyTraffic, controlAllocation }), alpha, targetPower: power };
}

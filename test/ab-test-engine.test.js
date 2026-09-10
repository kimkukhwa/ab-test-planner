import test from 'node:test';
import assert from 'node:assert/strict';
import { achievedPower, estimateTestDuration, inverseNormalCdf, planAbTest, requiredSampleSize } from '../src/ab-test-engine.js';

test('inverseNormalCdf returns well-known quantiles', () => {
  assert.ok(Math.abs(inverseNormalCdf(0.5)) < 1e-8);
  assert.ok(Math.abs(inverseNormalCdf(0.975) - 1.95996) < 1e-4);
});

test('required sample size uses a two-sided 80% power calculation', () => {
  const result = requiredSampleSize({ baselineRate: 0.1, variantRate: 0.12 });
  assert.equal(result.perVariant, 3841);
  assert.equal(result.total, 7682);
  assert.ok(Math.abs(result.effectAbsolute - 0.02) < 1e-12);
  assert.ok(Math.abs(result.effectRelative - 0.2) < 1e-12);
});

test('calculated sample size reaches approximately the requested power', () => {
  const { perVariant } = requiredSampleSize({ baselineRate: 0.1, variantRate: 0.12, power: 0.8 });
  const power = achievedPower({ baselineRate: 0.1, variantRate: 0.12, sampleSizeControl: perVariant, sampleSizeVariant: perVariant });
  assert.ok(power >= 0.795 && power <= 0.805, `received ${power}`);
});

test('duration is determined by the slower allocated group', () => {
  const result = estimateTestDuration({ requiredPerVariant: 1000, dailyTraffic: 500, controlAllocation: 0.4 });
  assert.equal(result.days, 5);
  assert.equal(result.calendarDaysRoundedUp, 5);
});

test('plan composes sample-size and traffic calculations without UI concerns', () => {
  const plan = planAbTest({ baselineRate: 0.1, variantRate: 0.12, dailyTraffic: 1000 });
  assert.equal(plan.perVariant, 3841);
  assert.equal(plan.calendarDaysRoundedUp, 8);
  assert.equal(plan.targetPower, 0.8);
});

test('invalid rates, equal rates, and traffic are rejected', () => {
  assert.throws(() => requiredSampleSize({ baselineRate: 0.1, variantRate: 0.1 }), /must differ/);
  assert.throws(() => requiredSampleSize({ baselineRate: 0, variantRate: 0.1 }), /exclusive/);
  assert.throws(() => estimateTestDuration({ requiredPerVariant: 1, dailyTraffic: 0 }), /greater than zero/);
});

import { planAbTest } from './src/ab-test-engine.js';

const form = document.querySelector('#planner-form');
const errors = document.querySelector('#form-errors');
const results = document.querySelector('#results');
const number = new Intl.NumberFormat('en-US');

const values = (formData) => ({
  baselineRate: Number(formData.get('baselineRate')),
  mde: Number(formData.get('mde')),
  alpha: Number(formData.get('alpha')),
  power: Number(formData.get('power')),
  allocation: Number(formData.get('allocation')),
  dailyTraffic: Number(formData.get('dailyTraffic')),
});

function validate(input) {
  const messages = [];
  for (const [name, value] of Object.entries(input)) {
    if (!Number.isFinite(value)) messages.push(`Enter a number for ${name.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
  }
  if (messages.length) return messages;
  if (input.baselineRate <= 0 || input.baselineRate >= 100) messages.push('Baseline conversion rate must be greater than 0% and less than 100%.');
  if (input.mde <= 0) messages.push('Minimum detectable effect must be greater than 0%.');
  if (input.baselineRate * (1 + input.mde / 100) >= 100) messages.push('This baseline rate and MDE would produce a conversion rate of 100% or more. Use a smaller MDE.');
  if (input.alpha <= 0 || input.alpha >= 100) messages.push('Statistical significance must be between 0% and 100%.');
  if (input.power <= 0 || input.power >= 100) messages.push('Statistical power must be between 0% and 100%.');
  if (input.allocation <= 0 || input.allocation >= 100) messages.push('Control traffic allocation must be between 0% and 100%.');
  if (!Number.isInteger(input.dailyTraffic) || input.dailyTraffic <= 0) messages.push('Daily eligible traffic must be a whole number greater than zero.');
  return messages;
}

function showErrors(messages) {
  errors.hidden = messages.length === 0;
  errors.textContent = messages.join(' ');
  if (messages.length) results.hidden = true;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = values(new FormData(form));
  const messages = validate(input);
  if (messages.length) return showErrors(messages);

  try {
    const baselineRate = input.baselineRate / 100;
    const variantRate = baselineRate * (1 + input.mde / 100);
    const plan = planAbTest({
      baselineRate,
      variantRate,
      alpha: input.alpha / 100,
      power: input.power / 100,
      dailyTraffic: input.dailyTraffic,
      controlAllocation: input.allocation / 100,
    });

    document.querySelector('#per-variant-result').textContent = number.format(plan.perVariant);
    document.querySelector('#total-result').textContent = number.format(plan.total);
    document.querySelector('#duration-result').textContent = `${number.format(plan.calendarDaysRoundedUp)} days`;
    document.querySelector('#duration-detail').textContent = `${plan.days.toFixed(1)} days at ${number.format(input.dailyTraffic)} eligible visitors per day`;
    document.querySelector('#results-summary').textContent = `To detect a ${input.mde}% relative lift from a ${input.baselineRate}% baseline with ${input.power}% power.`;
    showErrors([]);
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    showErrors([error.message || 'We could not calculate a plan with these assumptions.']);
  }
});

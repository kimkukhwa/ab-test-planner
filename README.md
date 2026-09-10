# A/B Test Planner

UI-free JavaScript functions for planning fixed-horizon A/B tests on binary conversion rates. Rates are decimals: `0.10` means 10%.

```js
import { planAbTest } from './src/ab-test-engine.js';

const plan = planAbTest({
  baselineRate: 0.10,
  variantRate: 0.12,
  dailyTraffic: 1_000,
});
// { perVariant: 3839, total: 7678, calendarDaysRoundedUp: 8, ... }
```

The engine uses a two-sided two-proportion z-test, 5% significance, and 80% target power by default. It exposes `requiredSampleSize`, `achievedPower`, and `estimateTestDuration` separately so a future UI can format results without owning statistical logic.

## Run locally

Run `npm start`, then open `http://localhost:4173` in a browser. The UI imports and uses `planAbTest` directly; it contains no statistical calculations of its own.

Run engine tests with `npm test`.

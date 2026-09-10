# A/B Test Planner

A statistical planning tool that helps product teams estimate how much traffic and how much time an A/B test may need before reaching a statistically meaningful result.


## Why I Built It

While working with Product Managers on A/B tests, one practical question came up repeatedly:

> **When can we stop the test?**

Instead of choosing an arbitrary test duration, I wanted to build an analytical tool that connects statistical requirements with the practical reality of product traffic.

I built this project using **Codex for AI-assisted development**, while applying my own experience with product analytics, experimentation, and A/B test design to define the problem and validate the statistical approach.

## Impact

The tool helps product teams:

* Estimate the **sample size** needed to detect a meaningful effect
* Translate sample requirements into an **estimated experiment duration**
* Set realistic expectations before launching an experiment

The goal is not to predict the exact day an experiment will become significant. Instead, it provides a **data-driven planning estimate** for how much traffic and time an experiment may require.

## Statistical Approach

The current version uses a **two-sided two-proportion z-test** with configurable significance level and statistical power.

The calculation engine is separated from the UI and covered by automated tests.

## Tech Stack

JavaScript · HTML · CSS · Node.js · Git · GitHub · Codex


## How to Run Locally

Install dependencies:

npm install

Run the application:

npm start

Then open:

http://localhost:4173

Run the statistical engine tests:

npm test

<img width="828" height="680" alt="image" src="https://github.com/user-attachments/assets/be600d5e-d674-4555-a36d-579d91f19e6d" />



## Project Structure
```text
.
├── index.html
├── styles.css
├── app.js
├── server.js
├── src/
│   └── ab-test-engine.js
├── test/
│   └── ab-test-engine.test.js
├── package.json
├── .gitignore
└── README.md
```

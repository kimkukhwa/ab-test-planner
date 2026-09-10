# A/B Test Planner

A lightweight statistical planning tool that helps product teams estimate how much traffic and how much time an A/B test may need before reaching a statistically meaningful result.

## The Problem

One of the practical questions I encountered while working with Product Managers on A/B tests was:

"When can we stop the A/B test?"

It is tempting to look at an experiment's current results and stop when the result becomes statistically significant. However, the amount of data collected has a major impact on the reliability of an experiment.

This tool takes a planning-first approach. Before starting an experiment, it estimates the required sample size based on the expected baseline conversion rate, the minimum effect worth detecting, statistical significance level, and desired statistical power. It then translates the required sample size into an estimated experiment duration based on expected traffic.

The goal is to give product teams a practical way to answer:

"If we expect this level of traffic and want to detect this size of improvement, approximately how long should we expect the experiment to run?"

## What the Tool Does

The A/B Test Planner currently supports:

Required sample size estimation
Estimated experiment duration based on traffic
Statistical power calculation
Baseline and variant conversion rate inputs
Minimum Detectable Effect (MDE)
Configurable significance level (alpha)
Configurable statistical power
Input validation
A simple, responsive interface

## How It Works

The planner uses the following inputs:

Input	Description
Baseline conversion rate	Expected conversion rate for the control group
Minimum Detectable Effect	Smallest improvement the experiment should reliably detect
Daily traffic	Expected number of users entering the experiment each day
Significance level (α)	Probability threshold used to determine statistical significance
Statistical power	Probability of detecting the specified effect when it is actually present

The tool then:

Calculates the required sample size for the control and treatment groups.
Estimates the total number of users required.
Uses expected daily traffic to estimate how long the experiment may need to run.
Presents the results in a simple format for experiment planning.
Example

Suppose a product team expects:

10% baseline conversion
10% relative improvement as the minimum effect worth detecting
10,000 users entering the experiment per day
α = 0.05
80% statistical power

The planner can estimate the required sample size and translate that requirement into an approximate number of days of traffic.

This helps set expectations before launching the experiment, rather than relying on an arbitrary test duration.

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


## Statistical Methodology

The current version uses a two-sided two-proportion z-test for comparing conversion rates between the control and treatment groups.

Default assumptions:

Significance level: α = 0.05
Statistical power: 80%
Two-sided hypothesis test
Two independent groups
Binary conversion outcome
Approximately equal allocation between control and treatment

The sample-size calculation is based on the expected baseline conversion rate and the minimum detectable effect.

## Important distinction

The estimated duration is a planning estimate, not a guarantee that an experiment will become statistically significant after that number of days.

Actual experiment results depend on the observed effect, traffic distribution, variance, data quality, and other factors.

In particular, the tool is intended to help answer:

"How much data should we plan to collect?"

rather than:

"Exactly what day will this experiment become significant?"

## Why I Built This

I built this project as part of exploring how I can use Codex and AI-assisted development to build practical data analytics tools.

My background includes working with Product Managers to design, conduct, and review A/B tests. Through that work, I became interested in turning a common experimentation question into a small, usable analytics tool.

The project combines several areas I work with as a Data Analyst:

Product analytics
A/B testing and experimentation
Statistical reasoning
Conversion analysis
Python/JavaScript development
Data-driven product decision making
AI-assisted software development

Rather than using AI to replace the analytical reasoning, I used Codex as a development partner while defining the business problem, statistical assumptions, and expected behavior of the tool.

## Tech Stack
- JavaScript
- HTML
- CSS
- Node.js
- Git / GitHub
- Codex for AI-assisted development

The statistical engine is separated from the user interface so that the calculation logic can be tested independently.

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



## Future Improvements

Potential next steps include:

Running experiment analysis using actual observed data
A what-if simulator for traffic, MDE, and conversion rates
Experiment feasibility assessment
SRM detection
Multiple treatment groups
Continuous-metric experiments
Clearer guidance around experiment stopping rules
Additional statistical methods
AI-generated explanations of statistical results

## Note

Built as a personal data analytics project to explore practical experimentation tooling and AI-assisted development.

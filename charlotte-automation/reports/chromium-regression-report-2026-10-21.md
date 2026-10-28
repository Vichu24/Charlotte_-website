# Chromium Regression Run Report

**Date:** 2026-10-21  
**Target:** Staging (`https://charlottestaging.newagesmb.com`)  
**Command:** `npm run test:regression -- --project=chromium --workers=1`  
**Outcome:** Incomplete; runner stopped before the suite finished.

## Summary

| Measure | Result |
|---|---:|
| Tests discovered | 232 |
| Tests with a recorded result | 153 |
| Passed | 91 |
| Failed | 28 |
| Skipped | 34 |
| Not run when execution stopped | 79 |

The run made no further test progress for more than 10 minutes after test 153
(Adult Permit Information, TC_173). The stalled Playwright runner was stopped.
Because execution ended before the remaining tests and final reporter summary,
these are partial-run counts, not a completed suite result.

## Failed tests recorded

### Package listing — 17 failures

- TC_35 — Multiple packages all displayed.
- TC_41–TC_46 — Package detail navigation, title, description, features,
  enroll button, and selected-package context.
- TC_49–TC_58 — Age verification dialog, DOB display/validation, eligibility,
  redirect, cancel behavior, and boundary/invalid DOB handling.

### Payment — 8 failures

- TC_174 — Back button returns to Contract page.
- TC_186 — Apply coupon field visible.
- TC_187 — “Use Same Address” checkbox displayed.
- TC_188 — Billing address auto-fills from student info.
- TC_193 — Expiry year field displayed.
- TC_199 — Card number required validation.
- TC_205 — Confirmation prompt shown with valid details.
- TC_206 — Successful payment redirects to Payment Success page.

### Student information — 3 failures

- TC_165 — Medical condition field mandatory.
- TC_166 — High school dropdown selection saved.
- TC_167 — Glasses/contacts dropdown selection saved.

## Interpretation and limitations

- A failed test means its assertion or setup did not complete successfully; it
  does not by itself establish a defect in the staging website.
- Some failed assertions target features or behavior previously found to be
  absent or different on staging (for example, coupon entry and package detail
  flows). Each failure should be triaged against its Playwright error context
  before assigning a product defect.
- The run stopped before tests 154–232, so no result is available for those
  cases.
- The totals above were recovered from the test runner's recorded per-test
  output after stopping the run; no final Playwright suite summary was emitted.

## Recommended follow-up

1. Inspect the failure artifacts for the 28 recorded failures, starting with
   the package listing and payment setup failures.
2. Separate staging limitations/test expectation mismatches from reproducible
   application defects.
3. Investigate why execution stalled after TC_173, then rerun the remaining
   tests or the complete Chromium suite to obtain final totals.


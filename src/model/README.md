## Portfolio Planning Model

The model *should* work entirely with GET and PATCH calls to the variable API. Part of what was built was a test to see if we could get away with not calling operations in Python, and how that might be done.

### Variables to PATCH
All of these should be floats

* portfolio.us_stocks
* portfolio.emerging_markets
* portfolio.global_bonds
* portfolio.global_real_estate
* portfolio.cash_equivalents

### Variables to GET
Correlation charts:

* portfolio.correlation (array of arrays) Correlation matrix (should be in the same row/column order as the variables to PATCH, above)
* portfolio.historic (array of arrays) Row index is each an historic year, and column index the type of asset (in same order as variables to PATCH, above)

Additionally, each and every PATCH triggers a re-calculation of these values (actually, every setting of the PATCH variables, above, triggers the recalculation. So if the PATCH includes multiple variables, every setting will cause a recalculation. Pretty inefficient. We'll change if necessary).

* portfolio.average_returns (float) Average return at end of 5 years for given allocation
* portfolio.failure_percent (float) Chance of losing more than $5 in 5 years for given allocation
* portfolio.returns (array of arrays) 1000 scenarios, each with 5 years worth of returns, showing the value of the portfolio at the end of each year in that scenario
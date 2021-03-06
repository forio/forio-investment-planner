"""For the portfolio management challenge contest
"""

import numpy as np
from epicenter import Epicenter


def calculate(func):
    """Decorator to ensure calculation occurs whenever a fields are set
    """
    def wrapper(*args):
        """Actual calculation, then calls the decorated function
        """
        func(*args)
        args[0].calculate()
    return wrapper


class Portfolio(object):
    """Portfolio for the Probability Management Contest
    """
    def __init__(self):
        self._historic = np.genfromtxt('historic_data.csv', delimiter='\t')
        self.rands = np.genfromtxt('rand_by_year.csv', delimiter='\t',
                                   dtype=int) - 1
        self._global_bonds = 0.15
        self._global_real_estate = 0.15
        self._us_stocks = 0.15
        self._emerging_markets = 0.15
        self._cash_equivalents = 0.40

        self.initial = 100.0
        self.loss_threshold = 5.0
        self._returns = []
        self.average_returns = 0.0

        self.failure_percent = 0.0

        self.correlation = self.calculate_correlation()

        self.calculate()

    def calculate_correlation(self):
        """Calculate the correlation between historic data in each sector
        """
        correlation = np.ones((5, 5))

        for i in range(5):
            for j in range(i):
                correlation[i, j] = np.corrcoef(self._historic[:, i],
                                                self._historic[:, j])[0, 1]
                correlation[j, i] = correlation[i, j]
        return correlation.tolist()

    @property
    def global_bonds(self):
        return self._global_bonds

    @global_bonds.setter
    @calculate
    def global_bonds(self, value):
        self._global_bonds = value

    @property
    def global_real_estate(self):
        return self._global_real_estate

    @global_real_estate.setter
    @calculate
    def global_real_estate(self, value):
        self._global_real_estate = value

    @property
    def us_stocks(self):
        return self._us_stocks

    @us_stocks.setter
    @calculate
    def us_stocks(self, value):
        self._us_stocks = value

    @property
    def emerging_markets(self):
        return self._emerging_markets

    @emerging_markets.setter
    @calculate
    def emerging_markets(self, value):
        self._emerging_markets = value

    @property
    def cash_equivalents(self):
        return self._cash_equivalents

    @cash_equivalents.setter
    @calculate
    def cash_equivalents(self, value):
        self._cash_equivalents = value

    @property
    def historic(self):
        return self._historic.tolist()

    @property
    def returns(self):
        return self._returns[:50]

    def calculate(self):
        """Calculate all of the returns
        """
        allocations = self.allocations
        self.scenario_returns = np.zeros((self.rands.shape[0], 5))

        # calculate the returns for each year and sample
        for i, scenario in enumerate(self.rands):
            for j, year in enumerate(scenario):
                history = self._historic[year, :]
                self.scenario_returns[i, j] = np.dot(history, allocations)

        self.scenario_returns += 1.0

        # Aggregate the returns into running returns for the graphs
        self._returns = self.initial * np.ones((self.rands.shape[0],
                                               self.rands.shape[1] + 1))
        for j in range(1, 6):
            self._returns[:, j] = (self._returns[:, j - 1] *
                                   self.scenario_returns[:, j - 1])

        # Calculate metrics for the UI
        self.average_returns = float(self._returns[:, -1].mean())
        Epicenter.record("portfolio.average_returns", self.average_returns)

        self._returns = self._returns.tolist()
        Epicenter.record("portfolio.returns", self.returns)
        self._calculate_failures()

    def _calculate_failures(self):
        threshold = self.initial - self.loss_threshold
        total_under = float(sum([x[-1] < threshold for x in self._returns]))
        self.failure_percent = total_under / self.rands.shape[0]
        Epicenter.record("portfolio.failure_percent", self.failure_percent)

    @property
    def allocations(self):
        return [self.us_stocks, self.emerging_markets,
                self.global_bonds, self.global_real_estate,
                self.cash_equivalents]


portfolio = Portfolio()

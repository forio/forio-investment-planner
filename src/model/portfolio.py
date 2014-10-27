"""For the portfolio management challenge contest
"""

import numpy as np


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
        self._global_bonds = 0.0
        self._global_real_estate = 0.0
        self._us_stocks = 0.0
        self._emerging_markets = 0.0
        self._cash_equivalents = 1.0

        self.initial = 100.0
        self.loss_threshold = 5.0
        self.average_returns = 0.0
        self.returns = []
        self.average_returns = 0.0

        self.cash_equivalents = 1.0

        self.failure_percent = 0.0

        self.correlation = self.calculate_correlation()

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
        self.returns = np.zeros(self.rands.shape)
        self.returns[:, 0] = 100.0*self.scenario_returns[:, 0]
        for j in range(1, 5):
            self.returns[:, j] = (self.returns[:, j - 1] *
                                  self.scenario_returns[:, j])

        # Calculate metrics for the UI
        self.average_returns = self.returns[:, 4].mean()
        self.returns = self.returns.tolist()
        self._calculate_failures()

    def _calculate_failures(self):
        threshold = self.initial - self.loss_threshold
        total_under = float(sum([x[4] < threshold for x in self.returns]))
        self.failure_percent = total_under / self.rands.shape[0]

    @property
    def allocations(self):
        return [self.us_stocks, self.emerging_markets,
                self.global_bonds, self.global_real_estate,
                self.cash_equivalents]


portfolio = Portfolio()

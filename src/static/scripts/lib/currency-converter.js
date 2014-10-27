'use strict';

function CurrencyConverter(modelCurrency, exchangeBaseCurrency) {
    return {
        convert: function (value) {
            var currency = App.config.get('currency');
            if (modelCurrency === currency) {
                return value;
            }

            var exchangeRate = App.config.get('exchangeRate');

            if (exchangeBaseCurrency === currency) {
                return value / exchangeRate;
            } else {
                return value * exchangeRate;
            }
        },

        convertReverse: function (value) {
            var currency = App.config.get('currency');
            if (modelCurrency === currency) {
                return value;
            }

            var exchangeRate = App.config.get('exchangeRate');

            if (exchangeBaseCurrency === currency) {
                return value * exchangeRate;
            } else {
                return value / exchangeRate;
            }
        }
    };
}

module.exports = CurrencyConverter;

'use strict';

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

var getOpts = function (model, key, options) {
    var hash = options.hash || {};
    var addon = hash.addon;
    var size = hash.size ? 'input-' + hash.size : '';
    var meta = model.meta[key];
    var type = meta.type || 'text';
    var value = model.get ? model.get(key) : model[key];

    var opts = {
        hash: hash,
        addon: addon,
        size: size,
        meta: meta,
        type: type,
        value: value
    };

    return opts;
};


var leverMap = {
    'select-year': 'select'
};

var percentFormatter = d3.format('.1%');

var currencyFormatter = d3.format('$.2f');

Handlebars.registerHelper({

    portfolioItem: function () {
        return new Handlebars.SafeString(templates['util/portfolio-item']());
    },

    barSlider: function () {
        return new Handlebars.SafeString(templates['util/bar-slider']());
    },

    formatPercent: function (decimal) {
        return percentFormatter(decimal);
    },

    formatCurrency: function (decimal) {
        return currencyFormatter(decimal);
    },

    historyCorrelation: function (item, correlation, hash) {
        var index = hash.data.index;
        var html = '';
        _.times(5, function (innerIndex) {
            if ( innerIndex <= index ) {
                html += templates['util/history-correlation']({ 
                    value: d3.format('.2f')(correlation[innerIndex][index])
                });
            } else {
                html += templates['util/history-correlation-plot']({ 
                    y: index,
                    x: innerIndex
                });
            }
        });

        return new Handlebars.SafeString(html);
    },

});

module.exports = Handlebars;

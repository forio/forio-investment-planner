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

var percentFormatter = d3.format('.2%');

Handlebars.registerHelper({

    portfolioItem: function () {
        return new Handlebars.SafeString(templates['util/portfolio-item']());
    },

    barSlider: function () {
        return new Handlebars.SafeString(templates['util/bar-slider']());
    },

    formatPercent: function (decimal) {
        return percentFormatter(decimal);
    }

});

module.exports = Handlebars;

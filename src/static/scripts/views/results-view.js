'use strict';
var BaseView = require('base-view');

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

var renderSpread = require('lib/render-spread');

var renderChancePie = require('lib/render-chance-pie');

var renderForcast = require('lib/render-forcast');

module.exports = BaseView.extend({
    template: templates['results'],

    initialize: function (opts) {
        this.model = opts.model;
    },

    render: function () {
        this.$el.html(this.template({
            name: this.model.get('name')
        }));

        return this;
    },

    setModel: function (model) {
        this.model = model;
        this.render();

        this.afterRender();
    },

    afterRender: function () {
        var that = this;
        this.model.getReturns(function () {
            that.renderSpread(that.model.get('bucketData'), that.model.get('failure_percent'), that.model.getTotalValue());
            that.renderForcast(that.model.get('returns'));
        });
        this.average = this.model.get('average_returns');
    },

    renderSpread: renderSpread,

    average: 288,

    renderChancePie: renderChancePie,

    renderForcast: renderForcast
});


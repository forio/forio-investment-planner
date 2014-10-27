'use strict';
var BaseView = require('base-view');

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

var historicalData = require('data/historical-data');

var HistoricalCollection = require('collections/historical-collection');

module.exports = BaseView.extend({

    historicalData: historicalData,

    collection: new HistoricalCollection(historicalData),

    template: templates['historical'],

    initialize: function () {
        _.each(this.historicalData, function (item) {
            item.average = d3.format('%.2f')(item.average);
        });

        return BaseView.prototype.initialize.apply(this, arguments);
    },

    render: function  () {
        this.$el.html(this.template(this.collection.toJSON()));



        return this;
    },

    afterRender: function () {

        var $bar;
        _.each(this.$('.history-bar'), function (bar, index) {
            $bar = $(bar);
            this.renderHistoryBars($bar.data('name'), this.historicalData[index].historicalValues)
        }, this);

        var $plot;
        _.each(this.$('.scatter-plot'), function (plot) {
            $plot = $(plot);


        });
    },

    renderHistoryBars: function (name, values) {
        new Contour({
                el: '[data-name="' + name + '"]',
                chart: {
                    height: 80
                }
            })
            .cartesian()
            .column(values)
            .render();
    }
});

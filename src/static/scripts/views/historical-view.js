'use strict';
var BaseView = require('base-view');

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

var historicalData = require('data/historical-data');

var HistoricalCollection = require('collections/historical-collection');

module.exports = BaseView.extend({

    collection: new HistoricalCollection(historicalData),

    template: templates['historical'],

    initialize: function (opts) {
        this.model = opts.model;
        return BaseView.prototype.initialize.apply(this, arguments);
    },

    render: function  () {
        this.$el.html(this.template({
            historicalData: this.historicalData(),
            correlation: this.model.get('correlation'),
            historic: this.model.get('historic')
        }));

        return this;
    },

    historicalData: function () {
        var historicalData = [];
        var historicalValues;
        var average;
        _.each(this.model.inputLabels, function (label, index) {
            historicalValues = this.model.get('historic')[index];
            average = _.reduce( historicalValues, function ( memo, num) { 
                return memo + num;
            }, 0) / historicalValues.length;
            historicalData.push({
                name: label,
                average: average
            })
        }, this);

        return this.model.buildHistogram(historicalData);
    },

    afterRender: function () {

        var $bar;
        _.each(this.$('.history-bar'), function (bar, index) {
            $bar = $(bar);
            this.renderHistoryBars($bar.data('name'), this.historicalData()[index].histogram)
        }, this);

        var $plot;
        _.each(this.$('.history-plot'), function (plot) {
            $plot = $(plot);
            this.renderHistoryPlot($plot.data('x'), $plot.data('y'));
        }, this);
    },

    renderHistoryPlot: function (x, y) {

        var data = [];

        var historic = this.model.get('historic');

        _.each(historic, function (year) {
            data.push({
                x: year[x],
                y: year[y]
            })
        })
        var plot = new Contour({
                el: '[data-x="' + x + '"][data-y="' + y + '"]',
                chart: {
                    height: 50,
                    width: 60,
                    padding: {
                        left: 1,
                        bottom: 1
                    }
                },
                xAxis: {
                    innerTickSize: 0,
                    outerTickSize: 0
                },
                yAxis: {
                    innerTickSize: 0,
                    outerTickSize: 0
                },
                scatter: {
                    radius: 1
                }
            })
            .cartesian();

        plot.scatter(data)
        plot.render();
    },

    renderHistoryBars: function (name, values) {
        new Contour({
                el: '[data-name="' + name + '"]',
                chart: {
                    height: 80,
                    width: 60,
                    padding: {
                        left: 10
                    }
                }
            })
            .cartesian()
            .column(values)
            .render();
    },

    // historicalHistogram: function () {
    //     var historics = this.
    //     for ( var i = 0, l = )
    //     d3.layout.histogram().bins(8)(
    // }
});

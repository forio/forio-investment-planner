'use strict';
var BaseView = require('base-view');

var PortfolioView = require('views/portfolio-view');
var HistoricalView = require('views/historical-view');

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

module.exports = BaseView.extend({
    template: templates['main'],

    nameTemplate: templates['name'],

    model: new Backbone.Model(),

    events: {
        'click #run-scenario':'runScenario',
        'change #scenario-name': 'updateName'
    },

    updateName: _.throttle(function () {
        var name = $('#scenario-name').val();
        this.model.run.name = name;
        this.model.setName();
    }, 100),

    runScenario: function () {

        this.model.simulate({
            success: function () {
                Backbone.history.navigate('leaderboard', {trigger: true});
            },
            error: function (xhr, error, msg) {
                var x;
            }
        });
    },

    initialize: function (opts) {
        this.portfolioView = new PortfolioView(opts);
        this.historicalView = new HistoricalView(opts);
        this.model = opts.model;

        return this;
    },

    render: function () {
        BaseView.prototype.render.apply(this, arguments);

        this.$('.left').html(this.portfolioView.render().$el);
        this.$('.right').html(this.historicalView.render().$el);
        this.$('.navigate').html(this.nameTemplate({
            name: this.model.get('name')
        }));

        return this;
    },

    afterRender: function () {
        this.historicalView.afterRender();
        this.portfolioView.afterRender();
    },

    remove: function () {
        this.portfolioView.remove();
        this.historicalView.remove();

        return BaseView.prototype.remove.apply(this, arguments);
    }
});

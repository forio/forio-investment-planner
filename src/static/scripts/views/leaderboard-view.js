'use strict';
var BaseView = require('base-view');

var ResultView = require('views/results-view');
var LeadersView = require('views/leaders-view');

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

module.exports = BaseView.extend({
    template: templates['main'],

    replayTemplate: templates['replay'],

    initialize: function (opts) {
        $('#content').addClass('leaderboard');

        this.model = opts.model || App.scenarios.at(0);

        App.scenarios.setSelected(this.model);
        this.resultView = new ResultView({
            model: this.model
        });
        this.leadersView = new LeadersView(opts);

        var that = this;
        this.listenTo(App.scenarios,'changeSelected', function () {
            that.leadersView.render();
            that.resultView.setModel(App.scenarios.getSelected());
        });

        return this;
    },

    events: {
        'click #replay-button':'restartScenario'
    },

    restartScenario: function () {
        App.showLoading();
        Backbone.history.navigate('', {trigger: true});
    },

    render: function () {
        BaseView.prototype.render.apply(this, arguments);

        this.$('.left').html(this.resultView.render().$el);
        this.$('.right').html(this.leadersView.render().$el);
        this.$('.navigate').html(this.replayTemplate());

        return this;
    },

    afterRender: function () {
        this.resultView.afterRender();
    },

    remove: function () {
        this.resultView.remove();
        this.leadersView.remove();

        return BaseView.prototype.remove.apply(this, arguments);
    }
});
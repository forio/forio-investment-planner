'use strict';
var BaseView = require('base-view');

var ResultView = require('views/results-view');
var LeadersView = require('views/leaders-view');

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

module.exports = BaseView.extend({
    template: templates['main'],

    replayTemplate: templates['replay'],

    initialize: function () {
        this.resultView = new ResultView();
        this.leadersView = new LeadersView();

        return this;
    },

    events: {
        'click #replay-button':'restartScenario'
    },

    restartScenario: function () {
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
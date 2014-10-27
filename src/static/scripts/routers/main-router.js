'use strict';

var RouterBase = require('./router-base');

var InvestView = require('views/invest-view');

var LeaderboardView = require('views/leaderboard-view');

var ScenarioModel = require('models/scenario-model');

var __super__ = RouterBase.prototype;

module.exports = RouterBase.extend({

    routes: {
        '': 'invest',
        'leaderboard': 'leaderboard'
    },

    invest: function () {
        var that = this;
        this.scenario.runReady({
            success: function () {
                that.showView(new InvestView({
                    model: that.scenario
                }));
            }
        });
    },

    leaderboard: function () {
        this.showView(new LeaderboardView());
    },

    initialize: function () {
        __super__.initialize.apply(this, arguments);


        this.scenario = new ScenarioModel();
        Backbone.history.start();

        return this;
    }
});

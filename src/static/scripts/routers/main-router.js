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
        
        App.scenario = new ScenarioModel();
        App.scenario.runReady({
            success: function () {
                App.hideLoading();
                that.showView(new InvestView({
                    model: App.scenario
                }));
            }
        });
    },

    leaderboard: function () {
        var that = this;
        
        App.hideLoading();
        this.showView(new LeaderboardView({
            model: that.scenario
        }));
    },

    initialize: function () {
        __super__.initialize.apply(this, arguments);

        Backbone.history.start();

        return this;
    }
});

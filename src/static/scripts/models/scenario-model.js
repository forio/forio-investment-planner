'use strict';

var BaseModel = require('base-model');
var endpoints = require('service/endpoints');
var __super__ = BaseModel.prototype;

module.exports = BaseModel.extend({

    name: 'Scenario',

    cookieName: 'epicenter-scenario',

    strategy: 'new-if-simulated',

    initialize: function (opts) {
        this.createManager(opts);
    },

    defaults: function () {
        return {
            us: 0.12,
            emerging: 0.28,
            bonds: 0.264,
            realEstate: 0.218,
            cash: 0.118
        };
    },


    toggleInputs: function () {
        return [
            {
                name: 'US Stocks',
                value: this.get('us'),
                variable: 'us'
            },
            {
                name: 'Emerging Markets',
                value: this.get('emerging'),
                variable: 'emerging'
            },
            {
                name: 'Global Bonds',
                value: this.get('bonds'),
                variable: 'bonds'
            },
            {
                name: 'Global Reas Estate',
                value: this.get('realEstate'),
                variable: 'realEstate'
            },
            {
                name: 'Cash Equivalents',
                value: this.get('cash'),
                variable: 'cash'
            }];
    },

    createManager: function ( opts ) {
        opts = opts || {};
        this.manager = new F.manager.RunManager({
            run: {
                account: endpoints.curAccount,
                project: endpoints.curProject,
                model: endpoints.model,
                server: {
                    host: endpoints.host.replace('https://', '')
                }
            },
            strategy: opts.strategy || this.strategy,
            cookieName: opts.cookieName || this.cookieName
        });
    },

    getReturns: function (callBack) {
        var that = this;
        Net.get( this.run.id + '/variables', 'include=portfolio.returns', { 
            success: function (data) {
                that.set(data);
                callBack()
            } 
        });
    },

    url: function() {
        var id = this.run.id ? this.run.id : '';
        return endpoints.root + '/' + id;
    },

    runReady: function (opts) {
        opts = opts || {};
        var that = this;
        this.basedOn = opts.basedOn;

        return this.getRun(opts.success);
    },

    getRun: function (callBack) {
        var that = this;

        return this.manager.getRun().then(function (run) {
            that.setupRun(run, callBack);
        });
    },

    setupRun: function (run, callBack) {
        this.runService = this.manager.run;
        this.run = run;
        this.set(run);
        this.name = run.name;
        this.run.name = run.name || this.name;
        this.getReturns(callBack)
        // if (callBack) {
        //     callBack(run);
        // }
    },

    simulate: function (opts) {
        opts = opts || {};
        var that = this;
        this.setName();
        this.runService.do('start_game').then( function () {
            that.runService.do('step', [8]).then( function () {
                that.fetchAll({
                    success: function () {
                        that.runService.save({ saved: !GLOBALS.isDemo, selected: false}, {filter: that.run.id});
                        App.scenarios.add(that);
                        opts.success();
                    }
                });
            });
        });
    },

    setName: function () {
        this.run.name = this.run.name ? this.run.name : 'Scenario';
        this.set('name',this.run.name);
        this.runService.save({ name: this.run.name }, {filter: this.run.id});
    }
});

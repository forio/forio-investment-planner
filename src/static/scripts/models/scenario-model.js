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

    proportions: [
        'us_stocks',
        'emerging_markets',
        'global_bonds',
        'global_real_estate',
        'cash_equivalents'
    ],

    inputLabels: [
        'US Stocks',
        'Emerging Markets',
        'Global Bonds',
        'Global Real Estate',
        'Cash Equivalents'
    ],

    toggleInputs: function () {
        return [
            {
                name: 'US Stocks',
                value: this.get('us_stocks'),
                variable: 'us_stocks'
            },
            {
                name: 'Emerging Markets',
                value: this.get('emerging_markets'),
                variable: 'emerging_markets'
            },
            {
                name: 'Global Bonds',
                value: this.get('global_bonds'),
                variable: 'global_bonds'
            },
            {
                name: 'Global Reas Estate',
                value: this.get('global_real_estate'),
                variable: 'global_real_estate'
            },
            {
                name: 'Cash Equivalents',
                value: this.get('cash_equivalents'),
                variable: 'cash_equivalents'
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
                that.transformSet(data);
                that.calculateSpread();
                callBack()
            } 
        });
    },

    bucketSize: 40,

    buckets: 6,

    bucketStart: 40,

    getTotalValue: function () {
        return this.buckets * this.bucketSize; // + this.bucketStart;
    },

    calculateSpread: function () {
        var valuesFinalIndex = this.get('returns')[0].length - 1;
        var finalValues = _.map(this.get('returns'), function (forcast) {
            return forcast[valuesFinalIndex];
        }).sort(function(a,b) {return a - b; });

        var bucketData = [];
        var bucketCount = 0;
        var bucketI = 0;
        for ( var i = 0, l = finalValues.length; i < l; i++) {
            if (finalValues[i] < (this.bucketStart + this.bucketSize * (bucketI + 1))) {
                bucketCount ++;
            } else {
                bucketData.push(bucketCount);
                bucketCount = 1;
                bucketI++;
            }
        }

        while ( bucketI < this.buckets ) {
            bucketData.push(bucketCount);
            bucketCount = 0;
            bucketI++;
        }

        this.set('bucketData', bucketData);
    },

    transformSet: function (json) {
        var that = this;
        _.each(json, function (value, key) {
            that.set(key.replace('portfolio.', ''), value);
        });
    },

    getProportions: function (callBack) {
        var that = this;
        Net.get( this.run.id + '/variables', 'include=' + _.map(this.proportions, function(item){ return 'portfolio.' + item;}).join(','), { 
            success: function (data) {
                that.transformSet(data);
                callBack()
            } 
        });
    },

    getHistorics: function (callBack) {
        var that = this;
        Net.get( this.run.id + '/variables', 'include=portfolio.historic,portfolio.correlation', { 
            success: function (data) {
                that.transformSet(data);
                callBack()
            } 
        });
    },

    recalculate: function (callBack) {
        var that = this;

        var data = {};

        _.each(this.proportions, function (proportion) {
            data['portfolio.' + proportion] = that.get(proportion);
        });

        callBack = _.after(2, callBack);

        Net.patch( this.run.id + '/variables', data, {
            success: function () {
                that.getReturns(callBack);
                that.getScoreMetrics(callBack);
            }
        } );
    },

    url: function() {
        var id = this.run.id ? this.run.id : '';
        return endpoints.root + '/' + id;
    },

    runReady: function (opts) {
        opts = opts || {};
        var that = this;
        this.basedOn = opts.basedOn;

        return this.getRun(function () {
            that.getHistorics(opts.success);
        });
    },

    getRun: function (callBack) {
        var that = this;

        return this.manager.getRun().then(function (run) {
            that.setupRun(run);
            callBack = _.after(3, callBack);
            that.getReturns(callBack);
            that.getScoreMetrics(callBack);
            that.getProportions(callBack);
        });
    },

    getScoreMetrics: function (callBack) {
        var that = this;
        Net.get( this.run.id + '/variables', 'include=portfolio.average_returns,portfolio.failure_percent', { 
            success: function (data) {
                that.transformSet(data);
                callBack()
            } 
        });
    },

    setupRun: function (run, callBack) {
        this.runService = this.manager.run;
        this.run = run;
        this.set(run);
        this.name = run.name;
        this.run.name = run.name || this.name;
    },

    simulate: function (opts) {
        this.setName();
        this.runService.save({ saved: true, initialized: true }, {filter: this.run.id});
        App.scenarios.add(this);
        opts.success();
    },

    setName: function () {
        this.run.name = this.run.name ? this.run.name : 'Scenario';
        this.set('name',this.run.name);
        this.runService.save({ name: this.run.name }, {filter: this.run.id});
    }
});

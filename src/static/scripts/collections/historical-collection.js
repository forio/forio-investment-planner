var BaseCollection = Backbone.Collection;

var endpoints = require('service/endpoints');

var ScenarioModel = require('models/scenario-model');
module.exports = BaseCollection.extend({

    initialize: function () {
        this.scenarioManager = new F.manager.ScenarioManager({
            account: endpoints.curAccount,
            project: endpoints.curProject,
            model: endpoints.model,
            server: {
                host: endpoints.host.replace('https://', '')
            }
        });
    },

    removeAll: function() {
        _.each(this.models, function (model) {
            model.runService.save({saved: false}, {filter: model.run.id});
        })
    },

    normalize: function (varName, positiveDir) {
        var values = this.pluck(varName);
        var sum = _.reduce( values, function (memo, val) { return memo + val;}, 0);
        var min = _.min(values);
        var max = _.max(values);
        var range = Math.abs(max - min);

        var rankVal;
        var modelVal;
        _.each( this.models, function (model) {
            modelVal = model.get(varName);
            rankVal = modelVal / sum * positiveDir; 
            model.set('rank_' + varName, rankVal);
        });
    },

    rankRuns: function () {
        var models = this.sortBy('created').reverse();

        var model;
        while (models.length > 10) {
            model = models.pop();
            model.runService.save({saved: false}, {filter: model.run.id});
            this.remove(model);
        }
        this.normalize('failure_percent', -1);
        this.normalize('average_returns', 1);



        _.each(this.models, function (model) {
            model.set('rank', model.get('rank_average_returns') + model.get('rank_failure_percent'));
        });
    },

   fetch: function (opts) {

        var filter = {
            saved: true
        };

        var that = this;

        return this.scenarioManager.runService.query(filter)
            .then(function(runs) {

                if (!runs.length) {
                    opts.success();
                    return;
                }
                var fetched = _.after(runs.length, function () {
                    // that.rankRuns();
                    opts.success()
                });

                _.each(runs, function (run) {
                    var model = new ScenarioModel();

                    // model.loadFromLocal();
                    model.setupRun(run);
                    that.add(model);

                    model.getScoreMetrics(fetched);
                }, this);
            });

    },

    getSelected: function () {
        return this.findWhere({selected: true});
    },

    setSelected: function (selectedModel) {
        _.each(this.models, function (model) {
            model.set({ selected: false});
        });

        selectedModel.set({selected: true});

        this.trigger('changeSelected');
    }
})
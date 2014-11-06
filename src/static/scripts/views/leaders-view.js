'use strict';
var BaseView = require('base-view');

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

module.exports = BaseView.extend({
    template: templates['leaders'],

    events: {
        'click .row[data-cid]': 'selectRun'
    },

    selectRun: function (e) {
        App.scenarios.setSelected(App.scenarios.get($(e.currentTarget).data('cid')));
    },

    render: function () {
        App.scenarios.rankRuns();
        var json;
        this.$el.html(this.template({
            players: _.map(App.scenarios.sortBy('rank'), function(model, index) { 
                json = model.toJSON();
                json.index = 10 - index;
                return json;
            }).reverse()
        }));

        return this;
    }
});

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
        this.$el.html(this.template({
            players: App.scenarios.toJSON().reverse()
        }));

        return this;
    }
});

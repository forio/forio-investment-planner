'use strict';
var BaseView = require('base-view');

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

var renderSpread = require('lib/render-spread');

var renderChancePie = require('lib/render-chance-pie');

var renderForcast = require('lib/render-forcast');

module.exports = BaseView.extend({
    template: templates['results'],

    render: function () {
        this.$el.html(this.template({
            name: 'Tjaard Verdandi'
        }));

        return this;
    },

    afterRender: function () {
        this.renderSpread();
        this.renderForcast();
    },

    renderSpread: renderSpread,

    average: 288,

    renderChancePie: renderChancePie,

    renderForcast: renderForcast
});


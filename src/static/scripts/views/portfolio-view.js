'use strict';
var BaseView = require('base-view');

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

require('lib/jquery-multi-draggable');

var InputsModel = require('models/inputs-model');

var renderSpread = require('lib/render-spread');

var renderChancePie = require('lib/render-chance-pie');

var renderForcast = require('lib/render-forcast');

module.exports = BaseView.extend({
    template: templates['portfolio'],

    inputsTemplate: templates['inputs'],

    chartsTemplate: templates['charts'],

    renderSpread: renderSpread,

    average: 288,

    renderChancePie: renderChancePie,

    renderForcast: renderForcast,

    events: {
        'change input[data-variable]': 'updateFromInput',
        'slideUpdate .draggable': 'updateFromSlider'
    },

    updateFromSlider: _.throttle(function () {
        var $drag
        _.each(this.draggables, function (drag) {
            $drag = $(drag);
            this.model.set($drag.data('variable'), $drag.data('value'));
        }, this);

        this.renderInputs();
        this.renderCharts();
    }, 20),

    updateFromInput: function (e) {
        var $input = $(e.currentTarget);
        this.model.set($input.data('variable'), +$input.val());
        this.modelChanged();
    },
    
    initialize: function (opts) {
        this.model = opts.model;
        // this.listenTo(this.model, 'change', this.modelChanged);
    },

    modelChanged: function () {
        this.render();
        this.afterRender();
    },

    render: function () {
        this.$el.html(this.template({
            toggleInputs: this.model.toggleInputs()
        }));

        this.renderInputs();
        return this;
    },

    renderInputs: function () {
        this.$('.inputs').html(this.inputsTemplate({
            toggleInputs: this.model.toggleInputs()
        }));
    },

    renderCharts: _.throttle(function () {
        this.$('.charts').html(this.chartsTemplate());
        this.renderForcast(this.model.get('portfolio.returns'));
        this.average = Math.random() * 340 + 40;
        this.renderSpread();
    }, 2040),

    afterRender: function () {
        this.draggables = this.$('.draggable').multiDraggable();

        this.renderCharts();
    }
});

'use strict';

var __super__ = Backbone.View.prototype;
var handlebars = require('handlebars');
var templates = require('templates')(handlebars);

module.exports = Backbone.View.extend({

    // define template to be render automatically
    template: undefined,
    templateOptions: {},
    className: 'row',

    render: function () {
        this.$el.html(this.template({
            model: this.model
                    ? this.model.toFormatted
                        ? this.model.toFormatted()
                        : this.model.toJSON()
                    : {},
            options: this.templateOptions
        }));
        return this;
    },

    afterRender: function () {}

});

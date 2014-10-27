'use strict';

var auth = require('service/auth-service');

module.exports = Backbone.Router.extend({

    routes: {
        'help': 'help',
        'logout': 'logout'
    },

    initialize: function () {
        this.xhr = {};
        this.$content = $('#content');

        this.on('all', this.updateReferrer);

        return this;
    },

    updateReferrer: function () {
        this.referrer = Backbone.history.fragment;
    },

    showView: function (view) {
        if (this.xhr) {
            _.each(this.xhr, function (xhr) {
                if (xhr && xhr.state() === 'pending') {
                    xhr.abort();
                }
            });
        }

        if (this.view) {
            this.view.remove();
        }

        $(window).scrollTop(0);

        // this.header.render();

        this.$content.html(view.el);
        // this.$content.css('min-height',window.innerHeight- 161);
        view.render();

        view.afterRender();

        this.view = view;

        this.trigger('showView', view);

        this.trackAnalytics();

        return this;
    },

    logout: function () {
        auth.logout(function () {
            window.location.href = "login.html";
        })
    },

    trackAnalytics: function () {
        // _gaq = _gaq || [];
        // var pageName = window.location.hash;
        // _gaq.push(['_setAccount', App.ANALYTICS]);
        // _gaq.push(['_trackPageview', '/' + App.SIM_PATH + '/' + pageName]);
    }
});

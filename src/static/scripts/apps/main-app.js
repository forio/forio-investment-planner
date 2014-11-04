'use strict';

var ContourBaseApp = require('./contour-base');
var MainRouter = require('../routers/main-router');
require('service/auth-service');
// No exports
require('lib/handlebars-helpers');

require('lib/contour-extensions');

require('service/config');

function App() {
    this.initialize();
}

var whatData = require('data/used-items');

var HistoricalCollection = require('collections/historical-collection');

var Handlebars = require('handlebars');
var templates = require('templates')(Handlebars);

var whatTemplate = templates['what-we-used'];

App.prototype = _.extend(ContourBaseApp.prototype, {
    initialize: function () {

        $('#what-we-used').html(whatTemplate(whatData));
        $('#content').addClass('loading');

        this.scenarios = new HistoricalCollection();
        var that = this;

        this.showLoading();
        this.scenarios.fetch({
            success: function () {
                that.router = new MainRouter({});
            }
        });
    },

    showLoading: function (msg) {
        msg = '<div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div><h1>Investment Portfolio Simulator</h1><hr><h4>I am initializing... one moment please.</h4>';

        $('#loading-indicator').html(msg);
        // animate in the loading indicator
        $('#loading-indicator').show(200);
        // set display:block on the backdrop
        $('#loading-backdrop').addClass('show1');
        // animate in the backdrop
        setTimeout(function () {
            $('#loading-backdrop').addClass('show2');
        }, 1);
    },

    hideLoading: function () {
        // animate out the backdrop
        $('#loading-backdrop').removeClass('show2');
        // set display:none on the backdrop
        setTimeout(function () {
            $('#loading-backdrop').removeClass('show1');
        }, 900);
        // animate out the loading indicator
        $('#loading-indicator').hide(300);
        $('#loading-indicator').html('');
        $('#content').removeClass('loading');
    }
});

module.exports = App;

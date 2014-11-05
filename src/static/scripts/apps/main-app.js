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

var startTemplate = templates['start'];

var ScenarioModel = require('models/scenario-model');

App.prototype = _.extend(ContourBaseApp.prototype, {
    initialize: function () {

        $('#content').html(startTemplate());

        $('#what-we-used').html(whatTemplate(whatData));
        $('#content').addClass('loading');

        this.scenarios = new HistoricalCollection();
        var that = this;

        $('#start_button').on('click', function () {
            that.router = new MainRouter({});
        });

        var ready = _.after(2, function () {
            //$('#loading-container').hide(300);
            $('#loading-container').addClass('done');
            $('#start_button').removeAttr('disabled');
            setTimeout( function () {
                $('#loading-container').hide(0);
                $('#loading-container').removeClass('done');
            }, 200)
        });

        this.scenario = new ScenarioModel();
        this.scenario.runReady({
            success: ready
        });

        // this.showLoading();
        this.scenarios.fetch({
            success: ready
        });
    },

    showLoading: function (msg) {
        msg = '<div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div><h1>Loading Simulation</h4>';

        msg = 'Loading Simulation';
        $('#loading-indicator').html(msg);
        // animate in the loading indicator
        $('#loading-indicator').show(100);
        // set display:block on the backdrop
        $('#loading-backdrop').addClass('show1');
        var that = this;
        // animate in the backdrop
        setTimeout(function () {
            setTimeout( function () {
                that.spinner('loading-indicator');
            }, 120)
        }, 1);
    },

    spinner: function (id) {
        var opts = {
            lines: 8, // The number of lines to draw
            length: 3, // The length of each line
            width: 2, // The line thickness
            radius: 4, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#FAFAFA', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '10%' // Left position relative to parent
        };
        var target = document.getElementById(id);
        var spinner = new Spinner(opts).spin(target);
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

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
        msg = 'Loading...';

        $('#loading-indicator').html(msg);
        // animate in the loading indicator
        $('#loading-indicator').show(200);
        // set display:block on the backdrop
        $('#loading-backdrop').addClass('show1');
        this.spinner('loading-indicator');
        // animate in the backdrop
        setTimeout(function () {
            $('#loading-backdrop').addClass('show2');
        }, 1);
    },

    spinner: function (id) {
        var opts = {
            lines: 8, // The number of lines to draw
            length: 3, // The length of each line
            width: 1, // The line thickness
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
            left: '80%' // Left position relative to parent
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
        }, 500);
        // animate out the loading indicator
        $('#loading-indicator').hide(300);
    }
});

module.exports = App;

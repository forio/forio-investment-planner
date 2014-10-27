'use strict';

var net = require('./api-utils');
var endpoints = require('./endpoints');

var isFacilitator = function (resp, userId) {

    if (resp && resp.length) {
        var project = _.find(resp, function(project) {
            return project.project === endpoints.curProject && project.account === endpoints.curAccount
        });

        if (project) {
            return _.any( project.members, function(member) {
                return member.userId === userId && member.role === 'facilitator';
            })
        }
    }

    return false;
}

window.Auth = {
    login: function (user, password, options) {
        options = options || {};

        var success = options.success;

        options.success = function (data) {

            var userId = JSON.parse(new Buffer(data.access_token.split('.')[1], 'base64').toString('ascii')).user_id;

            var query = 'account=' + endpoints.curAccount + '&project=' + endpoints.curProject + '&userId=' + userId;

            net.get('member/local', query, {
                apiRoot: endpoints.host,
                success: function (resp) {
                    var isFac = isFacilitator(resp, userId);

                    net.createCookie(endpoints.sessionCookieName, {
                        access_token: data.access_token,
                        account: endpoints.curAccount,
                        project: endpoints.curProject,
                        isFac: isFac
                    } );

                    $.ajaxSetup({
                        headers: { 'Authorization' :'Bearer data.access_token' }
                    });

                    if (success) {
                        success.apply(this, arguments);
                    }

                }
            })

        };

        options.apiRoot = endpoints.host;

        return net.post(endpoints.login, { userName: user, account: this.account, password: password }, options);
    },

    account: endpoints.curAccount,

    isLoggedIn: function () {
        var cookie = net.getCookie(endpoints.sessionCookieName);
        if (!cookie || !cookie.access_token) {
            return false;
        }

        $.ajaxSetup({
            headers: { 'Authorization' :'Bearer ' + cookie.access_token }
        });

        return true;
    },

    logout: function (callback) {
        net.clearCookie(endpoints.sessionCookieName);
        if (callback) {
            callback();
        }
    },

    isFac: function () {
        var cookie = net.getCookie(endpoints.sessionCookieName);

        return cookie.isFac;
    },

    userId: function () {
        var cookie = net.getCookie(endpoints.sessionCookieName);

        if (!cookie || !cookie.access_token) {
            return '';
        }
        return JSON.parse(new Buffer(cookie.access_token.split('.')[1], 'base64').toString('ascii')).user_id;
    }
};


module.exports = window.Auth;

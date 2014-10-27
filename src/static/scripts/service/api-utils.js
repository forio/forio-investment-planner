'use strict';

var endpoints = require('./endpoints');

var defaults = {
    apiRoot: endpoints.root,
};

function wrapError(fn) {
    return function (xhr, error, message) {
        // logger.log('Error from the API', error, message);
        if (fn) {
            fn.apply(this, arguments);
        }
    };
}

function createCookie(name, value, days, domain) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toGMTString();
    } else {
        expires = '';
    }
    var domain = '';
    if (domain) {
        domain = '; domain=' + domain;
    }

    if (typeof value === 'object') {
        value = JSON.stringify(value);
    }

    document.cookie = name + '=' + value + domain + expires + '; path=/';
}

function getCookie(name) {
    if (document.cookie.length > 0) {
        var start = document.cookie.indexOf(name + '=');
        if (start !== -1) {
            start = start + name.length + 1;
            var end = document.cookie.indexOf(';', start);
            if (end === -1) {
                end = document.cookie.length;
            }

            var val = document.cookie.substring(start, end);
            if (val[0] === '{') {
                val = JSON.parse(val);
            }

            return val;
        }
    }

    return '';
}

function clearCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function prepareHeaders() {
    var cookie = getCookie('sim-session');

    var headers = {
        'Accept' : 'application/json',
        'Content-Type': 'application/json'
    };

    if (cookie.access_token) {
        _.extend(headers, {
            Authorization: 'Bearer ' + cookie.access_token
        });
    }

    return headers;
}

window.Net = {

    prepareHeaders: function () {
        var cookie = getCookie('sim-session');

        var headers = {
            'Accept' : 'application/json',
            'Content-Type': 'application/json'
        };

        if (cookie.access_token) {
            _.extend(headers, {
                Authorization: 'Bearer ' + cookie.access_token
            });
        }

        return headers;
    },

    get: function (endpoint, query, options) {
        var opt = _.extend({}, defaults, options || {});
        var headers = prepareHeaders();

        return $.ajax({
            type: 'GET',
            headers: headers,
            url: opt.apiRoot + '/' + endpoint + '?' + query,
            success: opt.success || _.noop,
            error: wrapError(opt.error),
            complete: opt.complete || _.noop
        });
    },

    post: function (endpoint, body, options) {
        var opt = _.extend({}, defaults, options || {});
        var headers = prepareHeaders();

        return $.ajax({
            type: 'POST',
            headers: headers,
            dataType: 'json',
            data: JSON.stringify(body),
            url: opt.apiRoot + '/' + endpoint,
            success: opt.success || _.noop,
            error: wrapError(opt.error),
            complete: opt.complete || _.noop
        });
    },

    patch: function (runId, body, options) {
        var opt = _.extend(options || {}, defaults);
        var headers = prepareHeaders();

        return $.ajax({
            type: 'PATCH',
            headers: headers,
            dataType: 'json',
            data: JSON.stringify(body),
            url: opt.apiRoot + '/' + runId + '/variables',
            success: opt.success || _.noop,
            error: wrapError(opt.error),
            complete: opt.complete || _.noop
        });
    },

    head: function (endpoint, options) {
        var opt = _.extend(options || {}, defaults);
        var headers = prepareHeaders();

        return $.ajax({
            type: 'HEAD',
            headers: headers,
            url: opt.apiRoot + '/' + endpoint,
            success: opt.success || _.noop,
            error: wrapError(opt.error),
            complete: opt.complete || _.noop
        });
    },

    createCookie: createCookie,

    getCookie: getCookie,

    clearCookie: clearCookie
};


module.exports = window.Net;

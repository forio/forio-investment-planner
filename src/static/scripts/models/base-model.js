'use strict';

var responseMessages = require('lib/response-messages');
var Validator = require('lib/validator');

var net = require('service/api-utils');
var __base__ = Backbone.Calculated.Model;
var __super__ = __base__.prototype;

var specFormat = require('lib/formatter');

var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET',
    'check': 'GET'
};

var responseCodes = {
    'create': {
        '201': responseMessages.save.success,
        '204': responseMessages.save.success
    },
    'update': {
        '200': responseMessages.save.success,
        '204': responseMessages.save.success
    },
    'patch': {
        '200': responseMessages.save.success,
        '204': responseMessages.save.success
    },
    'delete': {
        '200': responseMessages.destroy.success,
        '204': responseMessages.destroy.success
    },
    'read': {
        '200': responseMessages.fetch.success
    },
    'check': {
        '200': responseMessages.fetch.success
    },
    '401': responseMessages.errors.permissions,
    '403': responseMessages.errors.permissions,
    '404': responseMessages.errors.notFound,
    '409': responseMessages.errors.conflict,
    'unknown': responseMessages.errors.unknown
};

function joinUrl() {
    return _.map(arguments, function (segment) {
        return segment.replace(/(^\/|\/$)/g, '');
    }).join('/');
}

function urlSegmentError() {
    throw new Error('All "urlRootSegments" must be defined');
}

function urlError() {
    throw new Error('A "url" property or function must be specified');
}

function wrapError(model, options) {
    var error = options.error;

    options.error = function (resp) {
        if (error) {
            error(model, resp, options);
        }

        model.trigger('error', model, resp, options);
    };
}

module.exports = __base__.extend({

    constructor: function () {
        this.calculated = this.calculated || {};
        this.error = {};

        return __super__.constructor.apply(this, arguments);
    },

    getRunId: function () {
        if (!this.runId) {
            this.runId = this.collection.run.id;
        }
        return this.runId;
    },

    host: 'host',

    set: function (key, val, options) {
        var attrs;

        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        options = options || {};

        attrs = _.omit(attrs, _.keys(this.calculated));

        return __super__.set.call(this, attrs, options);
    },

    toJSON: function (options) {
        options = options || {};

        var args = arguments;
        var json = __super__.toJSON.apply(this, arguments);

        if (options.calculated == null || options.calculated === true) {
            _.each(this.calculated, function (calc, attr) {
                if (!(options && options.sync) || calc.sync) {
                    json[attr] = this.get(attr);
                }
            }, this);
        }

        _.each(json, function (value, key) {
            if (value instanceof module.exports) {
                json[key] = value.toJSON.apply(value, args);
            }
        });

        json.cid = this.cid;

        return json;
    },

    setError: function (key, value, options) {
        var error;

        if (typeof key === 'object') {
            error = key;
            options = value;
        } else {
            (error = {})[key] = value;
        }

        this.error = error;

        this.trigger('error', this, error, _.extend(options, { error: error }));

        return this;
    },

    getError: function (attr) {
        return this.error[attr] || this.validationError && this.validationError[attr];
    },

    unsetError: function (attr) {
        if (this.error) {
            delete this.error[attr];
        }

        if (this.validationError) {
            delete this.validationError[attr];
        }

        return this;
    },

    toggleAttr: function (attr) {
        var value = this.get(attr);
        value = value ? false : true;
        this.set(attr, value);
    },

    toViewJSON: function () {
        var json = this.toJSON();
        json.cid = this.cid;
        json.value = this.get(this.get('variable'));
        var format = this.get('format');
        if (format && json.value) {
            json.value = specFormat(format)(json.value);
        }

        return json;
    },

    formattedValue: function (value, format) {
        return specFormat(format)(value);
    },

    setValue: _.throttle(function (variable, value) {
        this.set(variable, value);
        var body = {};
        // body[variable + '[0]'] = value;
        body[variable] = value;

        net.patch(this.getRunId(), body);

    }, 500),

    toggleEnabled: function (variable) {
        var value = this.get(this.get('variable')); // does it have a value?
        value = value ? 0 : 1;
        this.set(this.get('variable'), value); // patch
        var body = {};
        var name = variable || this.get('variable');
        body[name + '[0]'] = value;
        net.patch(this.getRunId(), body);
    },

    toggleEnabledLever: function (variable) {
        var value = this.get(variable);
        value = value ? 0 : 1;
        this.set(variable, value);
        var body = {};
        body[variable + '[0]'] = value;
        net.patch(this.getRunId(), body, {
            success: function () {
                var id = net.getCookie('runId');
            }
        });
    },

    isValid: function () {
        var was = this.validationError == null || !_.size(this.validationError);
        var is = __super__.isValid.apply(this, arguments);

        if (!was && is) {
            this.trigger('valid');
        }

        return is;
    },

    validate: function (attrs, options) {
        var validator = new Validator(this, attrs, options);
        var validate = options && options.validate;

        if (!validate) {
            return;
        }

        for (var attr in this.meta) {
            if (_.has(this.meta, attr) && validate === true || validate === attr || _.contains(validate, attr)) {
                var meta = this.meta[attr];
                var type = meta.type || 'text';

                if (validator[type] && meta.validateType !== false) {
                    validator[type](attr);
                }

                /*jshint loopfunc: true */
                _.each(['required', 'regex', 'minLenth', 'maxLength', 'equalTo', 'email', 'password'], function (validation) {
                    if (meta[validation]) {
                        validator[validation](attr, meta[validation]);
                    }
                });
            }
        }

        return _.size(validator.errors) ? validator.errors : false;
    }

});

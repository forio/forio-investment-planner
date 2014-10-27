'use strict';

var Validator = function (model, attrs) {
    this.meta = model.meta;
    this.attributes = _.extend({}, model.attributes, attrs);
    this.errors = {};
};

_.extend(Validator.prototype, {

    getLabel: function (attr) {
        var meta = this.meta[attr];

        return meta.label || 'This field';
    },

    required: function (attr, options) {
        var label = this.getLabel(attr);
        var attrs = this.attributes;
        var errors = this.errors;

        options = _.isObject(options) ?
            options : _.isString(options) ?
                { message: options } : {};

        options = _.defaults({}, options, {
            message: label + ' is required.'
        });

        if (!attrs[attr]) {
            errors[attr] = options.message;
        }

        return this;
    },

    regex: function (attr, options) {
        var regex = options && options.expr;

        if (!(regex && regex instanceof RegExp)) {
            throw new Error('RegExp required.');
        }

        var label = this.getLabel(attr);
        var attrs = this.attributes;
        var errors = this.errors;
        var value = attrs[attr];

        options = _.defaults({}, options, {
            message: label + ' doesn\'t match the expression "' + regex + '".'
        });

        if (value && !regex.test(value)) {
            errors[attr] = options.message;
        }

        return this;
    },

    minLength: function (attr, options) {
        var length = _.isObject(options) ? options.length : options;

        if (!length) {
            throw new Error('Length required.');
        }

        var label = this.getLabel(attr);
        var attrs = this.attributes;
        var errors = this.errors;
        var value = attrs[attr];

        options = _.defaults({}, options, {
            message: label + ' must be at least ' + length + ' characters.'
        });

        if (value && value.length < length) {
            errors[attr] = options.message;
        }

        return this;
    },

    maxLength: function (attr, options) {
        var length = _.isObject(options) ? options.length : options;

        if (!length) {
            throw new Error('Length required.');
        }

        var label = this.getLabel(attr);
        var attrs = this.attributes;
        var errors = this.errors;
        var value = attrs[attr];

        options = _.defaults({}, options, {
            message: label + ' must be no more than ' + length + ' characters.'
        });

        if (value && value.length > length) {
            errors[attr] = options.message;
        }

        return this;
    },

    password: function (attr, options) {
        this.regex(attr, { expr: /.*[0-9].*$/, message: 'Password must contain at least one number.' });
        this.regex(attr, { expr: /.*[a-z].*$/i, message: 'Password must contain at least one letter.' });
        this.minLength(attr, { length: 8, message: 'Password must be at least eight characters.' });
        this.maxLength(attr, { length: 255, message: 'Password must be no more than 255 characters.' });

        return this;
    },

    email: function (attr, options) {
        var label = this.getLabel(attr);

        options = options instanceof RegExp ?
            { expr: options } : _.isObject(options) ?
                options : _.isString(options) ?
                    { message: options } : {};

        options = _.defaults({}, options, {
            expr: /.+@.+\..+/,
            message: label + ' must be a valid email.'
        });

        return this.regex(attr, options);
    },

    equalTo: function (attr, options) {
        var other = _.isObject(options) ? options.other : options;

        if (!other) {
            throw new Error('Other required.');
        }

        var attrs = this.attributes;
        var errors = this.errors;
        var value = attrs[attr];
        var otherValue = attrs[other];

        options = _.defaults({}, options, {
            message: this.getLabel(attr) + ' must match ' + this.getLabel(other).toLowerCase() + '.'
        });

        if (otherValue !== value) {
            errors[attr] = options.message;
        }
    }

});

module.exports = Validator;
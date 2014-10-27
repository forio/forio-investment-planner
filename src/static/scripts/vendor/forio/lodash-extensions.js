(function (root, undefined) {
    var SMALL = '(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)';
    var PUNCT = '([!"#$%&\'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)';

    /* Ported from the actionscript code
    * Author was originally Juan Carlos
    * Switched order of arguments to make more consistent with other implementations of formatNumber
    */
    var numberFormatter = (function () {

        var scales = ['', 'K', 'M', 'B', 'T'];

        function getDigits(value, digits) {
            value = value == 0 ? 0 : roundTo(value, Math.max(0, digits - Math.ceil(Math.log(value) / Math.LN10)));

            var TXT = '';
            var numberTXT = value.toString();
            var decimalSet = false;

            for (var iTXT = 0; iTXT < numberTXT.length; iTXT++) {
                TXT += numberTXT.charAt(iTXT);
                if (numberTXT.charAt(iTXT) == '.') {
                    decimalSet = true;
                } else {
                    digits--;
                }

                if (digits <= 0) {
                    return TXT;
                }
            }

            if (!decimalSet) {
                TXT += '.';
            }
            while (digits > 0) {
                TXT += '0';
                digits--;
            }
            return TXT;
        }

        function addDecimals(value, decimals, minDecimals, hasCommas) {
            hasCommas = hasCommas || true;
            var numberTXT = value.toString();
            var hasDecimals = (numberTXT.split('.').length > 1);
            var iDec = 0;

            if (hasCommas) {
                for (var iChar = numberTXT.length - 1; iChar > 0; iChar--) {
                    if (hasDecimals) {
                        hasDecimals = !(numberTXT.charAt(iChar) == '.');
                    } else {
                        iDec = (iDec + 1) % 3;
                        if (iDec == 0) {
                            numberTXT = numberTXT.substr(0, iChar) + ',' + numberTXT.substr(iChar);
                        }
                    }
                }

            }
            if (decimals > 0) {
                var toADD;
                if (numberTXT.split('.').length <= 1) {
                    toADD = minDecimals;
                    if (toADD > 0) {
                        numberTXT += '.';
                    }
                } else {
                    toADD = minDecimals - numberTXT.split('.')[1].length;
                }

                while (toADD > 0) {
                    numberTXT += '0';
                    toADD--;
                }
            }
            return numberTXT;
        }

        function roundTo(value, digits) {
            return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
        }

        function getSuffix(formatTXT) {
            formatTXT = formatTXT.replace('.', '');
            var fixesTXT = formatTXT.split(new RegExp('[0|,|#]+', 'g'));
            return (fixesTXT.length > 1) ? fixesTXT[1].toString() : '';
        }

        function isCurrency(string) {
            var s = $.trim(string);

            if (s == "$" ||
                s == "€" ||
                s == "¥" ||
                s == "£" ||
                s == "₡" ||
                s == "₱" ||
                s == "Kč" ||
                s == "kr" ||
                s == "¢" ||
                s == "₪" ||
                s == "ƒ" ||
                s == "₩" ||
                s == "₫") {

                return true;
            }

            return false;
        }

        function format(number, formatTXT, nullFormat) {
            if (number == null || isNaN(number)) {
                return nullFormat ? nullFormat : '?';
            }

            if (!formatTXT || formatTXT.toLowerCase() == 'default')
                return number.toString();



            //var formatTXT;
            formatTXT = formatTXT.replace('&euro;', '€');

            // Divide +/- Number Format
            var formats = formatTXT.split(';');
            if (formats.length > 1) {
                return format(Math.abs(number), formats[((number >= 0) ? 0 : 1)]);
            }

            // Save Sign
            var sign = (number >= 0) ? '' : '-';
            number = Math.abs(number);


            var leftOfDecimal = formatTXT;
            var d = leftOfDecimal.indexOf(".");
            if (d > -1)
                leftOfDecimal = leftOfDecimal.substring(0, d);

            var normalized = leftOfDecimal.toLowerCase();
            var index = normalized.lastIndexOf('s');
            var isShortFormat = index > -1;

            if (isShortFormat) {
                var nextChar = leftOfDecimal.charAt(index + 1);
                if (nextChar == " ")
                    isShortFormat = false;
            }

            var leadingText = isShortFormat ? formatTXT.substring(0, index) : "";
            var rightOfPrefix = isShortFormat ? formatTXT.substr(index + 1) : formatTXT.substr(index);

            //first check to make sure 's' is actually short format and not part of some leading text
            if (isShortFormat) {
                var shortFormatTest = /[0-9#*]/;
                var shortFormatTestResult = rightOfPrefix.match(shortFormatTest);
                if (!shortFormatTestResult || shortFormatTestResult.length == 0) {
                    //no short format characters so this must be leading text ie. "weeks "
                    isShortFormat = false;
                    leadingText = "";
                }
            }

            //if (formatTXT.charAt(0) == 's')
            if (isShortFormat) {
                var valScale = number == 0 ? 0 : Math.floor(Math.log(Math.abs(number)) / (3 * Math.LN10));
                valScale = ((number / Math.pow(10, 3 * valScale)) < 1000) ? valScale : (valScale + 1);
                valScale = Math.max(valScale, 0);
                valScale = Math.min(valScale, 4);
                number = number / Math.pow(10, 3 * valScale);
                //if (!isNaN(Number(formatTXT.substr(1) ) ) )

                if (!isNaN(Number(rightOfPrefix)) && rightOfPrefix.indexOf(".") == -1) {
                    var limitDigits = Number(rightOfPrefix);
                    if (number < Math.pow(10, limitDigits)) {
                        if (isCurrency(leadingText))
                            return sign + leadingText + getDigits(number, Number(rightOfPrefix)) + scales[valScale];
                        else
                            return leadingText + sign + getDigits(number, Number(rightOfPrefix)) + scales[valScale];
                    } else {
                        if (isCurrency(leadingText))
                            return sign + leadingText + Math.round(number) + scales[valScale];
                        else
                            return leadingText + sign + Math.round(number) + scales[valScale];
                    }
                } else {
                    //formatTXT = formatTXT.substr(1);
                    formatTXT = formatTXT.substr(index + 1);
                    var SUFFIX = getSuffix(formatTXT);
                    formatTXT = formatTXT.substr(0, formatTXT.length - SUFFIX.length);

                    var valWithoutLeading = format(((sign == '') ? 1 : -1) * number, formatTXT) + scales[valScale] + SUFFIX;
                    if (isCurrency(leadingText) && sign != '') {
                        valWithoutLeading = valWithoutLeading.substr(sign.length);
                        return sign + leadingText + valWithoutLeading;
                    }

                    return leadingText + valWithoutLeading;
                }
            }

            var subFormats = formatTXT.split('.');
            var decimals;
            var minDecimals;
            if (subFormats.length > 1) {
                decimals = subFormats[1].length - subFormats[1].replace(new RegExp('[0|#]+', 'g'), '').length;
                minDecimals = subFormats[1].length - subFormats[1].replace(new RegExp('0+', 'g'), '').length;
                formatTXT = subFormats[0] + subFormats[1].replace(new RegExp('[0|#]+', 'g'), '');
            } else {
                decimals = 0;
            }

            var fixesTXT = formatTXT.split(new RegExp('[0|,|#]+', 'g'));
            var preffix = fixesTXT[0].toString();
            var suffix = (fixesTXT.length > 1) ? fixesTXT[1].toString() : '';

            number = number * ((formatTXT.split('%').length > 1) ? 100 : 1);
            number = roundTo(number, decimals);

            sign = (number == 0) ? '' : sign;

            var hasCommas = (formatTXT.substr(formatTXT.length - 4 - suffix.length, 1) == ',');
            return sign + preffix + addDecimals(number, decimals, minDecimals, hasCommas) + suffix;
        }

        return {
            format: format
        };
    })();

    var _f = {

        VERSION: '0.0.1',

        // General
        // -------------

        // Return a namespace or create it if it doesn't exist.
        namespace: function (obj, path) {
            var scopes = path.split('.'),
                namespace = obj;

            _.each(scopes, function (scope) {
                namespace = (namespace[scope] = namespace[scope] || {});
            });

            return namespace;
        },

        // returns the value of the nested path in the object
        // or undefined if the path is not valid
        nested: function (obj, path) {
            var scopes = path.split('.'),
                namespace = obj;

            _.each(scopes, function (scope) {
                namespace = namespace[scope];
            });

            return namespace;
        },

        // Returns an object that can be extended similarly to clasical inheritence .
        // See `Backbone.extend` for an example.
        extendable: function (obj) {
            obj.extend = function (prototype, extension) {
                var parent = this,
                    child;

                if (prototype && _.has(prototype, 'constructor')) {
                    child = prototype.constructor;
                } else {
                    child = function () {
                        parent.apply(this, arguments);
                    };
                }

                _.extend(child, parent, extension);

                var Surrogate = function () {
                    this.constructor = child;
                };

                Surrogate.prototype = parent.prototype;
                child.prototype = new Surrogate();

                if (prototype) {
                    _.extend(child.prototype, prototype);
                }

                child._super_ = parent.prototype;

                return child;
            };

            return obj;
        },

        // Return the first non-null argument.
        coalesce: function () {
            var args = arguments,
                i,
                arg,
                length = args.length;

            for (i = 0; i < length; i++) {
                arg = args[i];
                if (arg != null) {
                    return arg;
                }
            }
        },

        // Numbers
        // -------------

        // Returns the sum of a list.
        sum: function (list) {
            return _.reduce(list, function (memo, n) { return memo + n; }, 0);
        },

        // Returns the mean of a list.
        mean: function (list) {
            return _f.sum(list) / _.size(list);
        },

        // return a vector with the result of mulplying the two arrays
        // ie. [a[0] * b[0], a[1] * b[1], ...]
        multiply: function (a, b) {
            var result = [];
            if (!a || !b || a.length !== b.length) return [];

            for (var j=0; j<a.length; j++) {
                result[j] = a[j] * b[j];
            }

            return result;
        },

        linearRegression: function (x, y) {
            var xBar = _f.mean(x);
            var yBar = _f.mean(y);

            var numerator = 0;
            var denominator = 0;

            for (var i = 0, len = x.length; i < len; i++) {
                numerator += (x[i] - xBar) * (y[i] - yBar);
                denominator += Math.pow(x[i] - xBar, 2);
            }

            var slope = numerator / denominator;
            var intercept = yBar - slope * xBar;

            return {
                minX: _.min(x),
                maxX: _.max(x),
                slope: slope,
                intercept: intercept
            };
        },

        // Returns the variance of a list.
        variance: function (list) {
            var mean = _f(list),
                length = _.size(list);

            return _.reduce(list, function (memo, x) { return memo + Math.pow(x - mean, 2); }, 0) / length;
        },

        // Returns the standard deviation of a list.
        stdev: function (list) {
            return Math.sqrt(_.variance(list));
        },

        // Returns an object containing the frequency of each occurance in a list.
        frequency: function (list) {
            var result = {};

            _.each(list, function (item) {
                result[item] = result[item] || 0;

                result[item]++;
            });

            return result;
        },

        // Returns the median of a list.
        median: function (list) {
            var sorted = _.sortBy(list),
                middle = sorted.length / 2;

            return middle % 2 === 0 ? (list[middle - 1] + list[middle + 1]) / 2 : list[middle];
        },

        // Divides 2 integers and returns the resultant quotient and remainder in an object.
        integerDivision: function (a, b) {
            return {
                quotient: ~~(a / b),
                remainder: a % b
            };
        },

        // Rounds a number to the specified number of places.
        roundTo: function (value, places) {
            return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
        },

        roundToNearest: function (value, n) {
            return Math.round(value / n) * n;
        },

        evalConditionsVector: function (conditions, values) {
            return _.sum(_.multiply(conditions, values)) !== 0;
        },

        // Builds a range from start to end given a pattern [a, -b, c, -d, e].
        // Positive numbers are included in the range, negative ones are skipped.
        patternedRange: function (start, end, pattern) {
            var n = start,
                i = 0,
                output = [];

            while (n < end) {
                var step = pattern[i];

                output = step > 0 ? output.concat(_.range(n, n + step)) : output;

                n += Math.abs(step);
                i += 1;

                if (i === pattern.length) i = 0;
            }

            return output;
        },

        // Strings
        // -------------

        parseCSV: function (csv, columns, options) {
            var defaults = {
                separator: /\t|,/,
                linebreak: /\n|\r\n/,
                cast: true
            };

            options = _.defaults(options || {}, defaults);

            return _.map(csv.split(options.linebreak), function (line) {
                var row = {};
                var fields = line.split(options.separator);

                _.each(columns, function (col, index) {
                    if (fields[index] !== undefined) {
                        var trimmed = _f.trim(fields[index]);

                        row[_f.camelCase(col)] = options.cast ? _f.castToLiteral(trimmed) : trimmed;
                    }
                });

                return row;
            });
        },

        // Trims whitespace from the beginning and end of a string.
        trim: function (s) {
            return s.replace(/^\s+|\s+$/g, '');
        },

        // Returns a string with an uppercase first letter.
        capitalize: function (string) {
            return string.substr(0, 1).toUpperCase() + string.substr(1);
        },

        // Returns a lowercase version of a string.
        lowerCase: function (string) {
            return string.toLowerCase();
        },

        camelCase: function (string, separator) {
            var regex = new RegExp((separator || ' ') + '(.)', 'g');

            return string.toLowerCase().replace(regex, function ($0, $1) {
                return $1.toUpperCase();
            });
        },

        // Returns a string with each word capitalized, unless it is blacklisted.
        // The default blacklist is... a, an, and, as, at, but, by, en, for, if, in, of, on, or, the, to, v, via, vs.
        titleCase: function (title, blacklist) {
            var parts = [],
                split = /[:.;?!] |(?: |^)["Ò]/g,
                index = 0;

            title = _f.lowerCase(title);
            blacklist = blacklist || SMALL;

            while (true) {
                var m = split.exec(title);

                parts.push(title.substring(index, m ? m.index : title.length)
                    .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function (all) {
                        return (/[A-Za-z]\.[A-Za-z]/).test(all) ? all : _f.capitalize(all);
                    })
                    .replace(RegExp('\\b' + blacklist + '\\b', 'ig'), _f.lowerCase)
                    .replace(RegExp('^' + PUNCT + blacklist + '\\b', 'ig'), function (all, PUNCT, word) {
                        return PUNCT + _f.capitalize(word);
                    })
                    .replace(RegExp('\\b' + blacklist + PUNCT + '$', 'ig'), _f.capitalize));

                index = split.lastIndex;

                if (m) {
                    parts.push(m[0]);
                } else {
                    break;
                }
            }

            return parts.join('').replace(/ V(s?)\. /ig, ' v$1. ')
                .replace(/(['Õ])S\b/ig, '$1s')
                .replace(/\b(AT&T|Q&A)\b/ig, function (all) {
                    return all.toUpperCase();
                });
        },

        // Returns `true` if the input is null, undefined, or an empty string.
        isNullOrEmpty: function (string) {
            return string == null || string === '';
        },

        // Returns `true` if the input is null, undefined, or string of only whitespace.
        isNullOrWhitespace: function (string) {
            return string == null || /^\s*$/.test(string);
        },

        // Casts a string to its literal version
        // Example: `"true"` because `true`.
        castToLiteral: function (string) {
            string = string + '';

            if (string === 'true') {
                return true;
            } else if (string === 'false') {
                return false;
            } else if (/^[\-+]?([0-9]+)?[\.]?[0-9]+([eE][0-9]+)?$/.test(string)) {
                return parseFloat(string);
            } else {
                return string;
            }
        },

        englishList: function (list) {
            var length = list.length;

            return _.map(list, function (item, i) {
                if (length === 1) {
                    return item;
                }

                if (length === 2) {
                    return i === 0 ? item + ' and' : item;
                }

                if (length > 2) {
                    return i < length - 1 ? item + ',' : 'and ' + item;
                }
            }).join(' ');
        },

        // TODO, needs a list of words that have weird pluralizations.
        pluralize: function (length, word) {
            return length === 0 || length > 1 ? word + 's' : word;
        },

        // Takes an ISO time and returns a string representing how
        // long ago the date represents.
        // from http://ejohn.org/files/pretty.js
        prettyDate: function (time) {
            var date = new Date(time); // new Date((time || '').replace(/-/g,'/').replace(/[TZ]/g,' '));
            var diff = (((new Date()).getTime() - date.getTime()) / 1000);
            var day_diff = Math.floor(diff / (3600 * 24));
            var month_diff = Math.floor(diff / (3600 * 24 * 30));

            if (isNaN(day_diff) || day_diff < 0)
                return;

            return day_diff === 0 && (
                    diff < 60 && 'Just Now' ||
                    diff < 120 && '1 minute ago' ||
                    diff < 3600 && Math.floor(diff / 60) + ' minutes ago' ||
                    diff < 7200 && '1 hour ago' ||
                    diff < 86400 && Math.floor(diff / 3600) + ' hours ago') ||
                day_diff === 1 && 'Yesterday' ||
                day_diff < 7 && day_diff + ' days ago' ||
                day_diff < 31 && Math.ceil(day_diff / 7) + ' weeks ago' ||
                month_diff === 1 && 'Last Month' ||
                month_diff + ' months ago';
        },

        indexOfWhere: function (array, fn) {
            if (!array) return -1;

            for (var i=0; i<array.length; i++) {
                if(fn.call(this, array[i])) {
                    return i;
                }
            }

            return -1;
        },

        // Excel style number formatting
        format: numberFormatter.format
    };

    // CommonJS module is defined
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            // Export module
            module.exports = _f;
        }
        exports._f = _f;

    } else if (typeof define === 'function' && define.amd) {
        // Register as a named module with AMD.
        define('underscore.forio', [], function() {
            return _f;
        });

    } else {
        // Integrate with _.js if defined
        // or create our own _ object.
        root._ = root._ || {};
        root._.forio = root._.f = _f;
    }

})(this);

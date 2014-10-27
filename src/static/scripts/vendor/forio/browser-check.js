(function (undefined) {

    // note that the order of detection matters... ie ipad has ipad / safari
    var detection = [
        { key: 'firefox', identity: 'firefox', version: 'firefox' },
        { key: 'chrome', identity: 'chrome', version: 'chrome' },
        { key: 'ipad', identity: 'ipad', version: 'Version' },
        { key: 'safari', identity: 'safari', version: 'safari' },
        { key: 'ie', identity: 'msie', version: 'msie' }
    ];

    var supportedBrowsers = {
        firefox: {
            min: 20
        },

        chrome: {
            min: 26
        },

        safari: {
            min: 5
        },

        ie: {
            min: 9
        },

        android: {

        },

        ipad: {
            min: 6
        }
    };

    function match (test) {
        var exp = new RegExp(test, 'i');
        return navigator.userAgent.match(exp) !== null;
    }

    window.BrowserDetector = detector = function (support) {
        this.supported = support || supportedBrowsers;
        this.init();
    };

    detector.prototype = {

        init: function () {

            for (var j=0; j<detection.length; j++) {
                if (match(detection[j].identity)) {
                    var exp = new RegExp(detection[j].version + '[\\s/]([\\d\\.]+)', 'i');
                    var version = navigator.userAgent.match(exp);

                    this.browser = {
                        key: detection[j].key,
                        name: detection[j].identity,
                        version: parseFloat(version[1])
                    };

                    return;
                }
            }
        },

        isIPad: function () {
            return match('iPad');
        },

        isCompliant: function (support) {
            support = support || supportedBrowsers;

            var required = this.supported[this.browser.key];
            if (!required) return false;

            if (!required.min) return true;

            return this.browser.version >= required.min;
        }
    };

})();

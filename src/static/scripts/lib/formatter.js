var specFormats = {
    'Trillions': 3*4,
    'Billions': 3*3,
    'Millions': 3*2
};

var flatFormats = ['years'];

var specFormat = function(format) {

    var flatFormat = flatFormats.indexOf(format);
    if (flatFormat !== -1) {
        return function (number) {
            return number + ' ' + format;
        }
    }
    var zeroCount = specFormats[format];

    if (!zeroCount) {
        return d3.format(format);
    }

    return function (number) {
        return d3.format("$,.02f")(number / Math.pow(10, zeroCount)) + ' ' + format.substr(0,1);
        // return '$' + Math.round( number / Math.pow(10, (zeroCount - 2)) ) / 100 + ' ' + format.substr(0,1);
    };
};

module.exports = specFormat;

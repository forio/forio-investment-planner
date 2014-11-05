module.exports = function (data) {
    var avg = [];
    var forcastsLength = data.length;
    var sum;
    var forcastLength = data[0].length;
    var lasts = _.map(data, function (forcast) {
        return forcast[forcastLength - 1];
    })
    for (var i = 0, l = forcastLength; i < l; i++) {
        sum = _.reduce(data, function(memo, forcast){ return memo + forcast[i]; }, 0);
        avg.push(sum / forcastsLength);
    }



    var min = +_.min(lasts).toFixed();
    var max = +_.max(lasts).toFixed();

    var forcast = new Contour({
        el: '.return-forcast',
        chart: {
            padding: {
                left: 130,
                right: 60
            },
            // animations : { enable: false },
            height: 200,
        },
        xAxis: {
            innerTickSize: 0,
            outerTickSize: 0,
            ticks: 4,
            labels: {
                formatter: function (g) {
                    if (g === 0) {
                        return ''
                    };
                    return 'Year ' + g;
                }
            }
        },
        yAxis: {
            zeroAnchor: false,
            innerTickSize: 0,
            outerTickSize: 0,
            tickValues: [min, 100, max],
            labels: {
                formatter: function (g) {
                    if (g === 200) { 
                        return ''
                    };
                    return '$' + g;
                }
            }
        },
        line: {
            marker: {
                enable: false
            }
        }
    })
    .cartesian();

    forcast.line(data);
    forcast.line(avg);

    forcast.render();
};

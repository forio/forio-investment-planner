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

    var highlighted;

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
        },
        tooltip: {
            formatter: function (v) { 
                $('g[vis-id="2"] .series').css('opacity', 0.1);
                highlighted = $('.series.'+ v.series.split(' ').pop());
                highlighted.css('opacity', 0.9);
                var cagr = Math.pow( (100 / v.y), (1 / v.x) ) - 1;
                var text = '<p>Year ' + v.x + ' Value: $' + d3.format('.2f')(v.y) + '</p>';
                text = text + '<p>Compound Annual Growth Rate (CAGR): ' + d3.format('%.2f')(cagr) + '</p>';
                return text; 
            },
            hideTime: function () {
                $('g[vis-id="2"] .series').css('opacity', 0.4);
                return true;
            }
        }

    })
    .cartesian();

    forcast.line(avg);

    forcast.line(data);
    forcast.tooltip();

    forcast.render();
};

module.exports = function (data) {
    

    var avg = [];
    var forcastsLength = data.length;
    var sum;
    for (var i = 0, l = data[0].length; i < l; i++) {
        sum = _.reduce(data, function(memo, forcast){ return memo + forcast[i]; }, 0);
        avg.push(sum / forcastsLength);
    }

    var forcast = new Contour({
        el: '.return-forcast',
        chart: {
            padding: {
                left: 120,
                right: 60
            },
            height: 160,
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
            innerTickSize: 0,
            outerTickSize: 0,
            ticks: 3,
            // tickValues: 3,
            max: 300,
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
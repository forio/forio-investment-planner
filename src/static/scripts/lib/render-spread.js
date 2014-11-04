module.exports = function (chance, bucketData) {
    var data = bucketData.bucketSpread;
    var bucketSize = bucketData.bucketSize;
    var bucketStart = bucketData.bucketStart;
    var totalValue = bucketData.totalValue;
    this.renderChancePie(chance);

    var tickValues = []
    var resultsSpread = new Contour({
            el: '.return-bar',
            chart: {
                padding: {
                    left: 0,
                    right: 0
                },
                animations : { enable: false },
                height: 120
            },
            xAxis: {
                innerTickSize: 0,
                outerTickSize: 0,
                strokeWidth: '0px',
                labels: {
                    formatter: function (g) {
                        return '$' + (g + 1) * bucketSize;
                    }
                }
            },
            yAxis: {
                innerTickSize: 0,
                outerTickSize: 0,
                strokeWidth: 0
            }
        })
        .cartesian()
        .column(data);

    resultsSpread.connectLines(data, {
        average: this.average
    })
    resultsSpread.render();

    resultsSpread.adjustVertical(data, {
        average: this.average,
        totalValue: totalValue,
        bucketStart: bucketStart
    });

    resultsSpread.render();
    };

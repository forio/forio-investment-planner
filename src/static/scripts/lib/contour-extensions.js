
Contour.export('averageValue', function (data, layer, options) {
    var average = options.averageValue.average;
    var numberFormat = d3.format('$,.2f');

    var pieTopPadding = options.averageValue.pieTopPadding;

    var value = numberFormat(average)

    var horizontalPointer = layer.selectAll('.horizontal-pointer').data([null]);

    horizontalPointer.enter().append('line')
        .attr({
            class: 'horizontal-pointer',
            x1: 0,
            y1: -pieTopPadding + 6,
            x2: options.chart.plotWidth,
            y2: -pieTopPadding + 6
        });

    var bounds = _.nw.textBounds(value, '.average-number .number');

    var averageBox = layer.selectAll('.average-box').data([null]);

    averageBox.enter().append('rect')
        .attr({
            class: 'average-box',
            x: 0,
            width: bounds.width + 20,
            height: bounds.height + 10,
            y: -pieTopPadding + 6
        });

    var averageValue = layer.selectAll('.grand-total').data([null]);

    averageValue.enter().append('text')
        .attr('class', 'average-number number');

    averageValue
        .attr('x',  10) //options.chart.plotWidth - (bounds.width + 10))
        .attr('y', -12)// totalY + 4)
        .attr('dy', '.4em')
        .text(function() { return value});
});


Contour.export('connectLines', function (data, layer, options) {
    var totalValue = options.connectLines.totalValue;
    var totalsPadding = options.chart.padding.right;
    var numberFormat = d3.format('$,.0f');

    var value = numberFormat(totalValue)

    var verticalPointer = layer.selectAll('.vertical-pointer').data([null]);

    verticalPointer.enter().append('line')
        .attr({
            class: 'vertical-pointer',
            x1: 100,
            y1: 0,
            x2: 100,
            y2:  options.chart.plotHeight
        });

    var horizontalPointer = layer.selectAll('.horizontal-pointer').data([null]);

    horizontalPointer.enter().append('line')
        .attr({
            class: 'horizontal-pointer',
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
        });
});

Contour.export('adjustVertical', function (data, layer, options) {
    var verticalLine =  d3.select(this.svg.selectAll('.vertical-pointer'))[0][0];

    var chartWidth = d3.select(this.svg.selectAll('rect'))[0][0].attr('width');
    var bucketStart = options.adjustVertical.bucketStart;
    var total = options.adjustVertical.totalValue;
    var value = options.adjustVertical.average - bucketStart;
    var x = value / total * chartWidth + 3;
    verticalLine.attr('x1', x);

    verticalLine.attr('x2', x);

    var verticalLine =  d3.select(this.svg.selectAll('.horizontal-pointer'))[0][0];
    verticalLine.attr('x2', x); 
});



Contour.export('chanceText', function (data, layer, options) {
    var chanceCopy = 'Chance of Loss';
    var bounds = _.nw.textBounds(chanceCopy, '.average-number');
    var chanceText = layer.selectAll('.chance-text').data([null]);

    chanceText.enter().append('text')
        .attr('class', 'chance-text');

    chanceText
        .attr('x', 0)
        .attr('y', 25)
        .attr('dy', '.4em')
        .text(function() { return chanceCopy});
});

Contour.export('adjustDonut', function (data, layer, options) {
    var donutTextNode =  d3.select(this.svg.selectAll('.donut-text'))[0][0];
    var x = donutTextNode.attr('x');

    var chanceCopy = d3.format('%')(options.adjustDonut.value);
    var bounds = _.nw.textBounds(chanceCopy, '.number');
    donutTextNode.attr('x', 45 - bounds.width);
    var y = donutTextNode.attr('y');
    donutTextNode.attr('y', y - 6);
});
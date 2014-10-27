'use strict';

var BaseApp = function () {};

var verticalTooltip = function () {
    var defaults = {
        tooltip: {
            enable: true,
            animate: true,
            opacity: 1,
            showTime: 300,
            hideTime: 500
        }
    };

    var tooltips = {};

    function render(data, layer) {
        var that = this;

        var options = that.options.tooltip;
        var container = that.container;
        var xScale = that.xScale;
        var plotLeft = that.options.chart.plotLeft;
        var plotTop = that.options.chart.plotTop;
        var plotHeight = that.options.chart.plotHeight;
        var tooltipElement, tooltipLine;

        if (options.category) {
            if (!tooltips[options.category]) {
                tooltips[options.category] = {};
            }
            tooltips[options.category][options.key] = {
                over: function (x) {
                    onMouseOver(_.find(data[0].data, function (d) {
                        return d.x === x;
                    }), true);
                },
                out: function () {
                    onMouseOut(true);
                }
            };
        }

        renderTooltipTrackers();
        renderTooltipElement();
        renderTooltipLine();

        that.svg.selectAll('.vt-tooltip-tracker')
            .on('mouseover.tooltip', onMouseOver)
            .on('mouseout.tooltip',  onMouseOut);


        function onMouseOver(d, inner) {
            if (inner !== true && options.category) {
                _.each(tooltips[options.category], function (t) {
                    t.over(d.x);
                });
            } else {
                show(d);
            }
        }

        function onMouseOut(inner) {
            if (inner !== true && options.category) {
                _.each(tooltips[options.category], function (t) {
                    t.out();
                });
            } else {
                changeOpacity(0, options.hideTime);
            }
        }

        function changeOpacity(opacity, delay) {
            if (options.animate) {
                tooltipElement.transition().duration(delay)
                    .style('opacity', opacity);
                if (opacity === 0) {
                    // only handle the fade out of the tooltip line here, since adding a transition would cancel the movement transition
                    tooltipLine.transition().duration(delay)
                        .attr('opacity', opacity);
                }
            } else {
                tooltipElement.style('opacity', opacity);
                if (opacity === 0) {
                    // only handle the fade out of the tooltip line here
                    tooltipLine.attr('opacity', opacity);
                }
            }
        }

        function getTooltipText(d, allPoints) {
            function match() {
                var params = Array.prototype.slice.call(arguments);
                var list = params[0];
                var rest = params.slice(1);

                var response = _.map(list, function(fn) { return fn.apply(that, rest); }).concat([_.noop]);

                return _.first(_.select(response));
            }

            var formatters = [
                function (d) { return options.formatter ? _.partial(options.formatter, d, allPoints) : null; },
                function (d) {
                    return d.hasOwnProperty('x') ? _.partial(function (d0) {
                        return d0.x + ' &nbsp;:&nbsp; ' + _.map(data, function (v, k) {
                            var d2 = _.find(v.data, function (d1) {
                                return d0.x === d1.x;
                            });
                            return '<span class="s-' + (k + 1) + ' ' + _.nw.seriesNameToClass(v.name) + '">' +
                                (d2 ? (options.labelFormatter ? options.labelFormatter(d2.y) : d2.y) : '-') +
                                '</span>';
                        }).join(' / ');
                    }, d) : null;
                }
            ];

            return match(formatters, d)();
        }

        function show(d) {
            var dataPoints = findOriginalDataPoint(d);

            tooltipElement.select('.number').html(getTooltipText(dataPoints[0] || d, dataPoints));

            var x = xScale(d.x);
            if (options.animate) {
                if (+tooltipLine.attr('opacity') === 0) {
                    // only animate tooltip line motion if the line is currently still visible
                    tooltipLine.attr('x', x)
                        .transition()
                            .attr('opacity', options.opacity);
                } else {
                    // otherwise just animate tooltip line opacity
                    tooltipLine
                        .transition()
                            .attr('x', x)
                            .attr('opacity', options.opacity);
                }
            } else {
                tooltipLine.attr('x', x)
                    .attr('opacity', options.opacity);
            }

            changeOpacity(options.opacity, options.showTime);
        }

        function findOriginalDataPoint(d) {
            var res = [];
            _.each(data, function (series) {
                var name = series.name;
                _.each(series.data, function (point) {
                    if (point.x === d.x && d.y === point.y) {
                        res.push(_.extend(point, { series: name }));
                    }
                });
            });

            return res;
        }

        function renderTooltipTrackers() {
            // only render tooltip trackers using base dataset
            var data0 = [_.cloneDeep(data[0])];
            if (data0[0].data[data0[0].data.length - 1].hide) {
                data0[0].data.pop();
            }
            var trackerSize = xScale(data0[0].data[1].x) - xScale(data0[0].data[0].x);
            var markers = layer.selectAll('.vt-tooltip-trackers')
                .data(data0, function (d) { return d.name; });

            markers.enter().append('g')
                .attr('class', function (d) { return 'vt-tooltip-trackers'; });

            markers.exit().remove();

            var rects = markers.selectAll('.vt-tooltip-tracker')
                .data(function (d) { return d.data; }, function (d) { return d.x; });

            rects.enter()
                .append('rect')
                .attr({
                    'class': 'vt-tooltip-tracker',
                    'opacity': 0,
                    'x': function (d) { return xScale(d.x) - trackerSize / 2; },
                    'y': plotTop,
                    'width': trackerSize,
                    'height': plotHeight
                });

            rects.exit().remove();
        }

        function renderTooltipElement() {
            tooltipElement = container
                .style('position', 'relative')
                .selectAll('.vt-tooltip').data([1]);

            tooltipElement.enter().append('div')
                .attr('class', 'vt-tooltip')
                .style({
                    'opacity': 0,
                    'top': plotTop + 'px',
                    'left': plotLeft + 'px'
                })
                .append('div')
                    .attr('class', 'number');
        }

        function renderTooltipLine() {
            tooltipLine = layer.selectAll('.vt-tooltip-line').data([1]);

            tooltipLine.enter().append('rect')
                .attr({
                    'class': 'vt-tooltip-line',
                    'opacity': 0,
                    'y': plotTop,
                    'height': plotHeight,
                    'width': 1
                });
        }
    }

    render.defaults = defaults;

    Contour.export('verticalTooltip', render);
};

var xAxisTextPositioning = function () {
    Contour.export('xAxisTextPositioning', function () {
        this.svg.selectAll('.x.axis text')
         .attr('dx', '-0.6em')
         .attr('dy', '3px')
         .style('text-anchor', 'end');
    });
};

var xAxisBackground = function () {
    Contour.export('xAxisBackground', function (data, layer, options) {
        var axis = this.svg.select('.x.axis');

        axis.selectAll('.axis-back')
            .data([null]).enter()
            .insert('rect', ':first-child')
                .attr('class', 'axis-back')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', options.chart.plotWidth - this.xScale(data[0].data[1].x) + this.xScale(data[0].data[0].x))
                .attr('height', options.xAxisBackground.height)
                .attr('class', 'x-axis-background');
    });
};

var percentLabel = function () {
    Contour.export('percentLabel', function (data, layer, options) {
        this.container.append('div')
            .attr('class', 'text percent-label')
            .style('left', options.chart.plotWidth + 'px')
            .style('top', options.chart.plotHeight + 'px')
            .text(options.percentLabel.text);
    });
};

var tailAxis = function () {
    Contour.export('tailAxis', function (data, layer, options) {
        var lastIndex = data[0].data.length - 1;
        if (data[0].data[lastIndex].hide) {
            lastIndex--;
        }
        var lastPoint = data[0].data[lastIndex];
        var maxY = _.max(data, function (d) {
            var d0 = d.data[lastIndex];
            return d0 && d0.y;
        }).data[lastIndex].y;
        var x = this.xScale(lastPoint.x);
        layer.append('line')
            .attr({
                'class': 'tail-axis',
                'x1': x,
                'x2': x,
                'y1': this.yScale(0),
                'y2': this.yScale(maxY)
            });
    });
};


function ContourApp() {
    this.initialize();
}

ContourApp.prototype = _.extend(BaseApp.prototype, {
    initialize: function () {
        this.initContourExpressions();
    },

    initContourExpressions: function () {
        verticalTooltip();
        xAxisTextPositioning();
        xAxisBackground();
        percentLabel();
        tailAxis();
    }
});

module.exports = ContourApp;

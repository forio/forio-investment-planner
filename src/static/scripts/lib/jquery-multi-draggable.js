(function ($) {
    'use strict';

    var totalWidth;
    var draggables;

    var addIcon = function ($item) {
        var $icon = $('<i>').addClass('dragger');
        $item.append($icon);

        return $icon;
    }

    var getNeigbor = function ($item, give) {
        var dr = draggables.get().reverse();
        var $next = $item.next();
        var $cash = $('.draggable').last();
        if (give || $cash.data('value')) {
            return $cash;
        } else {
            while ($next.data('variable') !== $cash.data('variable')) {
                if ($next.data('value')) {
                    return $next;
                }
                $next = $next.next();
            }
        }

        return $next;
    }

    var normalize = function  ($item, $neighbor, valueChange) {
        var newValue = $item.data('value') + valueChange;
        newValue = newValue < 0 ? 0 : newValue;
        var neighborValue = $neighbor.data('value');
        if (newValue < 0.001) {
            $neighbor.data('value', neighborValue + newValue);
            $item.data('value', 0);
        } else if (neighborValue - valueChange < 0) {
            $neighbor.data('value', 0);
        } else {
            $neighbor.data('value', neighborValue - valueChange);
            $item.data('value', newValue);
        }

        setWidth($item);
        setWidth($neighbor);
        $item.trigger('slideUpdate');
    };

    var setWidth = function ($item) {
        var width = +$item.data('value') * totalWidth;
        $item.width(width);
    };

    $.fn.multiDraggable = function () {

        var that = this;

        draggables = $('.draggable');

        var widthSet = _.after(this.length, function () {

            that.each( function (idx, item) {
                var $this = $(item)
                var $icon =  addIcon($this);

                var currentX;
                var minX;
                var $neighbor;
                var maxX;

                var setup = function (e, give) {
                    minX = $this.offset().left;

                    $neighbor = $(getNeigbor($this, give));
                    if (!$neighbor.data('value') && !give) {
                        $(document).off('mousemove');
                    }
                    console.log($neighbor.data('variable'));
                    maxX = $neighbor.width() + $this.offset().left + $this.width();
                    currentX = e.pageX;
                };

                $icon.on('mousedown', function (e) {

                    setup(e, false);

                    var valueChange;
                    $(document).on('mousemove', function (f) {
                        valueChange = (f.pageX - currentX) / totalWidth;
                        if (f.pageX < maxX && f.pageX > minX) {
                            valueChange = (f.pageX - currentX) / totalWidth;
                            currentX = f.pageX;
                            normalize($this, $neighbor, valueChange);
                        } else {
                            console.log('setup');
                            setup(f, valueChange < 0);
                        }
                    });

                    $(document).one('mouseup', function () {
                        $(document).off('mousemove');
                    });
                })

            })



        }, this);
        totalWidth = $('.bar-slider').parent().width() - 130;
        return this.each(function () {
            setWidth($(this));

            widthSet();
        });
    };

})(window.$);

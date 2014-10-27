(function ($) {
    'use strict';

    var totalWidth;

    var addIcon = function ($item) {
        var $icon = $('<i>').addClass('ss-pause ss-standard');
        $item.append($icon);

        return $icon;
    }

    var normalize = function  (newValue, newNeighborValue) {
        if (newValue < 0.0015) {
            newNeighborValue += newValue;
            newValue = 0;
        }
    }
    $.fn.multiDraggable = function () {

        var that = this;

        var widthSet = _.after(this.length, function () {

            that.each( function () {

                var $item = $(this);


                var $icon =  addIcon($item);

                var currentX;

                $icon.on('mousedown', function (e) {
                    var minX = $item.position().left;

                    var $neighbor = $item.next();
                    if ($neighbor.length) {
                        var maxX = $neighbor.width() + $neighbor.position().left;
                    }
                    currentX = e.pageX;

                    var newWidth;
                    var newValue;
                    var newNeighborValue;
                    var newNeighborWidth;
                    $(document).on('mousemove', function (e) {
                        if (e.pageX < maxX && e.pageX > minX) {
                            newWidth = e.pageX - minX;
                            $item.width(newWidth);
                            newNeighborWidth = maxX - e.pageX;
                            $neighbor.width(newNeighborWidth);
                            newValue = newWidth / totalWidth;
                            newNeighborValue = newNeighborWidth / totalWidth;
                            normalize(newValue, newNeighborValue);

                            $item.data('value', newValue);
                            $item.trigger('slideUpdate');
                            $neighbor.data('value', newNeighborValue);
                        } else {
                            console.log('out');
                        }
                    });

                    $(document).one('mouseup', function () {
                        $(document).off('mousemove');
                    });
                })

            })



        }, this);

        return this.each(function () {

            var $item = $(this);
            totalWidth = $item.parent().width();

            var width = +$item.data('value') * totalWidth;

            $item.width(width);

            widthSet();
        });


        //     var group = $input.data('group');

        //     var neighbors = $('[data-group="' + group + '"]');

        //     var calculateMax = function () {
        //         // calulate

        //         var max = _.max(neighbors, function (input) {
        //             return $(input).val();
        //         });

        //         max = $(max).val();

        //         _.each(neighbors, function (input) {
        //             var  percent = 100 * ($(input).val() / max);

        //             console.log(percent,max);

        //             $(this).data('percentage', percent);
        //         })
        //     };

        //     $input.on('change', function () {
        //         calculateMax();
        //     });
        // });
    };

})(window.$);

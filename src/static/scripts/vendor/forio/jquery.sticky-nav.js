(function ($, undefined) {

    $.fn.stickyNav = function () {
        var $nav = $(this);

        +$('.sub-nav').css('margin-top').replace('px','') + window.scrollY


        var originalMargin = +$nav.css('margin-top').replace('px','');

        var newMargin;

        window.on('scroll', function () {
            newMargin = originalMargin + window.scrollY;
            $nav.css('margin-top', newMargin);
        });

        return $nav;
    };

})(window.jQuery);
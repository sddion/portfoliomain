$(document).ready(function() {

    $('.skill').each(function() {
        var icon = $(this);
        var iconClasses = icon.attr('class');

        if (iconClasses.includes('html')) {
            var htmlText = $('.html').eq(1);

            icon.mouseover(function() {
                htmlText.css('visibility', 'visible');
            });
            icon.mouseout(function() {
                htmlText.css('visibility', 'hidden');
            });

        } else if (iconClasses.includes('css')) {
            var cssText = $('.css').eq(1);

            icon.mouseover(function() {
                cssText.css('visibility', 'visible');
            });
            icon.mouseout(function() {
                cssText.css('visibility', 'hidden');
            });

        } else if (iconClasses.includes('js')) {
            var jsText = $('.js').eq(1);

            icon.mouseover(function() {
                jsText.css('visibility', 'visible');
            });
            icon.mouseout(function() {
                jsText.css('visibility', 'hidden');
            });

        } else if (iconClasses.includes('react')) {
            var reactText = $('.react').eq(1);

            icon.mouseover(function() {
                reactText.css('visibility', 'visible');
            });
            icon.mouseout(function() {
                reactText.css('visibility', 'hidden');
            });

        } else if (iconClasses.includes('node')) {
            var nodeText = $('.node').eq(1);

            icon.mouseover(function() {
                nodeText.css('visibility', 'visible');
            });
            icon.mouseout(function() {
                nodeText.css('visibility', 'hidden');
            });

        } else if (iconClasses.includes('git')) {
            var gitText = $('.git').eq(1);

            icon.mouseover(function() {
                gitText.css('visibility', 'visible');
            });
            icon.mouseout(function() {
                gitText.css('visibility', 'hidden');
            });
        }
    });
});

/**
 *  Simple plugin to reload content for an element. Usage:
 *
 *  $("#categories-container").reloadFragment();
 *
 *  Note that the element must have an ID!
 *
 * @param {type} $
 * @returns {undefined}
 */
(function ($) {
    var DEFAULT = {
        url: null,
        selector: null,
        whenComplete: null
    };

    var methods = {
        init: function (options) {
            var id = this.attr("id");
            if (id === null || id === "") {
                $.error("[Reload fragment] WARN: couldn't load fragment because container does not have an id");
            } else {
                var config = $.extend({}, DEFAULT, options);

                var target = $(this);
                var selector = '#' + id;
                var url = window.location.pathname;

                if (config.url) {
                    url = config.url;
                }
                flog('[Reload fragment] Request url=', url);

                if (config.selector) {
                    selector = config.selector;
                }
                flog('[Reload fragment] Selector=', selector);

                $.get(url, {}, function (response, status, xhr) {
                    var newDom = $('<div />').html(response);
                    target.html(newDom.find(selector).html());

                    if (typeof config.whenComplete === 'function') {
                        config.whenComplete.call(target, response, status, xhr);
                    }
                    target.trigger("reloaded");
                });
            }
        },
        reload: function () {
            flog("[Reload fragment] reload", this);
        }
    };

    $.fn.reloadFragment = function (method) {
        flog("[Reload fragment]", this);
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('[Reload fragment] Method ' + method + ' does not exist on jQuery.subscribe');
        }
    };

})(jQuery);

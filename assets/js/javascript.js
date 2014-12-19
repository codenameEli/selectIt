/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */


// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global
    // variable in ECMAScript 3 and is mutable (i.e. it can
    // be changed by someone else). undefined isn't really
    // being passed in so we can ensure that its value is
    // truly undefined. In ES5, undefined can no longer be
    // modified.

    // window and document are passed through as local
    // variables rather than as globals, because this (slightly)
    // quickens the resolution process and can be more
    // efficiently minified (especially when both are
    // regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'selectIt',
        defaults = {
            selectedOption: '',
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        // jQuery has an extend method that merges the
        // contents of two or more objects, storing the
        // result in the first object. The first object
        // is generally empty because we don't want to alter
        // the default options for future instances of the plugin
        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }


    function appendElements(el, options) {

        var option = options;

        $(el).each(function(){

            var options = $(el).find('option'),
                element = '<span class="select-it-label" data-value="this">SELECTIT</span>';
                element += '<ul class="select-it-options-container">';

            $(options).each(function(){

                var value = $(this).val();

                element += '<li class="select-it-option" data-value="' + value + '">' + value + '</li>';
            });
            element += '</ul>';


            $(this).parent('.select-it-container').append(element);
        });
    }

    function setSelectedOption(el, options) {

        return options.selectedOption = $(el).find('option:selected')[0];
    }

    function wrapSelectElement(el) {

        return $(el).wrap('<div class="select-it-container"></div>');
    }

    function eventListeners(el, options) {

        $('.select-it-container').on('click', function(){

            var $selectIt = $(this),
                label = $(this).find('.select-it-label'),
                $optionsContainer = $selectIt.parent().find('.select-it-options-container');

                console.log($selectIt);
            // Activate class for state
            $selectIt.toggleClass('select-it-active');

            $('.select-it-option').on('click', function(){

                var value = $(this).data('value');

                label.text(value);
                // $selectIt.removeClass('select-it-active');
            });


        });
    }

    Plugin.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and
        // the options via the instance, e.g. this.element
        // and this.options

        // var $selectEl =/ $('select');
        wrapSelectElement(this.element);
        appendElements(this.element, this.options);
        setSelectedOption(this.element, this.options);
        eventListeners(this.element, this.options);
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        // return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new Plugin( this, options ));
            }
        // });
    }

})( jQuery, window, document );

$('select').selectIt();
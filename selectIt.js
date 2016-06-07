// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

    "use strict";

        var pluginName = "selectIt",
            defaults = {
                _createdDropdownElement: false,
                label: '',
                options: [],
                classes: {
                    option: 'option',
                    container: 'st-select-container',
                    dropdownOpened: 'select-it-dropdown-opened',
                    activeOption: 'active-option'
                },
                elementAttributes: {},
                onChange: function(){},
                beforeInit: function(){},
                afterInit: function(){},
                beforeCreateOptions: function(){},
                afterCreateOptions: function(){},
                beforeCreateOption: function(){},
                afterCreateOption: function(){},
            };

        function Plugin( element, options, id )
        {
            this.id = id;
            this.element = element;
            this.settings = $.extend( {}, defaults, options );
            this._defaults = defaults;
            this._name = pluginName;

            if ( this.element.nodeName == 'SELECT' ) {
                this.settings.beforeInit();
                this.init();
                this.settings.afterInit();
            }
        }

        $.extend( Plugin.prototype, {

            init: function()
            {
                this.settings.options = this.getOptions();

                this.hideSelect();
                this.getElementAttributes();
                this.setupSelectItElement();
                this.createDropdown();
                this.createBackdrop();
                this.attachListeners();
            },

            hideSelect: function()
            {
                $(this.element).hide();
            },

            getOptions: function()
            {
                var final = [];
                var elOptions = $(this.element).find('option');

                $(elOptions).each(function() {
                    final.push( $(this).val() );
                });

                return final;
            },

            getOptionsAttributes: function()
            {
                var self = this;
                var options = $(this.element).find('option');
                var final = [];

                $(options).each(function(i) {
                    final[i] = self.getAttributes(this);
                });

                return final;
            },

            getElementAttributes: function()
            {
                this.settings.elementAttributes.select = this.getAttributes(this.element);
                this.settings.elementAttributes.options = this.getOptionsAttributes();
            },

            getAttributes: function(el)
            {
                var self = this;
                var final = {};

                $(el).each(function() {
                    if ( this.attributes.length === 0 ) { return; }

                    $(this.attributes).each(function() {
                        final[this.nodeName] = this.nodeValue;
                    });
                });

                return final;
            },

            setupSelectItElement: function()
            {
                var label = this.settings.label.length === 0 ? this.settings.options[0] : this.settings.label;
                var dropdownContainer = '';
                dropdownContainer += '<div class="dropdown-container">';
                    dropdownContainer += '<label>' + label + '</label>';
                    dropdownContainer += '<span class="dropdown-icon"></span>';
                dropdownContainer += '</div>';

                $(this.element).wrap('<div id="select_it_' + this.id + '"class="' +  this.settings.classes.container + '"></div>');
                $(this.element).before(dropdownContainer);

                this.$selectItElement = $('select_it_' + this.id);
            },

            createOption: function(opt, i)
            {
                var option = '';
                var attributes = this.settings.elementAttributes.options[i];

                if ( typeof this.settings.beforeCreateOption === 'function' ) {
                    this.settings.beforeCreateOption(attributes, opt, i);
                }

                var keys = Object.keys(attributes);

                option += '<div';

                if ( attributes.hasOwnProperty('class') === false ) {
                    option += ' class="' + this.settings.classes.option + '"';
                }
                for ( i=0; i < keys.length; i++ ) {
                    var key = keys[i];

                    option += ' ';
                    option += key;
                    option += '="';

                    if ( key === 'class' ) {
                        option += this.settings.classes.option;
                        option += ' ';
                    }

                    option += attributes[key];
                    option += '"';
                }

                option += '>';
                option += opt;
                option += '</div>';

                this.settings.afterCreateOption(attributes, opt, i);

                return option;
            },

            createDropdown: function()
            {
                var $element = $('#select_it_' + this.id);
                var dropdown = '';
                var options = this.getOptions();
                var self = this;

                dropdown += '<div id="select_it_dropdown_' + this.id + '" class="options-container">';

                this.settings.beforeCreateOptions(this);

                $(options).each(function(i) {
                    dropdown += self.createOption(this, i);
                });

                this.settings.afterCreateOptions(this);

                dropdown += '</div>';

                $('body').append(dropdown);

                this.$dropdownElement = $(dropdown);
                this.settings._createdDropdownElement = true;
            },

            createBackdrop: function()
            {
                var $backdrop = $('#selectItBackdrop');

                if ( $backdrop.length === 0 ) {
                    $('body').append('<div id="selectItBackdrop" class="select-it-backdrop"></div>');
                    this.$backdropElement = $backdrop;
                }
            },

            openBackdrop: function()
            {
                var $backdrop = $('#selectItBackdrop');

                $('body').addClass('select-it-lock');
                $backdrop.addClass('select-it-backdrop-opened');
            },

            closeBackdrop: function()
            {
                var $backdrop = $('#selectItBackdrop');

                $('body').removeClass('select-it-lock');
                $backdrop.removeClass('select-it-backdrop-opened');
            },

            getDropdownElement: function()
            {
                return $('#select_it_dropdown_' + this.id);
            },

            getActiveOption: function()
            {
                var options = this.getDropdownElement();
                var element = $(options).find('.' + this.settings.classes.activeOption);

                return element;
            },

            offsetDropdownContainer: function($element) {
                var $container = $element.find('.dropdown-container');
                var $dropdown = $('#select_it_dropdown_' + this.id);
                var offset = $container[0].getBoundingClientRect();

                $dropdown.css('top', offset.top);
                $dropdown.css('left', offset.left);
            },

            openDropdown: function($element)
            {
                this.offsetDropdownContainer($element);

                $('.select-it-container').removeClass(this.settings.classes.dropdownOpened);
                $('#select_it_dropdown_' + this.id).addClass('select-it-opened');
                $('#select_it_dropdown_' + this.id).show();
            },

            closeDropdown: function(element)
            {
                $('.select-it-container').removeClass(this.settings.classes.dropdownOpened);
                $('#select_it_dropdown_' + this.id).removeClass('select-it-opened');
                $('#select_it_dropdown_' + this.id).hide();
            },

            setActiveLabel: function(element)
            {
                var label = $('#select_it_' + this.id).find('label');

                label.text( $(element).text() );
            },

            syncSelectElement: function(element)
            {
                var select = $('#select_it_' + this.id).find('select');

                $(select).val( $(element).text() );
            },

            close: function()
            {
                this.closeBackdrop();
                this.closeDropdown();
            },

            setActiveOption: function(element, $container)
            {
                var options = $container.find('.option');

                $(options).removeClass(this.settings.classes.activeOption);
                $(element).addClass(this.settings.classes.activeOption);
            },

            attachListeners: function()
            {
                var self = this;
                var $element = $('#select_it_' + this.id);
                var $dropdown = $('#select_it_dropdown_' + this.id);

                $element.on('click', '.dropdown-container', function() {

                    self.openBackdrop();
                    self.openDropdown($element);
                });

                $dropdown.on('click', '.option', function(ev) {
                    self.setActiveOption(this, $element);
                    self.setActiveLabel(this);
                    self.syncSelectElement(this);
                    self.close();

                    if ( typeof self.settings.onChange === 'function' ) {
                        self.settings.onChange(this, ev, self);
                    }
                });

                $('#selectItBackdrop').on('click', function() {
                    self.close();
                });
            },
        } );

        // A really lightweight plugin wrapper around the constructor,
        // preventing against multiple instantiations
        $.fn[ pluginName ] = function( options ) {
            var id = 0;

            return this.each( function() {
                if ( !$.data( this, "plugin_" + pluginName ) ) {
                    console.log(this, options, id);
                    $.data( this, "plugin_" +
                        pluginName, new Plugin( this, options, id ) );

                    id++;
                }
            } );
        };

} )( jQuery, window, document );
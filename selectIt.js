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
                actAsFilters: true,
                stateIcons: false,
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

                if ( this.settings.elementAttributes.select['data-default-label'] != null ) {
                    label = this.settings.elementAttributes.select['data-default-label'];
                }

                var dropdownContainer = '';
                dropdownContainer += '<div class="select-container">';
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

                if ( this.settings.elementAttributes.select['data-multiselect'] != null && this.settings.stateIcons === true ) {
                    option += '<span class="state-icon"></span>';
                }

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
                var $container = $element.find('.select-container');
                var $dropdown = $('#select_it_dropdown_' + this.id);
                var offset = $container[0].getBoundingClientRect();

                $dropdown.css('top', offset.top);
                $dropdown.css('left', offset.left);
            },

            openDropdown: function($element)
            {
                this.offsetDropdownContainer($element);

                $('.select-it-container').removeClass(this.settings.classes.dropdownOpened);
                $('#select_it_' + this.id).addClass('state-open');
                $('#select_it_dropdown_' + this.id).addClass('select-it-opened');
                $('#select_it_dropdown_' + this.id).show();
            },

            closeDropdown: function(element)
            {
                $('.select-it-container').removeClass(this.settings.classes.dropdownOpened);
                $('.st-select-container').removeClass('state-open');
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

            getUrlParams: function()
            {
                var final = {};
                var params = location.search;

                if ( params.length === 0 ) { return; }

                var chunked = params.split('?')[1].split('&');
                for ( i = 0; i < chunked.length; i++ ) {
                    var keyval = chunked[i].split('=');
                    var key = keyval[0];
                    var val = keyval[1];

                    if ( /,/.test(val) ) {
                        val = val.split(',');
                    }

                    final[key] = val;
                }

                return final;
            },

            flattenUrl: function(urlObj)
            {
                var url = '';
                var keys = Object.keys(urlObj);
                var sep = '&';

                for ( i = 0; i < keys.length; i++ ) {
                    url += i === 0 ? '?' : sep;
                    url += keys[i];
                    url += '=';
                    url += urlObj[keys[i]].toString();
                }

                return url;
            },

            setUrlParams: function(key, val, selected)
            {
                var params = this.getUrlParams();

                if ( selected == 'true'  ) { // Remove from the URL
                    if ( params[key] == val ) { // is there any else is the URL?
                        delete params[key];
                    } else { // Just remove it
                        params[key].splice( params[key].indexOf(val), 1 );
                    }
                } else {
                    // does it exists in the URL yet?
                    if ( params == null ) { // NO
                        window.location.search = '?' + key + '=' + val;
                        return;
                    }

                    if ( params[key] == null ) {
                        params[key] = val;
                    } else {

                        if ( params[key] instanceof Array === false ) { // Make sure that its an array
                            params[key] = [params[key]];
                        }

                        if ( params[key].indexOf(val) === -1 ) {
                            params[key].push(val);
                        } else {
                            params[key].splice( params[key].indexOf(val), 1 );
                        }
                    }

                }

                window.location.search = this.flattenUrl(params);
            },

            changeTheUrl: function(el)
            {
                var key = el.getAttribute('data-param-key');
                var val = el.getAttribute('data-param-value');
                var selected = el.getAttribute('selected');

                if ( key == null || val == null ) { return; }

                this.setUrlParams(key, val, selected);
            },

            attachListeners: function()
            {
                var self = this;
                var $element = $('#select_it_' + this.id);
                var $dropdown = $('#select_it_dropdown_' + this.id);

                $element.on('click', '.select-container', function() {

                    self.openBackdrop();
                    self.openDropdown($element);
                });

                $dropdown.on('click', '.option', function(ev) {
                    self.setActiveOption(this, $element);

                    if ( self.settings.elementAttributes.select['data-default-label'] == null ) {
                        self.setActiveLabel(this);
                    }

                    self.syncSelectElement(this);
                    self.close();

                    if ( typeof self.settings.onChange === 'function' ) {
                        self.settings.onChange(this, ev, self);
                    }

                    if ( self.settings.actAsFilters == true ) {
                        self.changeTheUrl(this, ev, self);
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
                    $.data( this, "plugin_" +
                        pluginName, new Plugin( this, options, id ) );

                    id++;
                }
            } );
        };

} )( jQuery, window, document );

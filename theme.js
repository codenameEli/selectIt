jQuery(document).ready(function($) {

	$('html').removeClass('no-js');

	//Search Container
	$('.search-container').children('button').focus(function(){
		$(this).parent().children('form').slideToggle();
	});

	//Nav Scroll
	$(window).scroll(function() {
		var $mainNav = $("header.site-header");
		var stateClass = "main-nav-scrolled";

		if( $(this).scrollTop() > 60 ) {
			$mainNav.addClass(stateClass);
		} else {
			$mainNav.removeClass(stateClass);
		}
	});

	//fancybox
	// $(".various").fancybox();

	//Accordion
	$('.st-accordion').children('button').focus(function(){
		$('.active-button').removeClass('active-button');
		$(this).toggleClass('active-button');
		$('.active-accordion').removeClass('active-accordion');
		$(this).next('div').toggleClass('active-accordion');
	});

	//Owl Carousel
	$('.owl-carousel').owlCarousel({
		loop: true,
		margin:10,
		items:3,
		autoPlay: 4000,
		center: true,
		nav:false
	});

	//Location
	$('.location-carousel').owlCarousel({
		loop: true,
		margin:0,
		items:1,
		navigation: true,
		navigationText: [
		"<span class='navigation-button nav-left'></span>",
		"<span class='navigation-button nav-right'></span>"
		],
		autoplay: true
	});

	$('.accordion-tabs-minimal').each(function(index) {
		$(this).children('li').first().children('a').addClass('is-active').next().addClass('is-open').show();
	});
	$('.accordion-tabs-minimal').on('click', 'li > a.tab-link', function(event) {
		if (!$(this).hasClass('is-active')) {
			event.preventDefault();
			var accordionTabs = $(this).closest('.accordion-tabs-minimal');
			accordionTabs.find('.is-open').removeClass('is-open').hide();

			$(this).next().toggleClass('is-open').toggle();
			accordionTabs.find('.is-active').removeClass('is-active');
			$(this).addClass('is-active');
		} else {
			event.preventDefault();
		}
	});

    function getUrlParams()
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
    }

    function flattenUrl(urlObj)
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
    }

	function setURLParam(key, val)
    {
        var params = getUrlParams();

        if ( params[key] instanceof Array === false ) {
            params[key] = [params[key]];
        }

        if ( params[key].indexOf(val) === -1 ) {
            params[key].push(val);
        } else {
            params[key].splice( params[key].indexOf(val), 1 );
        }

        window.location = flattenUrl(params);
    }

	function changeTheUrl(el)
	{
        var key = el.getAttribute('data-param-key');
        var val = el.getAttribute('data-param-value');

        if ( key == null || val == null ) { return; }

        setURLParam(key, val);
	}

    function setSelectedOptions(attributes)
    {
        var params = getUrlParams();

        if ( params == null ) { return; }

        var key = attributes['data-param-key'];
        var set = params[key];

        if ( set == null ) { return; }

        if ( set.indexOf( attributes['data-param-value'] ) !== -1 ) {
            attributes['selected'] = true;
        }

        return attributes;
    }

    $('select').selectIt({
        onChange: changeTheUrl,
        beforeCreateOption: setSelectedOptions
    });
    
	function openFancyBoxForRestData(data) {
		$.fancybox.open({
			content: data,
			autoSize: false,
			width: 1200,
			maxWidth: 1200
		});
	}

	function addClassForFailRestResponse(response) {
		console.log('addClassForFailRestResponse this = ', this);
		alert('Link Error');
	}

	$('.rest-ajax').wpRestAjax({
		onSuccess: openFancyBoxForRestData,
		onFailure: addClassForFailRestResponse,
		filterTo: '.content'
	});
});
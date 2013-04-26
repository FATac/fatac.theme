NAVIGATING = false
WIN_POS = 0
WRAPPER_POS = 0
    // Returns the current selected page index based on selected thumb

    function getCurrentIndex() {
        return $('.thumb.selected').index()
    }


    // Returns the actual thumb size, with margin

    function thsize() {
        return $('.thumb').width() + 10
    }


    // Returns how many full thumbs are allowed on the footer section

    function getMaxThumbs() {
        return Math.floor($('#thumbs').width() / thsize())
    }


    // Returns the window position relative to the left of the thumbs section

    function getThumbWinPos(win) {
        return Math.floor(win.position().left / thsize())

    }

    function getBook() {
        return $('#book')[0].bookdata
    }

    function getCurrentPage() {
        return getBook().pages[getCurrentIndex()]
    }

    // Gets the corresponding page index by the click on posbar

    function getSelectedByPosbarClickPosition(x) {

            var posbar_margin = 5
            var slider_width = 30
            var numpages = getBook().pages.length -1
            var $posbar = $('.posbar')
            var $slider = $('.slider')
            var effective_posbar_width = $posbar.width() - (posbar_margin * 2) - slider_width
            var slider_step_width = Math.floor(effective_posbar_width / (numpages - 1))

            var position = x - $posbar.offset().left
            var index = Math.floor( position / slider_step_width )

            return index
    }


    // Gets the corresponding page index by the slider position

    function getSelectedBySliderPosition() {
            var posbar_margin = 15
            var slider_width = 30
            var numpages = getBook().pages.length -1
            var $posbar = $('.posbar')
            var $slider = $('.slider')
            var effective_posbar_width = $posbar.width() - (posbar_margin * 2) - slider_width
            var slider_step_width = Math.floor(effective_posbar_width / (numpages - 1))

            var position = $slider.position().left + (slider_width / 2) - posbar_margin
            var index = Math.floor( position / slider_step_width )

            return index
    }


    // Sets the slider in the posbar to a position relative to the total images

    function setSliderPosition(index) {
        var posbar_margin = 15
        var slider_width = 30
        var numpages = getBook().pages.length -1
        var $posbar = $('.posbar')
        var $slider = $('.slider')
        var effective_posbar_width = $posbar.width() - (posbar_margin * 2) - slider_width
        var slider_step_width = Math.floor(effective_posbar_width / (numpages - 1))
        var position = (index * slider_step_width) + posbar_margin - (slider_width / 2)
        $slider.css({left:position})
    }

    // Determines where to move the selected window and thumb wrapper by the page index
    // and toogles the selected status

    function setWinAndWrapperPosition(index) {

        var $current_selected = $('#book #thumbs .thumb.selected')
        var $win = $('#book #thumbs .window')
        var $next_selected = $($('#thumbs .thumb')[index])
        var distance = index - $current_selected.index()
        var max_window_position = getMaxThumbs() - 1

        // calculate next window position
        var win_new_pos = getThumbWinPos($win) + distance


        // We are moving the select window within the actual visible thumbs
        // We don't have to move the wrapper
        if (win_new_pos == 0) {}
            var move_wrapper = 0

        // We are moving the selected window to a thumb hidden at the right side
        // So we have to move the wrapper to the left as many thumbs as needed
        if (win_new_pos > max_window_position) {
            var move_wrapper = max_window_position - win_new_pos
            win_new_pos = max_window_position
        }

        // We are moving the selected window to a thumb hidden at the left side
        // So we have to move the wrapper to the right as many thumbs as needed

        if (win_new_pos < 0) {
            var move_wrapper = 0 - win_new_pos
            win_new_pos = 0
        }

        // The window has to be moved, so move it!
        if (win_new_pos!=getThumbWinPos($win)) {
            NAVIGATING = true
            $win.animate({left:thsize() * win_new_pos}, 300, function(event) {
                WIN_POS = win_new_pos
                NAVIGATING = false
            })
        }

        // The wrapper position has to be moved, so move it!
        if (move_wrapper!=0) {
            NAVIGATING = true
            var $wrapper = $win.siblings('.wrapper')
            var wrapper_position = parseInt($wrapper.css('margin-left'))
            mleft = wrapper_position + (move_wrapper * thsize())
            $wrapper.animate({'margin-left': mleft}, 300, function(event) {
                WRAPPER_POS = Math.floor(mleft / thsize())
                NAVIGATING = false
            })

        }

        $current_selected.toggleClass('selected')
        $next_selected.toggleClass('selected')


    }

    // Returns the window position relative to the first thumb in list, even if it's hidden

    function getRealWinIndex(index, wrapper) {
        return index + Math.floor(parseInt(wrapper.css('margin-left'))/ thsize())
    }


    // Renders a page sidebar item collection by type,

    function renderItems(itemType, index) {
        var templates = fatbooks.templates()
        var data = getBook().pages[index]
        var itemlower = itemType.toLowerCase()
        var new_html = ''
        for (i=0;i<data[itemlower].length;i++){
            new_html += templates[itemlower].render(data[itemlower][i])
        }
        extra = arguments.length>2 ? ' '+arguments[2] : ''
        $('#collapse' + itemType + ' .accordion-inner' + extra).html(new_html)
        $('#collapse' + itemType).siblings('.accordion-heading').find('.count').text(data[itemlower].length)

    }

    // Render thumbnails section

    function renderThumbs() {

        var templates = fatbooks.templates()
        var data = getBook()

        thumbs = ''
        for (i=0;i<data.pages.length;i++){
            params = {'selected': i==0 ? 'selected' : ''}
            thumbs += templates.thumb.render($.extend(data.pages[i], params))
        }
        $('#thumbs .wrapper').html(thumbs)
    }


    // Resize thumbnails and selection window, recenter navigation arrows

    function resizeThumbsAndWindow() {
        $('#thumbs .thumb').each(function(index, element) {
            var $thumbs = $('#thumbs')
            var $thumbsparent = $('footer .span12')
            var $win = $thumbs.find('.window')
            var $thumbs = $('#thumbs')
            var $wrapper = $thumbs.find('.wrapper')
            var $element = $(element)
            var $image = $element.find('img')
            var thumbsize = $thumbs.height() - 50

            // Set a callback to calculate margins on image load
            $image.imagesLoaded( function( $images, $proper, $broken ) {
            // calculate margins when images fully loaded
                $.each($images, function(index, image) {
                    var image_css = {}
                    var $img = $(image)
                    if ($img.height() > $img.width()) {
                        var percent = Math.floor(( 100 * (($img.height() - $img.width()) / 2)) / $img.height() )
                        image_css['margin-top'] = '-' + parseInt(percent, 10) + '%'
                        $image.css(image_css)
                    }

                    if ($img.width() > $img.height()) {
                        var percent = Math.floor(( 100 * (($img.width() - $img.height()) / 2)) / $img.width() )
                        element_css['margin-left'] = '-' + parseInt(percent, 10) + '%'
                        $image.css(image_css)
                    }
                    $img.addClass('loaded')
                })

            });

            var thumbswidth = Math.floor(  ($thumbsparent.width()-80) / (thumbsize+ 10)  )  * (thumbsize +10)
            var margin = Math.floor( ($thumbsparent.width() - thumbswidth) / 2) - 12
            $('#prev').width(margin)
            $('#next').width(margin - 4)

            var element_css = {width: thumbsize, height: thumbsize}

            $thumbs.css({width:thumbswidth})
            $element.css(element_css)
            $win.css({width: thumbsize + 4, height: thumbsize + 4})

            // Reposition wrapper and window for new thumb_size
            // check index to do it only the first time
            // we have to do it inside the "each" because we need the new thumb size

            if (index==0) {
                if (WIN_POS >= getMaxThumbs()) {
                    WRAPPER_POS = WRAPPER_POS + (getMaxThumbs() - WIN_POS - 1)
                    WIN_POS = getMaxThumbs() -1
                }
                $win.css({'left':thsize() * WIN_POS})
                $wrapper.css({'margin-left': WRAPPER_POS * thsize()})
            }
        })
    }

    // Restrict accordion bodies height to adapt to full sidebar height

    function resizeSidebarSections() {
        var allowed_height = $('#sidebar').height() - (($('.accordion-heading').height()+4) * 3)
        $('.accordion-body').each(function (index, element) {
            $(element).css({'max-height': allowed_height})
        })

    }

    // Loads the JSON data of the book and calls the specified callback afterwards

    function getData(callback) {
        $.get('jsonLlibre', function(data) {
            //$('#book')[0].bookdata = data
            $('#book')[0].bookdata = BOOK_DATA
            callback.call()
        })
    }

    // Loads the information of a Book page into the UI

    function setPageData(index) {
        var image_url = getBook().pages[index].image
        $img = $('#main img')
        $img.attr('src', image_url)
        $img.fadeOut(500, function() {
            $img.fadeIn(500);
        });

        var templates = fatbooks.templates()
        var data = getBook()

        renderItems('Details', index)
        $('.detail img').each(function(index, image) {
            var $image = $(image)
            $image.imagesLoaded( function( $images, $proper, $broken ) {
                // calculate margins
                $.each($images, function(index, image) {
                    var $im = $(image)
                    $im.addClass('loaded')
                })

            })
        })
        renderItems('Notes', index)
        renderItems('Comments', index)
        setSliderPosition(index)
    }

// Initialize UI when ready

$(document).ready(function(event) {

    // Set fullscreen toggle to header button

    $('button#fullscreen').click(function() {
            screenfull.toggle();
    })

    // Dummy information

    BOOK_DATA = {
        'title': 'Las aventuras de Mortadelu i Filemon',
        'author': 'Francisco Ibañez',
        'url': 'http://foo/bar',
        'pages': [
            {
                'title': 'Pagina1',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/1400/cats/1',
                'proportion': 'square',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/1000/1000/cats/2'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/3'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina2',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/2',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/3'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/4'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina3',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/400/500/cats/3',
                'proportion': 'vertical',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/4'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/5'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina4',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/4',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/5'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/6'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina5',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/5',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/6'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/7'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina6',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/6',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/7'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/8'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina7',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/7',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/8'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/9'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina8',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/8',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/9'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/10'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },
            {
                'title': 'Pagina1',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/1400/cats/1',
                'proportion': 'square',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/2'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/3'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina2',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/2',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/3'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/4'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina3',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/700/1400/cats/3',
                'proportion': 'vertical',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/4'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/5'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina4',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/4',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/5'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/6'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina5',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/5',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/6'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/7'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina6',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/6',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/7'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/8'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina7',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/7',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/8'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/9'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina8',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/8',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/9'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/10'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },
            {
                'title': 'Pagina1',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/1400/cats/1',
                'proportion': 'square',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/2'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/3'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina2',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/2',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/3'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/4'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina3',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/700/1400/cats/3',
                'proportion': 'vertical',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/4'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/5'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina4',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/4',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/5'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/6'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina5',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/5',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/6'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/7'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina6',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/6',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/7'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/8'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina7',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/7',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/8'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/9'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            },

            {
                'title': 'Pagina8',
                'url': 'http://lapagina',
                'image': 'http://lorempixel.com/1400/700/cats/8',
                'proportion': 'horizontal',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/cats/9'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/cats/10'
                    }
                ],
                'notes': [
                    {
                        'title': 'Nota1',
                        'text': "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
                    },
                    {
                        'title': 'Nota1',
                        'text': "Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends."
                    }
                ],
                'comments': [
                    {
                        'title': 'Nota1',
                        'text': "No man, I don't eat pork",
                        'author': 'Samuel'
                    },
                    {
                        'title': 'Nota1',
                        'text': "I gotta piss",
                        'author': 'John Travolta'
                    }
                ]
            }




        ]
    }

    // End Dummy data

    // Get de data and initialize UI

    getData(function(event, data) {
        $('header h1').text(getBook()['title'] + ', ')
        $('header .author').text(getBook()['author'])
        resizeSidebarSections()
        renderThumbs()
        resizeThumbsAndWindow()
        setPageData(0)
    })

    // Update UI size and positions on resizing

    $(window).resize(function(event) {
        resizeThumbsAndWindow()
        resizeSidebarSections()
    })


    // Make sidebar sections scrollable vertically

    $('.accordion-body').mousewheel(function(event, delta, deltaX, deltaY) {
        if (deltaY) {
            var $current = $(event.currentTarget)
            var $target = $current.find('.accordion-inner')

            var newpos = parseInt($target.css('margin-top')) - (20*deltaY*-1)
            var maxscroll = $current.height() - $target.height()
            if (maxscroll < 0) {
                if (newpos > 0) newpos = 0
                if (newpos < maxscroll) newpos = maxscroll

                $target.css({'margin-top': newpos})
            }
        }
    });


    // Add comment interface showup handler

    $('#comments button').click(function(event) {
        event.stopPropagation()
        event.stopImmediatePropagation()
        event.preventDefault()
        $('#commentsModal').modal({})
    })


    // Add comment modal close handler

    $('#commentsModal #close.btn').click(function(event) {
      $('#commentsModal').modal('hide')
    })


    // Add comment modal post handler

    $('#commentsModal #send.btn-success').click(function(event) {
        payload = {
            "form.widgets.in_reply_to": "",
            "form.widgets.author_name": "",
            "form.widgets.author_email": "",
            "form.widgets.text" : $('#commentsModal textarea').val(),
            "form.widgets.user_notification:list": "selected",
            "form.buttons.comment": "Comment"
        }
        $.post(getCurrentPage().url + '/@@view', payload, function(data) {
            $('#commentsModal').modal('hide')
            getData(function(event) {
                renderItems('Details', getCurrentIndex())
            })
        })
    })


    // Move window pointer to previous .thumb

    $('#book #prev').click(function(event) {
        if (!NAVIGATING) {
            NAVIGATING = true
            var $selected = $('#book #thumbs .thumb.selected')
            var $win = $('#book #thumbs .window')
            var $prev = $selected.prev()
            var index = $prev.index()
            if (index >= 0) {
                setWinAndWrapperPosition(index)
                setPageData(index)
            }
        }
        else {
            console.log('Keep calm and read books')
        }
    });


    // Move window pointer to next .thumb

    $('#book #next').click(function(event) {
        if (!NAVIGATING) {
            NAVIGATING = true
            var $selected = $('#book #thumbs .thumb.selected')
            var $win = $('#book #thumbs .window')
            var $next = $selected.next()
            var index = $next.index()
            var nthumbs = $('#book #thumbs .thumb').length
            if (index < nthumbs && index > 0) {
                setWinAndWrapperPosition(index)
                setPageData(index)
            }
        }
        else {
            console.log('Keep calm and read books')
        }

    });


    // Move window pointer to clicked .thumb

    $('#thumbs').on('click', '.thumb img', function(event) {
        if (!NAVIGATING) {
            NAVIGATING = true
            $target = $(event.currentTarget).closest('.thumb')
            var index = $target.index()
            setWinAndWrapperPosition(index)
            setPageData(index)
        }
        else {
            console.log('Keep calm and read books')
        }
    });


    // Move window pointer to corresponding .thumb relative to clicked slider position

    $('.posbar').click(function(event) {

            var index = getSelectedByPosbarClickPosition(event.pageX)
            setWinAndWrapperPosition(index)
            setPageData(index)
    })

    $('.slider').draggable({
        containment: "parent",
        axis: 'x',
        stop: function(event, ui) {
            var newindex = getSelectedBySliderPosition()
            setWinAndWrapperPosition(newindex)
            setPageData(newindex)
        },
        drag: function(event, ui) {
            var data = getBook().pages
            dragindex = getSelectedBySliderPosition()
            $('.slider .tag').text(dragindex + 1)
        }
    });

    // Reset image position after mouse leaves #main img

    $('#book #main').on('mouseout', function(event) {
        var $img = $(event.currentTarget).find('img')
        $img.css({'margin-left': 0, 'margin-top': 0})

    });


    // Move Full scale image when hovering on #main img

    $('#book #main img').on('mousemove', function(event) {
        var $img = $(event.currentTarget)
        var $main = $img.closest('#main')


        var pos = $main.position()

        var width = $main.width()
        var height = $main.height()

        var img_width = $img.width()
        var img_height = $img.height()

        if (img_width > width || img_height > height) {
            var hidden_x = img_width - width
            var hidden_y = img_height - height

            var mousex = event.pageX - pos['left']
            var mousey = event.pageY - pos['top']

            var scroll_x = (mousex / width) * hidden_x * -1
            var scroll_y = (mousey / height) * hidden_y * -1

            movement = {}
            if (img_width > width) movement['margin-left'] = scroll_x
            if (img_height > height) movement['margin-top'] = scroll_y

            $img.css(movement)
        }

    });

    $('#book #sidebar').on('.detail img').click(function(event) {
        event.stopPropagation()
        event.stopImmediatePropagation()
        var $detail_image = $(event.target)
        var $detail = $detail_image.closest('.detail')
        var $img = $('#main img')
        $detail.toggleClass('viewing')
        var go_view_detail = $detail.hasClass('viewing')
        if (go_view_detail) {
            $('#book #sidebar .detail.viewing').each(function(idx, element) {
                $element = $(element)
                $element.removeClass('viewing')
            })
            $detail.addClass('viewing')
        }


        var url = go_view_detail ? $detail_image.attr('src') : getCurrentPage().image
        $img.attr('src', url)

        $img.fadeOut(200, function() {
            $img.fadeIn(200);
        });
    })

});
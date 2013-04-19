// document.getElementById('button').addEventListener('click', function() {

//         console.log('full')
//         screenfull.request();

// })


    function thsize() {
        return $('.thumb').width() + 10
    }

    function getMaxThumbs() {
        return Math.floor($('#thumbs').width() / thsize())
    }

    function getThumbWinPos(win) {
        return Math.floor(win.position().left / thsize())

    }

    function getRealWinIndex(index, wrapper) {
        return index + Math.floor(parseInt(wrapper.css('margin-left'))/ thsize())
    }

    function renderItems(itemType, index) {
        var templates = fatbooks.templates()
        var data = $('#book')[0].bookdata.pages[index]
        var itemlower = itemType.toLowerCase()
        var new_html = ''
        for (i=0;i<data[itemlower].length;i++){
            new_html += templates[itemlower].render(data[itemlower][i])
        }
        extra = arguments.length>2 ? ' '+arguments[2] : ''
        $('#collapse' + itemType + ' .accordion-inner' + extra).html(new_html)

    }

    function resizeThumbsAndWindow() {
        $('#thumbs .thumb').each(function(index, element) {
            $thumbs = $('#thumbs')
            $win = $thumbs.find('.window')
            $thumbs = $('#thumbs')
            $element = $(element)
            $element.css({width: $thumbs.height() - 22, height: $thumbs.height() - 22})
            $win.css({width: $thumbs.height() - 18, height: $thumbs.height() - 18})
        })
    }

    function setPageData(index) {
        var image_url = $('#book')[0].bookdata.pages[index].image
        $('#main img').attr('src', image_url)

        var templates = fatbooks.templates()
        var data = $('#book')[0].bookdata

        renderItems('Details', index)
        renderItems('Notes', index)
        renderItems('Comments', index)

        // // Render Detalls
        // var detalls = ''
        // for (i=0;i<data.pages.length;i++){
        //     detalls += templates.detall.render(data.pages[i].detalls)
        // }
        // $('#collapseDetalls .accordion-inner').html(detalls)

        // // Render Detalls
        // var detalls = ''
        // for (i=0;i<data.pages.length;i++){
        //     detalls += templates.detall.render(data.pages[i].detalls)
        // }
        // $('#collapseDetalls .accordion-inner').html(detalls)


    }

$(document).ready(function(event) {


    // Get Information

    $('#book')[0].bookdata = {
        'title': 'Las aventuras de Mortadelo i Filemon',
        'author': 'Francisco Ibañez',
        'url': 'http://foo/bar',
        'pages': [
            {
                'title': 'Pagina1',
                'image': 'http://lorempixel.com/1400/1400/abstract/1',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/abstract/2'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/abstract/3'
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
                'image': 'http://lorempixel.com/1400/1400/abstract/2',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/abstract/3'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/abstract/4'
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
                'image': 'http://lorempixel.com/1400/1400/abstract/3',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/abstract/4'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/abstract/5'
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
                'image': 'http://lorempixel.com/1400/1400/abstract/4',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/abstract/5'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/abstract/6'
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
                'image': 'http://lorempixel.com/1400/1400/abstract/5',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/abstract/6'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/abstract/7'
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
                'image': 'http://lorempixel.com/1400/1400/abstract/6',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/abstract/7'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/abstract/8'
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
                'image': 'http://lorempixel.com/1400/1400/abstract/7',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/abstract/8'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/abstract/9'
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
                'image': 'http://lorempixel.com/1400/1400/abstract/8',
                'details': [
                    {
                        'title': 'Detall1',
                        'url': 'http://lorempixel.com/300/300/abstract/9'
                    },
                    {
                        'title': 'Detall2',
                        'url': 'http://lorempixel.com/300/300/abstract/10'
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

    // End test json

    var templates = fatbooks.templates()
    var data = $('#book')[0].bookdata

    // Restrict accordion bodies height
    var allowed_height = $('#sidebar').height() - (($('.accordion-heading').height()+4) * 3)
    $('.accordion-body').each(function (index, element) {
        $(element).css({'max-height': allowed_height})
    })

    // Render thumbs
    thumbs = ''
    for (i=0;i<data.pages.length;i++){
        params = {'selected': i==0 ? 'selected' : ''}
        thumbs += templates.thumb.render($.extend(data.pages[i], params))
    }
    $('#thumbs .wrapper').html(thumbs)
    setPageData(0)
    resizeThumbsAndWindow()

    // Scroll sidebar sections

    $('.accordion-body').mousewheel(function(event, delta, deltaX, deltaY) {
        console.log(delta, deltaX, deltaY);
        if (deltaY) {
            var $current = $(event.currentTarget)
            var $target = $current.find('.accordion-inner')

            var newpos = parseInt($target.css('margin-top')) - (20*deltaY*-1)
            var maxscroll = $current.height() - $target.height()
            if (maxscroll < 0) {
                console.log(newpos+ ', '+maxscroll)
                if (newpos > 0) newpos = 0
                if (newpos < maxscroll) newpos = maxscroll

                $target.css({'margin-top': newpos})
            }

        }

    });


    // resize handler {
    $(window).resize(function(event) {
        resizeThumbsAndWindow()
    })


    // Add comment button handlers

    $('#comments button').click(function(event) {
        event.stopPropagation()
        event.stopImmediatePropagation()
        event.preventDefault()
        $('#commentsModal').modal({})
    })

    $('#commentsModal #close.btn').click(function(event) {
      $('#commentsModal').modal('hide')
    })

    $('#commentsModal #send.btn').click(function(event) {
        payload = {
            "form.widgets.in_reply_to": "",
            "form.widgets.author_name": "",
            "form.widgets.author_email": "",
            "form.widgets.text" : $('#commentsModal textarea').val(),
            "form.widgets.user_notification:list": "selected",
            "form.buttons.comment": "Comment"
        }

        $.post('@@view', payload, function(data) {
            $('#commentsModal').modal('hide')
        })

    })


    // Move window pointer to prev .thumb

    $('#book #prev').click(function(event) {
        var $selected = $('#book #thumbs .thumb.selected')
        var $win = $('#book #thumbs .window')
        var $prev = $selected.prev()
        var index = $prev.index()
        console.log('Prev Selected Thumb ' + index)
        if (index >= 0) {
            $selected.toggleClass('selected')
            $prev.toggleClass('selected')
            var winpos = getThumbWinPos($win)
            var maxpos = getMaxThumbs()
            console.log('Win position ' + winpos)
            console.log('Visible thumbs ' + maxpos)
            var $wrapper = $win.siblings('.wrapper')
            setPageData(index)
            if (winpos>=1) {
                $win.animate({left:thsize() * getRealWinIndex(index, $wrapper)}, 200)
            } else {
                mleft = thsize() * (index - winpos) * -1
                console.log(mleft)
                $wrapper.animate({'margin-left': mleft}, 200)
            }
        }

    });


    // Move window pointer to next .thumb

    $('#book #next').click(function(event) {
        var $selected = $('#book #thumbs .thumb.selected')
        var $win = $('#book #thumbs .window')
        var $next = $selected.next()
        var index = $next.index()
        console.log('Next Selected Thumb ' + index)
        var nthumbs = $('#book #thumbs .thumb').length
        if (index < nthumbs && index > 0) {
            $selected.toggleClass('selected')
            $next.toggleClass('selected')
            var winpos = getThumbWinPos($win)
            var maxpos = getMaxThumbs()
            console.log('Win position ' + winpos)
            console.log('Visible thumbs ' + maxpos)
            var $wrapper = $win.siblings('.wrapper')
            setPageData(index)
            if (winpos +1 < maxpos) {
                $win.animate({left:thsize() * getRealWinIndex(index, $wrapper)}, 200)
            } else {
                mleft = thsize() * (index - winpos) * -1
                console.log(mleft)
                $wrapper.animate({'margin-left': mleft}, 200)
            }


        }

    });


    // Move window pointer to clicked .thumb

    $('#thumbs').on('click', '.thumb img', function(event) {
        $target = $(event.currentTarget).closest('.thumb')
        var $selected = $('#book #thumbs .thumb.selected')
        var $win = $('#book #thumbs .window')
        var index = $target.index()
        var realindex = getRealWinIndex(index, $target.closest('.wrapper'))

        if (realindex < getMaxThumbs() ) {
            $selected.toggleClass('selected')
            $target.toggleClass('selected')

            $win.animate({left:thsize() * realindex}, 200)
            setPageData(index)
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

        var hidden_x = img_width - width
        var hidden_y = img_height - height


        var mousex = event.pageX - pos['left']
        var mousey = event.pageY - pos['top']

        var scroll_x = (mousex / width) * hidden_x * -1
        var scroll_y = (mousey / height) * hidden_y * -1

        $img.css({'margin-left': scroll_x, 'margin-top': scroll_y})
    });





});
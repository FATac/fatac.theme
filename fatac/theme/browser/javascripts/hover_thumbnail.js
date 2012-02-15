/**
* Per totes les imatges amb classe 'hoverable' fa que si es detecta la intenció de
* fer hover (jquery.hoverIntent.js) s'afegeixi a sota la imatge un altre div amb id
* wrapper_hover_ + 'id_objecte' i es posicioni on li indiquem segons el paràmetre
* 'position', que pot tenir els valors 'thumbnail_top_left', 'thumbnail_center' o
* 'centerOnScreen'.
* Si el paràmetre contingut és 'imatge_ampliada', el contingut del nou div serà la
* imatge ampliada. Si és 'crida', es cridarà la url 'url_crida' amb els paràmetres
* 'parametres_crida'
*
* @dependència: jquery, jquery.hoverIntent.js
*
* @prerequisit: cal fixar la mida de wrapper_hover per css per tal que posicioni bé
*
* @param: position (['thumbnail_top_left', 'thumbnail_center'])
* @param: contingut (['imatge_ampliada', 'crida'])
* @param: url_crida (p.ex. 'demo.html' ó 'genericView')
* @param: parametres_crida (p.ex. {visualitzacio: 'hover_cerca'})
*
* INFO:
* Es poden afegir nous llocs de posicionament, extenent la funció reposicionar_hover.
*
* TODO:
* Cal tenir en compte que l'event fadeOut s'associa al nou div. Si es posiciona en un
* lloc que no queda sota el mouse, per fer que l'ampliació faci fadeOut cal passar-hi
* per sobre i sortir --> cal fer que si queda fora del mouse, el fadeOut s'associi al
* thumbnail i no al nou div.
*
* TODO:
* Falta mirar si es surt de la pantalla, i en cas que surti reposicionar-ho
*
*/

function activa_hover_imatges(position, contingut, url_crida, parametres_crida) {
    //configura el hover pels elements amb classe 'hoverable'.
    //Si es para el mouse prou temps (controlat per hoverIntent), aplica les funcions
    //indicades a la variable de configuració pels events onMouseOver i onMouseOut

    // {onMouseOver callback (REQUIRED), milliseconds delay before onMouseOut, onMouseOut callback (REQUIRED))
    var config = { over: mostra_hover, timeout: 50, out: fes_res };
    if ($("img.hoverable").length > 0) {
        $('body').on('mouseleave','.wrapper_hover',function (event) {
            //event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            $(this).fadeOut('slow');
        });

        parametres = {position: position, contingut: contingut, url_crida: url_crida, parametres_crida: parametres_crida};
        $('img.hoverable').get(0).parametres = parametres;
        $("img.hoverable").hoverIntent(config);
    }
}

function fes_res() {}

function mostra_hover() {
    // mostra un div per sobre de l'element on s'ha fet hover, amb l'html resultant de cridar la vista 'genericView'
    // amb visualitzacio 'hover_cerca'
    var idobjecte = $(this).attr('id');
    var parametres = $('.hoverable').get(0).parametres;
    var contingut = parametres['contingut'];
    var url_crida = parametres['url_crida'];
    var parametres_crida = parametres['parametres_crida'];
    var existeix_hover = $('#wrapper_hover_' + idobjecte).length !== 0;
    if (!existeix_hover) {
        src_imatge = $(this).attr('src');
        if (contingut == 'imatge_ampliada') {
            $(this).after('<\div rel="' + idobjecte + '" class="wrapper_hover hidden" id="wrapper_hover_' + idobjecte + '"><\img src="' + src_imatge + '" \/><\/div>');
        } else if(contingut == 'crida') {
            $(this).after('<\div rel="' + idobjecte + '" class="wrapper_hover hidden" id="wrapper_hover_' + idobjecte + '"><\img src="spinner.png" \/><\/div>');
            //TODO: passar paràmetres (parametres_crida `idobjecte)
            var params = parametres_crida;
            params['idobjecte'] = idobjecte;
            $.get(url_crida, params, function (data) {
                $('#wrapper_hover_' + idobjecte).html(data);
            }, 'html');
        }
    }
    reposicionar_hover(idobjecte);
    $('#wrapper_hover_' + idobjecte).fadeIn('slow');
}

jQuery.fn.centerOnThumbnailTopLeft = function () {
    //centra sobre cantonada superior esquerra

    id_thumbnail = $(this).attr('rel');
    thumbnail_left = parseInt(Math.round($('#' + id_thumbnail).offset().left));
    thumbnail_top = parseInt(Math.round($('#' + id_thumbnail).offset().top));
    this.css("top", thumbnail_top - $(window).scrollTop() + "px");
    this.css("left", thumbnail_left + "px");
    this.css("position","fixed");
    this.css("z-index","999999");
}

jQuery.fn.centerOnThumbnailCenter = function () {
    //centra sobre el thumbnail

    id_thumbnail = $(this).attr('rel');
    thumbnail_left = parseInt(Math.round($('#' + id_thumbnail).offset().left));
    thumbnail_top = parseInt(Math.round($('#' + id_thumbnail).offset().top));
    thumbnail_width = parseInt($('#' + id_thumbnail).css('width'));
    thumbnail_height = parseInt($('#' + id_thumbnail).css('height'));
    hover_width = parseInt($(this).width());
    hover_height = parseInt($(this).height());
    this.css("top", thumbnail_top - hover_height/2 + thumbnail_height/2 - $(window).scrollTop() + "px");
    this.css("left", thumbnail_left - hover_width/2 + thumbnail_width/2 - $(window).scrollLeft() + "px");
    this.css("position","fixed");
    this.css("z-index","999999");
}

function reposicionar_hover(idobjecte){
    //reposiciona el div respecte el thumbnail, segons la posició indicada

    var parametres = $('.hoverable').get(0).parametres;
    var position = parametres['position'];
    switch (position) {
        case 'thumbnail_top_left':
            $('#wrapper_hover_' + idobjecte).centerOnThumbnailTopLeft();;
            break;
        case 'thumbnail_center':
            $('#wrapper_hover_' + idobjecte).centerOnThumbnailCenter();;
            break;
    }
}

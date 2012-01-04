//==============================================================================================================
//funcions d'inicialització cridades desde .pt
//==============================================================================================================
function inicialitza_js_filtres() {
    //inicialitza els scrolls verticals i horitzontal de filtres, el botó per amagar/mostrar i el click dels filtres.

    scroll_vertical_filtres();
    scroll_horitzontal_filtres();
    mostrar_i_amagar_filtres();
    click_filtres();
}


function inicialitza_js_resultats() {
    //activa la funcionalitat de hover de les imatges, activa l'scroll horitzontal,
    //activa els doferents tipus de visualització i el zoom, i carrega la segona pàgina
    activa_hover_imatges();
    scroll_horitzontal_resultats();
    click_visualitzacions();
    zoom_visualitzacions();
}

function scrolls_fitxa_ampliada_cerca() {
    //inicialitza els scrolls verticals de la fitxa_ampliada

    $(document).ready(function() {
        crea_scroll_vertical('dades_left');
        crea_scroll_vertical('dades_right');
    });
}


//==============================================================================================================
//funcions dels filtres
//==============================================================================================================

function pinta_filtres() {
    //crida la vista que recalcula els filtres i fa un replace de l'html

    querystring = consulta_querystring();
    $.get('filtresView', {querystring: querystring}, function(data){
        html_filtres = data;
        $('div#selector_filtres').replaceWith(html_filtres);
        inicialitza_js_filtres();
    });
}


function scroll_horitzontal_filtres() {
    // inicialitza l'scroll horitzontal de filtres

    var api=$("#filtres .scrollable").scrollable({api:true});
}


function scroll_vertical_filtres() {
    // inicialitza l'scroll vertical de filtres

    $('.slideopcions').each(function(i, filtre) { //i és el número, filtre és l'element en sí
        identificador = 'slideopcions-' + (i + 1);
        crea_scroll_vertical(identificador);
    });
}


function mostrar_i_amagar_filtres() {
    // inicialitza la funcionalitat per mostrar i amagar filtres

    var num_elements = $("div.filtre").size();
    var num_files = $("div.fila").size();

    if (num_files < 2) {
        //si només hi ha una fila, amaguem fletxes i botons  d'ampliar
        $("input.mostrar_filtres").addClass("hidden");
        $("input.amagar_filtres").addClass("hidden");
        $("a.arrow_left img").addClass("hidden");
        $("a.arrow_right img").addClass("hidden");
    }
    var altura_fila = $(".fila").height();
    var altura_total_separadors = 31 * (num_files - 1);
    var altura_contenidor = num_files * altura_fila + altura_total_separadors;

    $("input.mostrar_filtres").click(function(){

        //canvia botó 'mostrar' per botó 'amagar'
        $("input.mostrar_filtres").addClass("hidden");
        $("input.amagar_filtres").removeClass("hidden");

        //amaga les fletxes
        $("a.arrow_left img").addClass("hidden");
        $("a.arrow_right img").addClass("hidden");

        //posa en posició inicial l'scroll horitzontal
        var api=$(".scrollable").scrollable({api:true});
        api.seekTo(0);

        //canvia l'alçada del contenidor per que mostri totes les files
        $("#wrapper").animate({height:altura_contenidor});

        //simula les files amb css i afegeix divs entre les files
        $("div.fila").addClass("clearLeft");
        $("div.fila").after('<div class="div_dotted_line_soft"><!-- --></div>');

    });

    $("input.amagar_filtres").click(function(){

        //canvia botó 'amagar' per botó 'mostrar'
        $("input.amagar_filtres").addClass("hidden");
        $("input.mostrar_filtres").removeClass("hidden");

        //mostra les fletxes
        $("a.arrow_left img").removeClass("hidden");
        $("a.arrow_right img").removeClass("hidden");

        //canvia l'alçada del contenidor per que mostri només una fila
        $('#wrapper').animate({height:altura_fila});

        //posa les files en una única línia
        $("div.fila").removeClass("clearLeft");

        //elimina els divs entre les files
        $(".filtres div.div_dotted_line_soft").remove();
    });
}


function click_filtres() {
    // inicialitza la funcionalitat per fer cerques quan es clica els filtres

    //seleccionar els filtres 'Tots' per defecte
    marca_filtres_seleccionats(consulta_querystring());

    $('a.link_filtre').click(function(event){

        //que no s'executi el click
        event.preventDefault();

        //recalcular querystring
            //si ja estava seleccionat, i no és 'Tots': l'eliminem de la cerca
            //sino:
                //si és 'Tots': eliminem els marcats de querystring_actual
                //si no és 'Tots': afegim el nou filtre a querystring_actual
        filtre_clicat = $(this).attr('rel');
        querystring_actual = consulta_querystring();
        nom_filtre = $(this).attr('class').split(' ')[0] //Year
        estava_seleccionat = $(this).hasClass('selected')
        es_opcio_tots = $(this).hasClass('Tots')

        if (estava_seleccionat && !es_opcio_tots) {
            querystring_nou = querystring_actual.replace(filtre_clicat,'');
        } else {
            if(es_opcio_tots) {
                querystring_nou = elimina_tots_filtres_de_querystring(querystring_actual, nom_filtre)
            } else {
                querystring_nou = afegir_filtre_a_querystring(querystring_actual, filtre_clicat)
            }
        }

        querystring_nou = neteja_querystring(querystring_nou);

        actualitza_querystring(querystring_nou);

        $.get('cercaAjaxView', {querystring:querystring_nou}, function(data){

            //un cop ja hem recalculat la cerca, pintem els filtres
            pinta_filtres();

            //un cop ja hem recalculat la cerca, pintem els resultats
            pinta_resultats();

        });

    });
}


function marca_filtres_seleccionats(querystring) {
    // afegeix selected als filtres, segons el que hi hagi indicat a querystring

    //marquem les opcions 'Tots' i desmarcarem si hi ha algun filtre aplicat de la categoria en concret
    $('.Tots').addClass('selected');

    if (existeix_parametre_a_querystring(querystring, 'f') == 1) {
        dic = querystring_to_diccionari(querystring);
        filtres_aplicats = dic['f']
        llista_filtres = llista_filtres_aplicats(filtres_aplicats);
        for (i=0; i<llista_filtres.length; i++) {
            categoria = llista_filtres[i]['categoria'];
            opcio = llista_filtres[i]['opcio'];
            $('.' + categoria + '.' + opcio).addClass('selected');
            $('.' + categoria + '.Tots').removeClass('selected');
            /* si conté espais, haurem posat class=str1 str2, i per seleccionar l'element en farem servri el primer */
            classe_c = categoria.split(' ')[0];
            classe_o = opcio.split(' ')[0];
            $('.' + classe_c + '.' + classe_o).addClass('selected');
            $('.' + classe_c + '.Tots').removeClass('selected');
        }

    }
}


//==============================================================================================================
//funcions dels resultats
//==============================================================================================================

function scroll_horitzontal_resultats() {
    // inicialitza l'scroll horitzontal de resultats

    var api=$("div#resultats .scrollable").scrollable({api:true});
    $("div#resultats .next").click(function() {
        //TODO!! laura!!
        alert('click!');
        ////mirem fins a quina pàgian hem pintat, i pintem la següent (si existeix)
        //pag_pintades = $('.pagina').length;
        //ultima_pagina = $('.pagina' + pag_pintades);
        //pagina_a_pintar = pag_pintades + 1
        //resultats = $('input#llista_resultats').attr('value');
        //visualitzacio = $('a.link_visualitzacio.selected').attr('rel');
        //valor = $("#slider-wrap-zoom").slider("option", "value");
        //step = $("#slider-wrap-zoom").slider("option", "step");
        //zoom = valor/step + 1; //[1,2,3]
        //resultats_per_pagina = 66; //TODO: inventat, caldria calcular!
        //num_obj_inicial = (pagina_a_pintar * resultats_per_pagina) - resultats_per_pagina + 1;
        //num_obj_final = (pagina_a_pintar * resultats_per_pagina);
        //inici_res = num_obj_inicial - 1;
        //final_res = num_obj_final;
        //resultats = resultats.replace('[', '').replace(']', '');
        //resultats = resultats.split(',');
        //resultats = resultats.slice(inici_res, final_res); //(1,3) retorna les posicions 1 i 2 --> va de a a b-1
        ////console.error(visualitzacio);
        //$.get('displayResultatsPaginaView', {'resultats': resultats, 'visualitzacio': visualitzacio, 'zoom': zoom, 'pagina_a_pintar': pagina_a_pintar}, function(data){
        //    html_resultats = data;
        //    ultima_pagina.after(html_resultats);
        //    inicialitza_js_resultats();
        //});

    });
}


function zoom_visualitzacions() {
    // inicialitza la funcionalitat de zoom per les imatges

    //TODO: sembla que quan apliquem un filtre, es llença per algun motiu l'event change de l'slider
    valor_zoom = $('#slider-wrap-zoom').attr('rel');
    var slider_zoom = $("#slider-wrap-zoom").slider({
        value: (valor_zoom - 1) * 30,
        min: 0,
        max: 60,
        step: 30,
        slide: function(event, ui) {
            valor_zoom = parseInt(ui.value / 30) + 1; //[1,2,3]
            $('#slider-wrap-zoom').attr('rel', valor_zoom);
            pinta_resultats();
        }
    });

    $("#zoom_menys").click(function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        visualitzacio = $('.link_visualitzacio.selected').attr('rel');
        if (visualitzacio == 'imatge') {
            var valor = $("#slider-wrap-zoom").slider("option", "value");
            var step = $("#slider-wrap-zoom").slider("option", "step");
            var min = $("#slider-wrap-zoom").slider("option", "min");
            nou_valor = valor - step;
            if (nou_valor >= min) {
                //fem la cida aquí xq si posem event change, funciona malament xq salta quan no toca
                $("#slider-wrap-zoom").slider("value", nou_valor);
                valor_zoom = parseInt(nou_valor / step) + 1; //[1,2,3]
                $('#slider-wrap-zoom').attr('rel', valor_zoom);
                pinta_resultats();
            }
        }
    });

    $("#zoom_mes").click(function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        visualitzacio = $('.link_visualitzacio.selected').attr('rel');
        if (visualitzacio == 'imatge') {
            var valor = $("#slider-wrap-zoom").slider("option", "value");
            var step = $("#slider-wrap-zoom").slider("option", "step");
            var max = $("#slider-wrap-zoom").slider("option", "max");
            nou_valor = valor + step;
            if (nou_valor <= max) {
                //fem la cida aquí xq si posem event change, funciona malament xq salta quan no toca
                $("#slider-wrap-zoom").slider("value", nou_valor);
                valor_zoom = parseInt(nou_valor / step) + 1; //[1,2,3]
                $('#slider-wrap-zoom').attr('rel', valor_zoom);
                pinta_resultats();
            }
        }
    });
}


function click_visualitzacions() {
    // inicialitza la funcionalitat per canviar el tipus de visualitzacio

    $('a.link_visualitzacio').click(function(event){

        //que no s'executi el click
        event.preventDefault();

        //seleccionem la nova visualitzacio i deseleccionem la que estava marcada
        $('#visualitzacio_resultats .selected').removeClass('selected')
        $(this).addClass('selected')

        //repintem els resultats amb la nova visualitzacio
        visualitzacio = $(this).attr('rel');

        //deshabilitem/habilitem zoom
        if (visualitzacio != 'imatge') {
            var min = $( "#slider-wrap-zoom" ).slider("option", "min");
            $( "#slider-wrap-zoom" ).slider("value", min);
            $( "#slider-wrap-zoom" ).slider("disable");
            $( "#zoom_resultats" ).addClass("hidden");
            $( ".link_visualitzacio1" ).removeClass("hidden");
        } else {
            $( "#slider-wrap-zoom" ).slider("enable");
            $( "#zoom_resultats" ).removeClass("hidden");
            $( "#zoom_resultats" ).addClass("selected");
            $(".link_visualitzacio1").addClass("hidden");
        }

        //recalculem els resultats
        pinta_resultats();

    });
}


function calculaPagActual() {
    //retorna el número de pàgina que estem visualitzant

    return $('#pagina_actual').attr('rel');
}


function pinta_resultats() {
    // - cridada quan es clica un filtre, es canvia el zoom o es canvia el tipus de visualització
    // - fa un replace de la zona de resultats (resultats, paginació i visualitzacions)

    //1. consultem i calculem dades necessàries
    querystring = consulta_querystring();
    visualitzacio = $('.link_visualitzacio.selected').attr('rel');
    zoom = $('#slider-wrap-zoom').attr('rel');

    if (visualitzacio == 'fitxa_cerca') { resultats_per_pagina = 15; }
    if (visualitzacio == 'fitxa_ampliada_cerca') { resultats_per_pagina = 1; }
    if (visualitzacio == 'fitxa_ampliada_cerca_overlay') { resultats_per_pagina = 1; }
    if (visualitzacio == 'imatge') {
        resultats_per_pagina = 66;
        if (zoom == 1) { resultats_per_pagina = 66; }
        if (zoom == 2) { resultats_per_pagina = 45; }
        if (zoom == 3) { resultats_per_pagina = 32; }
    }
    //TODO: potser caldria pintar la pàgina on estaria primer obj visible actualment amb la nova visualització
    //TODO: de moment pintem els primers i ja està
    pagina_a_mostrar = 1;


    //2. cridem resultatsView per substituïr tota la zona de resultats
    //útil només si presuposem que quan canviem visualització, tornem a la pàgina 1
    $.get('resultatsView', {querystring: querystring, pagina_actual: pagina_a_mostrar, resultats_per_pagina: resultats_per_pagina, visualitzacio: visualitzacio, zoom: zoom}, function(data){
        html_resultats = data;
        $('#zona_resultats').replaceWith(html_resultats);
    });

    inicialitza_js_resultats();

}


function activa_hover_imatges(){
    //configura el hover pels elements amb classe 'hoverable'.
    //Si es para el mouse prou temps (controlat per hoverIntent), aplica les funcions
    //indicades a la variable de configuració pels events onMouseOver i onMouseOut

    $('#wrapper_resultats').before('<\div class="img_hover hidden"><\/div>');
    var config = {
         over: mostra_detall,    // function = onMouseOver callback (REQUIRED)
         timeout: 50,           // number = milliseconds delay before onMouseOut
         out: fes_res,           // function = onMouseOut callback (REQUIRED)
    };
    $(".hoverable").hoverIntent(config);
}


function fes_res() {}


function mostra_detall() {
    // mostra un div per sobre de l'element on s'ha fet hover, amb l'html resultant de cridar la vista 'genericView'
    // amb visualitzacio 'hover_cerca'

    idobjecte = $(this).attr('id');
    $('#wrapper_resultats').removeClass("hidden");
    $.get('genericView', {idobjecte: idobjecte, visualitzacio: 'hover_cerca'}, function(data){

        //afegim div amb el contingut a mostrar en fer over
        $('div.img_hover').replaceWith('<\div class="img_hover hidden" id="img_hover_' + idobjecte + '">' + data + '<\/div>');


        //TODO: posicionem centrat sobre la miniatura
        //height_hover = $('.img_hover').height();
        //width_hover = $('.img_hover').width();
        //left_imatge = $('#' + idobjecte).parent().position()['left'];
        //top_imatge = $('#' + idobjecte).parent().position()['top'];
        //width_imatge = $('#' + idobjecte).parent().width();
        //height_imatge = $('#' + idobjecte).parent().height();
        //center_height_imatge = top_imatge + (height_imatge/2);
        //center_width_imatge = left_imatge + (width_imatge/2);
        //top_hover = center_height_imatge - (height_hover/2);
        //left_hover = center_width_imatge - (width_hover/2);
        //$('div.img_hover').css({'top':top_hover, 'left':left_hover});

        $('div.img_hover').fadeIn("slow");

        //associem event al div per quan fem mouseout
        $(".img_hover").mouseout(function() { $('div.img_hover').fadeOut("slow") });

        //TODO: reposicionament si sortim de la part visible de la pantalla. Ara només ok en Firefox!
        ////reposicionar si surt dels límits de la pantalla
        //    //posicions x,y de la part visible en referència a la pàgina sencera:
        //        min_h_screen = $(window).scrollTop();
        //        max_h_screen = $(window).scrollTop() + $(window).height();
        //        min_w_screen = $(window).scrollLeft();
        //        max_w_screen = $(window).scrollLeft() + $(window).width();
        //    //posicions x,y del div en referència a la pàgina sencera:
        //        min_h_div = $('div.img_hover').offset()['top'];
        //        max_h_div = $('div.img_hover').offset()['top'] + $('div.img_hover').height();
        //        min_w_div = $('div.img_hover').offset()['left'];
        //        max_w_div = $('div.img_hover').offset()['left'] + $('div.img_hover').width();
        //    //alert('screen: ' + min_h_screen + ', ' + max_h_screen + ',' + min_w_screen + ', ' + max_w_screen)
        //    //alert('div: ' + min_h_div + ', ' + max_h_div + ',' + min_w_div + ', ' + max_w_div)
        //    if (min_h_div < min_h_screen) { top_hover = top_hover + (min_h_screen - min_h_div) + 30; }
        //    if (max_h_div > max_h_screen) { top_hover = top_hover - (max_h_div - max_h_screen) - 30; }
        //    if (min_w_div < min_w_screen) { left_hover = left_hover +  (min_w_screen - min_w_div) + 30; }
        //    if (max_w_div > max_w_screen) { left_hover = left_hover - (max_w_div - max_w_screen) -30 }
        //    //if (min_h_div < min_h_screen) { alert('surt per sobre'); }
        //    //if (max_h_div > max_h_screen) { alert('surt per sota'); }
        //    //if (min_w_div < min_w_screen) { alert('surt per lesquerra'); }
        //    //if (max_w_div > max_w_screen) { alert('surt per la dreta'); }
        //    $('div.img_hover').css({'top':top_hover, 'left':left_hover});

    });
}


//==============================================================================================================
//funcions generals
//==============================================================================================================

function crea_scroll_vertical(identificador) {
    // crea, si cal, un slider vertical per l'element donat
    // prerequisits:
    //      identificador és l'id del div contenidor, amb alçada fixada, que ha de tenir a més la classe 'slider_vertical'
    //      dins té un div amb classe 'div_interior' amb alçada variable segons el que tingui dintre

    //change the main div to overflow-hidden as we can use the slider now
    $('#' + identificador).css('overflow','hidden');

    //compare the height of the scroll content to the scroll pane to see if we need a scrollbar
    var difference = $('#' + identificador + ' .div_interior').height() - $('#' + identificador).height(); //eg it's 200px longer

    //if the scrollbar is needed, set it up...
    if(difference > 5) {
        var proportion = difference / $('#' + identificador + ' .div_interior').height(); //eg 200px/500px
        var handleHeight = Math.round((1-proportion)*$('#' + identificador).height()); //set the proportional height - round it to make sure everything adds up correctly later on
        handleHeight -= handleHeight%2;

        $('#' + identificador + ' .div_interior').after('<\div class="barra" id="barra-' + identificador + '"><\div id="slider-vertical"><\/div><\/div>'); //append the necessary divs so they're only there if needed
        $("#barra-" + identificador).height($('#' + identificador).height()); //set the height of the slider bar to that of the scroll pane

        //set up the slider
        $('#barra-' + identificador + ' #slider-vertical').slider({
            orientation: 'vertical',
            min: 0,
            max: 100,
            value: 100,
            slide: function(event, ui) {//used so the content scrolls when the slider is dragged
                var topValue = -((100-ui.value)*difference/100);
                $('#' + identificador + ' .div_interior').css({'margin-top':topValue});//move the top up (negative value) by the percentage the slider has been moved times the difference in height
            },
            change: function(event, ui) {//used so the content scrolls when the slider is changed by a click outside the handle or by the mousewheel
                var topValue = -((100-ui.value)*difference/100);
                $('#' + identificador + ' .div_interior').css({'margin-top':topValue});//move the top up (negative value) by the percentage the slider has been moved times the difference in height
            }
        });

        //set the handle height and bottom margin so the middle of the handle is in line with the slider
        $('#barra-' + identificador + " .ui-slider-handle").css({height:handleHeight,'margin-bottom':-0.5*handleHeight});
        var origSliderHeight = $('#barra-' + identificador + " #slider-vertical").height();//read the original slider height
        var sliderHeight = origSliderHeight - handleHeight ;//the height through which the handle can move needs to be the original height minus the handle height
        var sliderMargin =  (origSliderHeight - sliderHeight)*0.5;//so the slider needs to have both top and bottom margins equal to half the difference
        $('#barra-' + identificador + " .ui-slider").css({height:sliderHeight,'margin-top':sliderMargin});//set the slider height and margins
    }

    //afegim barra buida, sense slide
    else {
        $('#' + identificador + ' .div_interior').after('<\div class="barra" id="barra-' + identificador + '"><!-- --><\/div>');
    }

    //code to handle clicks outside the slider handle
    $('#barra-' + identificador + " .ui-slider").click(function(event){ //stop any clicks on the slider propagating through to the code below
        event.stopPropagation();
    });
    $("#barra-" + identificador).click(function(event){//clicks on the wrap outside the slider range
        var offsetTop = $(this).offset().top;//read the offset of the scroll pane
        var clickValue = (event.pageY-offsetTop)*100/$(this).height();//find the click point, subtract the offset, and calculate percentage of the slider clicked
        $("#barra-" + identificador + " #slider-vertical").slider("value", 100-clickValue);//set the new value of the slider
    });

    //additional code for mousewheel
    $('#' + identificador + ', #barra-' + identificador).mousewheel(function(event, delta){
        var speed = 15;
        var sliderVal = $('#barra-' + identificador + " #slider-vertical").slider("value");//read current value of the slider
        sliderVal += (delta*speed);//increment the current value
        $('#barra-' + identificador + " #slider-vertical").slider("value", sliderVal);//and set the new value of the slider
        event.preventDefault();//stop any default behaviour
    });
}


//==============================================================================================================
//funcions bàsiques de manipulació de querystring
//==============================================================================================================

function consulta_querystring() {
    //retorna el valor de querystring actual, guardat a input#querystring

    return $('input#querystring').attr('value');
}


function actualitza_querystring(querystring_nou) {
    //actualitza el valor de querystring actual, guardat a input#querystring, amb querystring_nou

    $('input#querystring').attr('value', querystring_nou);
}


function querystring_to_diccionari(querystring) {
    //donat un querystring de tipus rows=66&start=0&s=&f=Year:1991 retorna
    //un diccionari de tipus {rows:66, start:0, s:, f:Year:1991}

    aux = querystring.split('&');
    diccionari = new Array();
    for (i=0; i<aux.length; i++) {
        parts = aux[i].split('=');
        if (parts.length > 1) { diccionari[parts[0]] = parts[1]; }
        else { diccionari[parts[0]] = ''; }
    }
    return diccionari;
}


function diccionari_to_querystring(diccionari) {
    //donat un diccionari de tipus {rows:66, start:0, s:, f:Year:1991} retorna
    //un querystring de tipus rows=66&start=0&s=&f=Year:1991

    querystring = '';
    nexe = '';
    for (var i in diccionari) {
        if (querystring != '')  {nexe = '&'}
        querystring = querystring + nexe + i + '=' + diccionari[i];
    }
    return querystring;
}


function existeix_parametre_a_querystring(querystring, parametre) {
    //retorna 1 si el paràmetre indicat existeix a querystring; 0 en cas contrari

    if(querystring.indexOf(parametre + '=') == -1) { return 0; }
    else { return 1; }
}


function modifica_parametre_a_querystring(querystring, param, nou_valor) {
    //retorna un nou querystring, canviant el valor de 'param' per 'nou_valor'

    dic = querystring_to_diccionari(querystring);
    dic[param] = nou_valor;
    return diccionari_to_querystring(dic);
}


function afegeix_parametre_a_querystring(querystring, param, valor) {
    //retorna un nou querystring, afegint el paràmetre 'param' amb valor 'valor'

    dic = querystring_to_diccionari(querystring);
    dic[param] = valor;
    return diccionari_to_querystring(dic);
}



//==============================================================================================================
//funcions bàsiques de manipulació de filtres a querystring
//==============================================================================================================

function afegir_filtre_a_querystring(querystring, nou_filtre) {
    // retorna querystring afegint el nou filtre

    dic = querystring_to_diccionari(querystring);
    if ('f' in dic) {
        if (dic['f'].indexOf(nou_filtre) == -1) {
            nou_querystring = modifica_parametre_a_querystring(querystring, 'f', dic['f'] + ',' + nou_filtre);
        }
    } else {
        nou_querystring = afegeix_parametre_a_querystring(querystring, 'f', nou_filtre);
    }
    return nou_querystring
}


function elimina_tots_filtres_de_querystring(querystring, nom_filtre) {
    // retorna querystring eliminant tots els nom_filtre de querystring

    dic = querystring_to_diccionari(querystring);
    filtres_aplicats = dic['f'];
    nou_f = '';

    //un filtre aplicat o més d'un
    if (filtres_aplicats) {
        if (filtres_aplicats.indexOf(',') < 0) { llista = [filtres_aplicats]; }
        else { llista = filtres_aplicats.split(','); }

        for (i=0; i<llista.length; i++) {
            if (llista[i].indexOf(nom_filtre + ':') == -1) {
                nou_f += llista[i] + ',';
            }
        }
    }

    return modifica_parametre_a_querystring(querystring, 'f', nou_f.replace('f=', ''))
}


function neteja_querystring(querystring) {
    // retorna el querystring 'net', sensecoses tipus ',,', '=,' etc. (que poden haver quedat en fer 'replace')

    querystring = querystring.replace(',,', ',').replace('=,', '=');
    // eliminar 'f=' si no hi ha cap filtre aplicat, xq el servei retorna error
    //endsWith() amb expressió regular
    if (querystring.match('&f='+"$")=='&f=') {
        querystring = querystring.replace('&f=', '');
    }
    // eliminar ',' al final
    //endsWith() amb expressió regular
    if (querystring.match(','+"$")==',') {
        querystring = querystring.slice(0, -1);
    }

    return querystring;
}


function llista_filtres_aplicats(filtres) {
    //donat un string tipus 'Collection:Dinners,Role:Curator' o 'Media:Video,Year:1992,Year:1992,Year:1992,Media:Image'
    //retorna un array tipus [{'categoria': 'Collection', 'opcio': 'Dinners'}, {'categoria': 'Role', 'opcio': 'Curator'},... ]

    llista_final = [];

    //un filtre aplicat o més d'un
    if (filtres.indexOf(',') < 0) { llista = [filtres]; }
    else { llista = filtres.split(','); }

    for (i=0; i<llista.length; i++) {
        categoria = llista[i].split(':')[0];
        opcio = llista[i].split(':')[1];
        llista_final.push({'categoria': categoria, 'opcio': opcio});
    }

    return llista_final;

}
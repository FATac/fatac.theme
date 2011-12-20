function inicialitza_js() {
    $(document).ready(function() {
        inicialitza_filtres();
        activa_hover_imatges();
        inicialitza_zoom_i_visualitzacio();
    });
}

function inicialitza_filtres() {
    scroll_vertical_filtres();
    scroll_horitzontal_filtres();
    mostrar_i_amagar_filtres();
    click_filtres();
}

function scrolls_fitxa_ampliada_cerca() {
    $(document).ready(function() {
        crea_scroll_vertical('dades_left');
        crea_scroll_vertical('dades_right');
    });
}

function inicialitza_zoom_i_visualitzacio() {
    click_visualitzacions();
    zoom_visualitzacions();
}


function scroll_horitzontal_filtres() {
    // inicialitza l'scroll horitzontal de filtres
    var api=$(".scrollable").scrollable({api:true});
}


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
    var num_elements_fila = Math.floor($("#wrapper").width() / $(".filtre").width()); //floor(x) Returns x, rounded downwards to the nearest integer
    var num_files = Math.ceil(num_elements / num_elements_fila); //ceil(x) Returns x, rounded upwards to the nearest integer

    if (num_files < 2) {
        //si només hi ha una fila, amaguem fletxes i botons  d'ampliar
        $("input.mostrar_filtres").addClass("hidden");
        $("input.amagar_filtres").addClass("hidden");
        $("a.arrow_left img").addClass("hidden");
        $("a.arrow_right img").addClass("hidden");
    }
    var altura_fila = $(".filtre").height();
    var altura_total_separadors = 17 * (num_files - 1);
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
        for (fila = 1; fila <= num_files; fila++) {
            num_filtre = (fila * num_elements_fila) + 1; //si les files són de 6: 7, 13, 19, 25, etc
            $("div.filtre-" + num_filtre).addClass("clearLeft");
            $("div.filtre-" + num_filtre).before('<div class="div_dotted_line_soft"><!-- --></div>');
        }

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
        for (fila = 1; fila <= num_files; fila++) {
            num_filtre = (fila * num_elements_fila) + 1; //si les files són de 6: 7, 13, 19, 25, etc
            $("div.filtre-" + num_filtre).removeClass("clearLeft");
        }

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
        nou_filtre = $(this).attr('rel');
        querystring_actual = consulta_querystring();
        nom_filtre = $(this).attr('class').split(' ')[0] //Year
        //opcio_filtre = $(this).attr('class').split(' ')[1] //1991
        estava_seleccionat = $(this).hasClass('selected')
        es_opcio_tots = $(this).hasClass('Tots')

        if (estava_seleccionat && !es_opcio_tots) {
            querystring_nou = elimina_filtre_de_querystring(querystring_actual, nou_filtre)
        } else {
            if(es_opcio_tots) {
                querystring_nou = elimina_tots_filtres_de_querystring(querystring_actual, nom_filtre)
            } else {
                querystring_nou = afegir_filtre_a_querystring(querystring_actual, nou_filtre)
            }
        }

        querystring_nou = neteja_querystring(querystring_nou);

        actualitza_querystring(querystring_nou);

        executa_cerca_amb_querystring(querystring_nou);

    });
}


function zoom_visualitzacions() {
    // inicialitza la funcionalitat de zoom per les imatges
    var slider_zoom = $("#slider-wrap-zoom").slider({
        value:0,
        min: 0,
        max: 60,
        step: 30,
        change: function(event, ui) {
            pinta_resultats(consulta_querystring());
        }
    });

    $( "#zoom_menys" ).click(function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        visualitzacio = $('a.link_visualitzacio.selected').attr('rel');
        if (visualitzacio == 'imatge') {
            var valor = $("#slider-wrap-zoom").slider("option", "value");
            var step = $("#slider-wrap-zoom").slider("option", "step");
            var min = $("#slider-wrap-zoom").slider("option", "min");
            if (valor > min) {
                slider_zoom.slider("value", valor - step);
            }
        }
    });

    $( "#zoom_mes" ).click(function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        visualitzacio = $('a.link_visualitzacio.selected').attr('rel');
        if (visualitzacio == 'imatge') {
            var valor = $("#slider-wrap-zoom").slider("option", "value");
            var step = $("#slider-wrap-zoom").slider("option", "step");
            var max = $("#slider-wrap-zoom").slider("option", "max");
            if (valor < max) {
                slider_zoom.slider("value", valor + step);
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
        querystring_actual = consulta_querystring();
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
        pinta_resultats(querystring_actual);

    });
}


function consulta_querystring() {
    //retorna el valor de querystring actual, guardat a input#querystring
    return $('input#querystring').attr('value');
}


function neteja_querystring(querystring) {
    // netejar 'querystring' per si han quedat ',,', '=,' etc. en fer 'replace'
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
    //replace de '&?' per '?'
    querystring = querystring.replace('&?', '?');
    return querystring;
}


function actualitza_querystring(querystring_nou) {
    //actualitza el valor de querystring actual, guardat a input#querystring, amb querystring_nou
    $('input#querystring').attr('value', querystring_nou);
}


function afegir_filtre_a_querystring(querystring_actual, nou_filtre) {
    // querystring_nou: afegeixo nou_filtre a querystring_actual
    if(querystring_actual.indexOf('f=') >= 0) {
        return querystring_actual + ',' + nou_filtre;
    } else {
        return querystring_actual + '&f=' + nou_filtre;
    }
}


function elimina_filtre_de_querystring(querystring, filtre) {
    return querystring.replace(filtre, '');
}


function elimina_tots_filtres_de_querystring(querystring_actual, nom_filtre) {
    // elimino tots els nom_filtre de querystring_actual
    aux = querystring_actual.split('&');
    nou = '';
    for (i=0; i<aux.length; i++) {
        // si es tracta del filtre f, recalculo aquesta part
        if(aux[i].indexOf('f=') >= 0) {
            nou_f = '';
            if (aux[i].indexOf(',') >= 0) {
                aux2 = aux[i].split(',');
                for (j=0; j<aux2.length; j++) {
                    if (aux2[j].indexOf(nom_filtre + ':') == -1) {
                        nou_f += aux2[j] + ',';
                    }
                }
            } else { //només hi ha un filtre aplicat
                if (aux[i].indexOf(nom_filtre + ':') == -1) {
                    nou_f += aux[i] + ',';
                }
            }
            nou += '&f=' + nou_f.replace('f=', '');
        // si no es tracta del filtre f, l'afegeixo a 'nou' tal qual
        } else {
            nou += '&' + aux[i];
        }
    }
    return nou;
}

function executa_cerca_amb_querystring(querystring) {
    // crida cercaAjaxView, passant-li el nou querystring, i repinta filtres i resultats
    $.get('cercaAjaxView', {querystring:querystring}, function(data){

        //un cop ja hem recalculat la cerca, pintem els filtres
        pinta_filtres(querystring);

        //un cop ja hem recalculat la cerca, pintem els resultats
        pinta_resultats(querystring);

    });
}

function pinta_filtres(querystring) {
    //crida la vista que recalcula els filtres

    $.get('filtresView', {querystring: querystring}, function(data){
        html_filtres = data;
        $('div#selector_filtres').replaceWith(html_filtres);
        //un cop hem recalculat la cerca, i pintat els filtres, marquem els seleccionats
        //marca_filtres_seleccionats(querystring);
        inicialitza_filtres();
    });
}

function calculaNumResultats(querystring, visualitzacio, zoom) {
    //donada la visualització i el zoom, calcula el número de resultast a mostrar i modifica querystring
    if (visualitzacio == 'fitxa_cerca') { num = 15; }
    else {
        if (visualitzacio == 'fitxa_ampliada_cerca') { num = 1; }
        else {
            if (zoom == 1) { num = 66; }
            else {
                if (zoom == 2) { num = 45; }
                else { num = 32; }
            }
        }
    }
    aux = querystring.split('&');
    querystring_nou = ''
    for (i=0; i<aux.length; i++) {
        // es tracta del paràmetre f
        if(aux[i].indexOf('rows=') >= 0) {
            querystring_nou += "&rows=" + num
        } else {
            querystring_nou += '&' + aux[i]
        }
    }
    return querystring_nou.replace("&?", "?");
}

function pinta_resultats(querystring) {
    //crida la vista que recalcula els resultats

    var visualitzacio = $('a.link_visualitzacio.selected').attr('rel');
    var valor = $("#slider-wrap-zoom").slider("option", "value");
    var step = $("#slider-wrap-zoom").slider("option", "step");
    var zoom = valor/step + 1; //[1,2,3]

    //segons la visualització i el zoom, recalculem el número de resultast a mostrar
    querystring = self.calculaNumResultats(querystring, visualitzacio, zoom)
    actualitza_querystring(querystring)

    $.get('resultatsView', {querystring: querystring, visualitzacio: visualitzacio, zoom: zoom}, function(data){
        html_resultats = data;
        $('div#resultats_cerca').replaceWith(html_resultats);
        //TODO: de moment he fixat min-height i el margin top d eles fletxes...
        //topValue = $('div#resultats_cerca').height() / 2 - 24;
        //$('.arrow_left_resultats').css({'margin-top':topValue});
        //$('.arrow_right_resultats').css({'margin-top':topValue});

        activa_hover_imatges()

    });
}


function activa_hover_imatges(){
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
    idobjecte = $(this).attr('id');
    $('#wrapper_resultats').removeClass("hidden");
    $.get('genericView', {idobjecte: idobjecte, visualitzacio: 'hover_cerca'}, function(data){

        //afegim div amb el contingut a mostrar en fer over
        $('div.img_hover').replaceWith('<\div class="img_hover hidden" id="img_hover_' + idobjecte + '">' + data + '<\/div>');


        //posicionem centrat sobre la miniatura
        height_hover = $('.img_hover').height();
        width_hover = $('.img_hover').width();
        left_imatge = $('#' + idobjecte).parent().position()['left'];
        top_imatge = $('#' + idobjecte).parent().position()['top'];
        width_imatge = $('#' + idobjecte).parent().width();
        height_imatge = $('#' + idobjecte).parent().height();
        center_height_imatge = top_imatge + (height_imatge/2);
        center_width_imatge = left_imatge + (width_imatge/2);
        top_hover = center_height_imatge - (height_hover/2);
        left_hover = center_width_imatge - (width_hover/2);


        $('div.img_hover').css({'top':top_hover, 'left':left_hover});
        $('div.img_hover').fadeIn("slow");


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

        //associem event al div per quan fem mouseout
        $(".img_hover").mouseout(function() { $('div.img_hover').fadeOut("slow") });

    });
}


function marca_filtres_seleccionats(querystring) {
    // afegeix selected als filtres, segons el que hi hagi indicat a querystring
    querystring = consulta_querystring();
    //no hi ha filtres aplicat
    if(querystring.indexOf('f=') == -1) {
        $('.Tots').addClass('selected');
    }
    // hi ha filtres aplicats
    else {
        $('.Tots').addClass('selected');
        aux = querystring.split('&');
        for (i=0; i<aux.length; i++) {
            // es tracta del paràmetre f
            if(aux[i].indexOf('f=') >= 0) {
                filtres_aplicats = aux[i].replace('f=', '');
                //més d'un filtre aplicat
                if (filtres_aplicats.indexOf(',') >= 0) {
                    aux2 = filtres_aplicats.split(',');
                    for (j=0; j<aux2.length; j++) {
                        categoria = aux2[j].split(':')[0];
                        opcio = aux2[j].split(':')[1];
                        $('.' + categoria + '.' + opcio).addClass('selected');
                        $('.' + categoria + '.Tots').removeClass('selected');
                        /* si conté espais, haurem posat class=str1 str2, i per seleccionar l'element en farem servri el primer */
                        classe_c = categoria.split(' ')[0];
                        classe_o = opcio.split(' ')[0];
                        $('.' + classe_c + '.' + classe_o).addClass('selected');
                        $('.' + classe_c + '.Tots').removeClass('selected');
                    }
                }
                //només hi ha un filtre aplicat
                else {
                    categoria = filtres_aplicats.split(':')[0];
                    opcio = filtres_aplicats.split(':')[1];
                    /* si conté espais, haurem posat class=str1 str2, i per seleccionar l'element en farem servri el primer */
                    classe_c = categoria.split(' ')[0];
                    classe_o = opcio.split(' ')[0];
                    $('.' + classe_c + '.' + classe_o).addClass('selected');
                    $('.' + classe_c + '.Tots').removeClass('selected');
                }
            }
        }
    }
}
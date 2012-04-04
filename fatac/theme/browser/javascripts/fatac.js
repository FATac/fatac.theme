//==============================================================================================================
//funcions d'inicialització cridades desde .pt
//==============================================================================================================
function inicialitza_js_filtres() {
    //inicialitza els scrolls verticals i horitzontal de filtres, el botó per amagar/mostrar i el click dels filtres.

    scroll_vertical_filtres();
    scroll_horitzontal_filtres();
    mostrar_i_amagar_filtres();
    click_filtres();
    inicialitza_arrows();
}

function inicialitza_js_resultats() {
    //carrega les pàgines 2 i 3
    //activa els controls pels diferents tipus de visualització i el zoom
    //activa els menús desplegables d'ordre i tipus d'entrada
    //inicialitza el js relacionat amb les pàgines (inicialitza_js_pagines)

    pinta_pagina_seguent(1, function () {
        pinta_pagina_seguent(2);
    });
    click_visualitzacions();
    zoom_visualitzacions();
    selector_ordenacio();
    inicialitza_arrows();
    inicialitza_menus_desplegables();
    inicialitza_js_pagines();
}

function inicialitza_js_pagines() {
    // activa la funcionalitat de hover de les imatges, activa l'scroll horitzontal i la visualització de les fletxes

    activa_hover_imatges('thumbnail_center', 'crida', 'genericView', {visualitzacio: 'hover_cerca'});
    visualitzacio_fletxes();
    scroll_horitzontal_resultats();
}

function selector_ordenacio() {
    //inicialitza el selector 'Ordre' per tal que quan es clica una opció, es refaci la cerca

    $('.tipus_ordre').click(function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        //console.error("modifica_parametres_visualitzacio('sort', " + $(this).attr('rel') + ")");
        //modifica_parametres_visualitzacio('sort', $(this).attr('rel'));
        querystring = consulta_parametre_visualitzacio('querystring');
        querystring['sort'] = $(this).attr('rel');
        modifica_parametres_visualitzacio('querystring', querystring);
        pinta_resultats();
    });
}

function inicialitza_menus_desplegables() {
    // còpia de dropdown.js initializeMenus(), només pels desplegables que acabem de pintar

    jQuery(document).mousedown(actionMenuDocumentMouseDown);

    hideAllMenus();

    // add toggle function to header links
    jQuery('dl.actionMenu.actionMenuFatac dt.actionMenuHeader a')
        .click(toggleMenuHandler)
        .mouseover(actionMenuMouseOver);

    // add hide function to all links in the dropdown, so the dropdown closes
    // when any link is clicked
    jQuery('dl.actionMenu.actionMenuFatac > dd.actionMenuContent').click(hideAllMenus);

}

function inicialitza_arrows() {
    // quan es clica l'element amb classe arrow_bottom/arrow_top, plega o desplega el div amb id = attribut rel
    // l'element amb classe 'arrow_top' o 'arrow_bottom' ha de tenir rel = 'id_zona_plegable' i classe = 'id_zona_plegable'

    $(".arrow_bottom").click(function() {
        var rel = $(this).attr('rel');
        $('.' + rel + '.arrow_top').removeClass("hidden");
        $(this).addClass("hidden");
        $("div#" + rel).slideDown("slow");
    });
    $(".arrow_top").click(function() {
        var rel = $(this).attr('rel');
        $('.' + rel + '.arrow_bottom').removeClass("hidden");
        $(this).addClass("hidden");
        $("div#" + rel).slideUp("slow");
    });
}

function visualitzacio_fletxes() {
    //

    pagina_final = parseInt($('#pagina_total').attr("rel"), 10);
    if (pagina_final === 1) {
        $('.arrow_left_resultats').addClass('disabled');
        $('.arrow_right_resultats').addClass('disabled');
    }
}

function crea_scrolls_verticals() {
    //inicialitza els scrolls verticals per tots els elements amb classe slider_vertical
    $('.slider_vertical').each(function (i) {
        if ($(this).attr('id') != null) {
            crea_scroll_vertical($(this).attr('id'));
        }
    });
}


//==============================================================================================================
//funcions dels filtres
//==============================================================================================================

function pinta_filtres() {
    //crida la vista que recalcula els filtres i fa un replace de l'html

    querystring = consulta_parametre_visualitzacio('querystring');

    $.post('filtresView', {parametres_visualitzacio: ret_parametres_visualitzacio_json()}, function (data) {
        html_filtres = data;
        $('div#selector_filtres').replaceWith(html_filtres);
        inicialitza_js_filtres();
    });
}

function scroll_horitzontal_filtres() {
    // inicialitza l'scroll horitzontal de filtres

    $("#filtres .scrollable").scrollable({api: true});
}

function scroll_vertical_filtres() {
    // inicialitza l'scroll vertical de filtres

    $('.slideopcions').each(function (i) { //i és el número (, filtre és l'element en sí)
        identificador = 'slideopcions-' + (i + 1);
        crea_scroll_vertical(identificador);
    });
}

function mostrar_i_amagar_filtres() {
    // inicialitza la funcionalitat per mostrar i amagar filtres
    //TODO: si despleguem filtres i clickem un filtre, tornen a aparèixer plegats i caldria desplegar

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

    $("input.mostrar_filtres").click(function (event) {

        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        //canvia botó 'mostrar' per botó 'amagar'
        $("input.mostrar_filtres").addClass("hidden");
        $("input.amagar_filtres").removeClass("hidden");

        //amaga les fletxes
        $("a.arrow_left img").addClass("hidden");
        $("a.arrow_right img").addClass("hidden");

        //posa en posició inicial l'scroll horitzontal
        var api = $(".scrollable").scrollable({api: true});
        api.seekTo(0);

        //canvia l'alçada del contenidor per que mostri totes les files
        $("#wrapper").animate({height: altura_contenidor});

        //simula les files amb css i afegeix divs entre les files
        $("div.fila").addClass("clearLeft");
        $("div.fila").after('<div class="div_dotted_line_soft"><!-- --></div>');

    });

    $("input.amagar_filtres").click(function (event) {

        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        //canvia botó 'amagar' per botó 'mostrar'
        $("input.amagar_filtres").addClass("hidden");
        $("input.mostrar_filtres").removeClass("hidden");

        //mostra les fletxes
        $("a.arrow_left img").removeClass("hidden");
        $("a.arrow_right img").removeClass("hidden");

        //canvia l'alçada del contenidor per que mostri només una fila
        $('#wrapper').animate({height: altura_fila});

        //posa les files en una única línia
        $("div.fila").removeClass("clearLeft");

        //elimina els divs entre les files
        $(".filtres div.div_dotted_line_soft").remove();
    });
}

function click_filtres() {
    // inicialitza la funcionalitat per fer cerques quan es clica els filtres

    //seleccionar els filtres 'Tots' per defecte
    marca_filtres_seleccionats();

    $('a.link_filtre').click(function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        $('#zona_resultats').html('<img class="spinner_zona_resultats" src="spinner.gif" alt="..."/>');

        //recalcular querystring
            //si ja estava seleccionat, i no és 'f_Tots': l'eliminem de la cerca
            //sino:
                //si és 'f_Tots': eliminem els marcats de querystring_actual
                //si no és 'f_Tots': afegim el nou filtre a querystring_actual
        var filtre_clicat = $(this).attr('rel');
        var nom_filtre = filtre_clicat.split(':')[0]; //Year
        var estava_seleccionat = existeix_filtre_a_querystring(filtre_clicat);
        var es_opcio_tots = $(this).hasClass('f_Tots');

        if (estava_seleccionat && !es_opcio_tots) {
            elimina_filtre_de_querystring(filtre_clicat);
        } else {
            if (es_opcio_tots) {
                elimina_filtres_de_categoria(nom_filtre);
            } else {
                afegir_filtre_a_querystring(filtre_clicat);
            }
        }

        //seleccionar els filtres 'Tots' per defecte
        marca_filtres_seleccionats();

        $.post('cercaAjaxView', {parametres_visualitzacio: ret_parametres_visualitzacio_json()}, function () {

            //un cop ja hem recalculat la cerca, pintem els filtres
            pinta_filtres();

            //un cop ja hem recalculat la cerca, pintem els resultats
            pinta_resultats();

        });

    });
}

function marca_filtres_seleccionats() {
    // afegeix selected als filtres, segons el que hi hagi indicat a querystring

    //marquem les opcions 'Tots' i desmarcarem si hi ha algun filtre aplicat de la categoria en concret
    $('.f_Tots').addClass('selected');

    var querystring = consulta_parametre_visualitzacio('querystring');
    var filtres_aplicats = querystring.f;
    if (filtres_aplicats !== undefined) {
        for (i = 0; i < filtres_aplicats.length; i = i + 1) {
            categoria = filtres_aplicats[i].split(':')[0];
            var opcio = filtres_aplicats[i].split(':')[1];
            $('.c_' + categoria + '.f_' + opcio).addClass('selected');
            $('.c_' + categoria + '.f_Tots').removeClass('selected');
            /* si conté espais, haurem posat class=str1 str2, i per seleccionar l'element en farem servri el primer */
            var classe_c = categoria.split(' ')[0];
            var classe_o = opcio.split(' ')[0];
            $('.c_' + classe_c + '.f_' + classe_o).addClass('selected');
            $('.c_' + classe_c + '.f_Tots').removeClass('selected');
        }
    }

}


//==============================================================================================================
//funcions dels resultats
//==============================================================================================================

function scroll_horitzontal_resultats() {
    // inicialitza l'scroll horitzontal de resultats

    //inicialment mostrem pag1 i precarreguem pag2 i pag3.
    //next --> precarreguem pag_actual + 3
    $("div#resultats .scrollable").scrollable({api: true});

    $("div#resultats .next").click(function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        canvia_dades_paginacio('next', function () {
            //tindrem sempre precarregades 2 pàgines més de la que mirem
            //si la pàgina que mirem no l'haviem visitat, pintem una pàgina més
            var pagina_actual = parseInt(consulta_parametre_visualitzacio('pagina_actual'), 10);
            if (!($('.pagina' + pagina_actual).hasClass('visitada')) && !(pagina_actual == 1)) {
                $('.pagina' + pagina_actual).addClass('visitada');
                var ultima_pagina = pagina_actual + 1;
                var pagina_a_pintar = ultima_pagina + 1;
                if ($('.pagina' + pagina_a_pintar).length === 0) {
                    pinta_pagina_seguent(ultima_pagina);
                }
            }
        });
    });

    $("div#resultats .prev").click(function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        canvia_dades_paginacio('prev');
    });

}

function canvia_dades_paginacio(direccio, callback) {
    //un cop hem fet scroll, cal canviar dades paginació

    // canviem pagina actual
    var pag, num_resultats, resultats_per_pagina, numb_obj_inicial, num_obj_final;
    if (direccio === 'next') {
        pag = parseInt(consulta_parametre_visualitzacio('pagina_actual'), 10) + 1;
    } else {
        pag = parseInt(consulta_parametre_visualitzacio('pagina_actual'), 10) - 1;
    }

    $('#pagina_actual').html(pag);
    modifica_parametres_visualitzacio('pagina_actual', pag);

    //canviem número de resultats
    num_resultats = $('#num_resultats').attr("value");
    resultats_per_pagina = consulta_parametre_visualitzacio('resultats_per_pagina');
    num_obj_inicial = parseInt((pag * resultats_per_pagina) - resultats_per_pagina + 1, 10);
    num_obj_final = parseInt((pag * resultats_per_pagina), 10);
    if (num_obj_final > num_resultats) { num_obj_final = parseInt(num_resultats, 10); }

    $('#arxiu_inicial').html(num_obj_inicial);
    $('#arxiu_final').html(num_obj_final);

    if (callback) { callback(); }
}

function zoom_visualitzacions() {
    // inicialitza la funcionalitat de zoom per les imatges

    var valor_zoom = $('#slider-wrap-zoom').attr('rel');
    $("#slider-wrap-zoom").slider({
        value: (valor_zoom - 1) * 30,
        min: 0,
        max: 60,
        step: 30,
        slide: function (event, ui) {
            valor_zoom = parseInt(ui.value / 30, 10) + 1; //[1,2,3]
            $('#slider-wrap-zoom').attr('rel', valor_zoom);
            modifica_parametres_visualitzacio('zoom', valor_zoom);
            resultats_per_pagina = calcula_resultats_per_pagina(valor_zoom);
            modifica_parametres_visualitzacio('resultats_per_pagina', resultats_per_pagina);
            pinta_resultats();
        }
    });

    $("#zoom_menys").click(function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        var valor = $("#slider-wrap-zoom").slider("option", "value");
        var step = $("#slider-wrap-zoom").slider("option", "step");
        var min = $("#slider-wrap-zoom").slider("option", "min");
        var nou_valor = valor - step;
        if (nou_valor >= min) {
            //fem la cida aquí xq si posem event change, funciona malament xq salta quan no toca
            $("#slider-wrap-zoom").slider("value", nou_valor);
            valor_zoom = parseInt(nou_valor / step, 10) + 1; //[1,2,3]
            $('#slider-wrap-zoom').attr('rel', valor_zoom);
            modifica_parametres_visualitzacio('zoom', valor_zoom);
            resultats_per_pagina = calcula_resultats_per_pagina(valor_zoom);
            modifica_parametres_visualitzacio('resultats_per_pagina', resultats_per_pagina);
            pinta_resultats();
        }
    });

    $("#zoom_mes").click(function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        var valor = $("#slider-wrap-zoom").slider("option", "value");
        var step = $("#slider-wrap-zoom").slider("option", "step");
        var max = $("#slider-wrap-zoom").slider("option", "max");
        var nou_valor = valor + step;
        if (nou_valor <= max) {
            //fem la cida aquí xq si posem event change, funciona malament xq salta quan no toca
            $("#slider-wrap-zoom").slider("value", nou_valor);
            valor_zoom = parseInt(nou_valor / step, 10) + 1; //[1,2,3]
            $('#slider-wrap-zoom').attr('rel', valor_zoom);
            modifica_parametres_visualitzacio('zoom', valor_zoom);
            var resultats_per_pagina = calcula_resultats_per_pagina(valor_zoom);
            modifica_parametres_visualitzacio('resultats_per_pagina', resultats_per_pagina);
            pinta_resultats();
        }
    });
}

function click_visualitzacions() {
    // inicialitza la funcionalitat per canviar el tipus de visualitzacio

    $('a.link_visualitzacio').click(function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        //seleccionem la nova visualitzacio i deseleccionem la que estava marcada
        $('#visualitzacio_resultats .selected').removeClass('selected');
        $(this).addClass('selected');

        //repintem els resultats amb la nova visualitzacio
        var visualitzacio = $(this).attr('rel');
        modifica_parametres_visualitzacio('visualitzacio', visualitzacio);
        var zoom = consulta_parametre_visualitzacio('zoom');
        var resultats_per_pagina;
        if (visualitzacio === 'fitxa_cerca') { resultats_per_pagina = 15; }
        if (visualitzacio === 'fitxa_ampliada_cerca') { resultats_per_pagina = 1; }
        if (visualitzacio === 'fitxa_ampliada_cerca_overlay') { resultats_per_pagina = 1;}
        if (visualitzacio === 'imatge') {
            resultats_per_pagina = calcula_resultats_per_pagina(zoom);
        }
        modifica_parametres_visualitzacio('resultats_per_pagina', resultats_per_pagina);

        //deshabilitem/habilitem zoom
        if (visualitzacio !== 'imatge' && visualitzacio != 'fitxa_ampliada_cerca_overlay') {
            var min = $("#slider-wrap-zoom").slider("option", "min");
            $("#slider-wrap-zoom").slider("value", min);
            $("#slider-wrap-zoom").slider("disable");
            $("#zoom_resultats").addClass("hidden");
            $(".link_visualitzacio1").removeClass("hidden");
        } else {
            $("#slider-wrap-zoom").slider("enable");
            $("#zoom_resultats").removeClass("hidden");
            $("#zoom_resultats").addClass("selected");
            $(".link_visualitzacio1").addClass("hidden");
        }
        //recalculem els resultats
        pinta_resultats( function(){
            if (visualitzacio == 'fitxa_ampliada_cerca_overlay'){
                initFullScreen();
            }
        });

    });
}

//TODO: caldria fer que només canvii la zona de les pàgines, no els controls de paginació i visualització, ordre, etc.
function pinta_resultats(callback) {
    // - cridada quan es clica un filtre, es canvia el zoom o es canvia el tipus de visualització
    // - fa un replace de la zona de resultats (resultats, paginació i visualitzacions)

    $('#zona_resultats').html('<img class="spinner_zona_resultats" src="spinner.gif" alt="..."/>');

    //1. consultem i calculem dades necessàries
    //TODO: potser caldria pintar la pàgina on estaria primer obj visible actualment amb la nova visualització (de moment pintem els primers)
    modifica_parametres_visualitzacio('pagina_actual', 1);

    //2. cridem resultatsView per substituïr tota la zona de resultats
    //útil només si presuposem que quan canviem visualització, tornem a la pàgina 1
    $.post('resultatsView', {parametres_visualitzacio: ret_parametres_visualitzacio_json()}, function (data) {

        $('#zona_resultats').replaceWith(data);

        if (callback) { callback()};
    });
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function pinta_pagina_seguent(pagina, callback) {
    //crida la vista que retorna l'html corresponent a la pàgina 'pagina'+1, i l'inserta després de 'pagina'

    var total_pagines = parseInt($('#pagina_total').attr('rel'),10);

    if (pagina < total_pagines) {
        //si fem parametres_visualitzacio = ret_parametres_visualitzacio(); ho passa per referència i modifica valor original!
        var params = clone(ret_parametres_visualitzacio());
        params.pagina_actual = pagina + 1;


        //afegim div i quan tinguem l'html, el reemplacem
        var pagina_str = (pagina + 1).toString();
        $('.pagina' + pagina).after('<div class="resultats pagina pagina' + pagina_str + '"><img class="spinner_pagina" src="spinner.gif" alt="..." /></div>');


        var parametres_visualitzacio_json = JSON.stringify(params);
        $.post('displayResultatsPaginaView', {parametres_visualitzacio: parametres_visualitzacio_json}, function (data) {
            $('.pagina' + pagina_str).replaceWith(data);
            inicialitza_js_pagines();
            if (callback) { callback(); }
            $(document).trigger('pinta_pagina_seguent', pagina)
        });
    }
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

    //En el cas de que estiguem a la vista "genericview_fitxa_ampliada_cerca" la mida ha de ser 485px.
    if (identificador.split('-')[0] == 'slideFitxaOpcionsId')
    {
        var fullHeight = 485;
    }
    else
    {

        var fullHeight = $('#' + identificador).height();
    }

    //compare the height of the scroll content to the scroll pane to see if we need a scrollbar
    var difference = $('#' + identificador + ' .div_interior').height() - fullHeight; //eg it's 200px longer

    //if the scrollbar is needed, set it up...
    if(difference > 5 && $('#barra-' + identificador).length == 0) {
        var proportion = difference / $('#' + identificador + ' .div_interior').height(); //eg 200px/500px
        var handleHeight = Math.round((1-proportion)*fullHeight); //set the proportional height - round it to make sure everything adds up correctly later on
        handleHeight -= handleHeight%2;

        $('#' + identificador + ' .div_interior').after('<div class="barra" id="barra-' + identificador + '"><div class="slider-vertical"></div></div>'); //append the necessary divs so they're only there if needed
        $("#barra-" + identificador).height(fullHeight); //set the height of the slider bar to that of the scroll pane

        //set up the slider
        $('#barra-' + identificador + ' .slider-vertical').slider({
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

        if (identificador.split('-')[0] == 'slideFitxaOpcionsId')
        {
            var origSliderHeight = fullHeight;//read the original slider height
        }
        else
        {
            var origSliderHeight = $('#barra-' + identificador + " .slider-vertical").height();//read the original slider height
        }

        var sliderHeight = origSliderHeight - handleHeight ;//the height through which the handle can move needs to be the original height minus the handle height
        var sliderMargin =  (origSliderHeight - sliderHeight)*0.5;//so the slider needs to have both top and bottom margins equal to half the difference
        $('#barra-' + identificador + " .ui-slider").css({height:sliderHeight,'margin-top':sliderMargin});//set the slider height and margins
    }

    //afegim barra buida, sense slide
    else {
        if ($('#barra-' + identificador).length == 0)
        {
            $('#' + identificador + ' .div_interior').after('<div class="barra" id="barra-' + identificador + '"><!-- --></div>');
        }
    }

    //code to handle clicks outside the slider handle
    $('#barra-' + identificador + " .ui-slider").click(function(event){ //stop any clicks on the slider propagating through to the code below
        event.stopPropagation();
    });
    $("#barra-" + identificador).click(function(event){//clicks on the wrap outside the slider range
        var offsetTop = $(this).offset().top;//read the offset of the scroll pane
        var clickValue = (event.pageY-offsetTop)*100/$(this).height();//find the click point, subtract the offset, and calculate percentage of the slider clicked
        $("#barra-" + identificador + " .slider-vertical").slider("value", 100-clickValue);//set the new value of the slider
    });

    //additional code for mousewheel
    $('#' + identificador + ', #barra-' + identificador).mousewheel(function(event, delta){
        var speed = 15;
        var sliderVal = $('#barra-' + identificador + " .slider-vertical").slider("value");//read current value of the slider
        sliderVal += (delta*speed);//increment the current value
        $('#barra-' + identificador + " .slider-vertical").slider("value", sliderVal);//and set the new value of the slider
        event.preventDefault();//stop any default behaviour
    });
}

function calcula_resultats_per_pagina(zoom) {
    // segons el zoom aplicat, retorna el núemro de resultats a mostrar per pàgina
    zoom = parseInt(zoom);
    if (zoom === 1) { return 66; }
    if (zoom === 2) { return 45; }
    if (zoom === 3) { return 32; }
}


//==============================================================================================================
//funcions bàsiques de manipulació de filtres a querystring
//==============================================================================================================

function elimina_filtre_de_querystring(filtre) {
    // elimina el filtre de querystring

    var querystring = consulta_parametre_visualitzacio('querystring');
    for (i = 0; i < querystring.f.length; i = i + 1) {
        if (querystring.f[i] === filtre) {
            querystring.f.splice(i, 1);
        }
    }
    modifica_parametres_visualitzacio('querystring', querystring);
}

function afegir_filtre_a_querystring(filtre) {
    // afegeix el nou filtre a querystring

    var querystring = consulta_parametre_visualitzacio('querystring');
    if (existeix_filtre_a_querystring(filtre) === false) {
        if (querystring.f === undefined) {
            querystring.f = [filtre];
        } else {
            querystring.f.push(filtre);
        }
        modifica_parametres_visualitzacio('querystring', querystring);
    }
}

function existeix_filtre_a_querystring(filtre) {
    // retorna true si el filtre ja existeix a querystring

    var querystring = consulta_parametre_visualitzacio('querystring');
    if (querystring.f !== undefined) {
        for (i = 0; i < querystring.f.length; i = i + 1) {
            if (querystring.f[i] === filtre) {
                return true;
            }
        }
    }
    return false;
}

function elimina_filtres_de_categoria(categoria) {
    // elimina els filtres aplicats de la categoria indicada

    var aux = [], querystring;
    querystring = consulta_parametre_visualitzacio('querystring');
    for (i = 0; i < querystring.f.length; i = i + 1) {
        if (querystring.f[i].indexOf(categoria + ':') === -1) {
            aux.push(querystring.f[i]);
        }
    }
    querystring.f = aux;
    modifica_parametres_visualitzacio('querystring', querystring);
}


//==============================================================================================================
//funcions bàsiques parametres_visualitzacio
//==============================================================================================================

function modifica_parametres_visualitzacio(param, valor) {
    // sobreescriu amb 'valor' el valor del paràmetre 'param' dels parametres_visualitzacio

    var parametres_visualitzacio = $('#visual-portal-wrapper').get(0).parametres_visualitzacio;
    parametres_visualitzacio[param] = valor;
    $('#visual-portal-wrapper').get(0).parametres_visualitzacio = parametres_visualitzacio;
}

function consulta_parametre_visualitzacio(param) {
    // retorna l'objecte que representa els parametres de visualització

    var parametres_visualitzacio = $('#visual-portal-wrapper').get(0).parametres_visualitzacio;
    return parametres_visualitzacio[param];
}

function ret_parametres_visualitzacio() {
    // retorna l'objecte que representa els parametres de visualització

    return $('#visual-portal-wrapper').get(0).parametres_visualitzacio;
}

function ret_parametres_visualitzacio_json() {
    //

    var parametres_visualitzacio = $('#visual-portal-wrapper').get(0).parametres_visualitzacio;
    return JSON.stringify(parametres_visualitzacio);
}

(function($){

  var $container;

  var attachEvents = function(){

    // deal with resizing the browser window and resize container
    $container.bind("updateSize", function(event) {
      $container.height($(window).height());
      updateSlideSize();
    });

    // private function to update the image size and position of a slide
    var updateSlideSize = function(slide) {
      var ww, wh;
      if (slide === undefined) {
        slide = $container.data("currentSlide");
      }
      if (slide !== undefined) {
        wh = $(window).height();
        ww = $(window).width();
        // compare the window aspect ratio to the image aspect ratio
        // to use either maximum width or height
        slide.$img.find('img').each(function(i, o) {
            o = $(o);
            o.removeClass('media_image')
            if ((ww / wh) > (o.width() / o.height())) {
              o.css({
                "height" : wh + "px",
                "width"  : "auto"
              });
            } else {
              o.css({
                "height" : "auto",
                "width"  : ww + "px"
              });
            }
        });
        // compare the window aspect ratio to the video aspect ratio
        slide.$img.find('video').each(function(i, o) {
            o = $(o);
            o.removeClass('media_video')
            if ((ww / wh) <= (o.width() / o.height())) {
              o.width(ww)
            }
            o.height(wh - 50)
        });

        // compare the window aspect ratio to the container
        if ((ww / wh) > (slide.$img.width() / slide.$img.height())) {
          slide.$img.css({
            "height" : wh + "px",
            "width"  : "auto"
          });
        } else {
          slide.$img.css({
            "height" : "auto",
            "width"  : ww + "px"
          });
        }
        // update margins to position in the center
        slide.$img.css({
          "margin-left" : "-" + (0.5 * slide.$img.width()) + "px",
          "margin-top"  : "-" + (0.5 * slide.$img.height()) + "px"
        });

      }
    }
    $(window).bind("resize", function(){
      //todo: throttle
      $container.trigger("updateSize");
    });

    // Show individual slides
    var isLoading = false;
    var prepareSlide = function(slide){
        var slides, newSlide, pagina, preview, info, slideElement;
        slides = $container.data("slides");
        pagina = slide + 1;
        newSlide = slides[slide];
        newSlide.$img = $('.pagina'+pagina).hide();
        if (newSlide.$img.find('.fs-info').length > 0){
            newSlide.$img.css({
                       "position"    : "absolute",
                       "left"        : "50%",
                       "top"         : "50%"
                     }).hide();
            newSlide.loaded = true;
            // Info
            info = newSlide.$img.find('.fs-info');
            newSlide.info = info.html();
            info.remove();
            // Preview
            $container.append(newSlide.$img);
            newSlide.preview  = newSlide.$img.find('.slide-preview');
            newSlide.preview.attr('id', 'slide-preview-' + slide);
            slideElement = $('#slide-preview-'+slide);
            if (slideElement.length > 0 ){
                slideElement.replaceWith(newSlide.preview)
                slideElement.click( function () {
                    $container.trigger("showSlide", slide);
                });
            }
            newSlide.$img.find('.slide-preview').remove();
        }
    }
    var waitReady = 0;
    $(document).bind('pinta_pagina_seguent', function(event, pagina){
        if ($container){
            slides = $container.data("slides")
            if (slides !== undefined && slides[pagina] && !slides[pagina].loaded){
                prepareSlide(pagina);
                if (waitReady === pagina){
                    isLoading = false;
                    $container.trigger('stopLoading');
                    changeSlide($container.data("currentSlide"), slides[pagina]);
                    updateSlideSize(slides[pagina]);
                }
            }
        }

      });

    var preloadSlide = function(){
        var slides, preloadID, total_pagines;
        slides = $container.data("slides")
        total_pagines = parseInt($('#pagina_total').attr('rel'),10);
        preloadID = slides.length;
        if (preloadID < total_pagines ){
            newSlide = {loaded:false, id: preloadID};

            slides[preloadID] = newSlide;
            if ($('.pagina'+(preloadID + 1)).length === 0){
                pinta_pagina_seguent(preloadID, function(){
                    prepareSlide(preloadID);
                });
            }else{
                prepareSlide(preloadID);
            }
        }
    }

    $container.bind("showSlide", function(event, slide) {
      var slides, total_pagines, newSlide, oldSlide = $container.data("currentSlide");

      if (!isLoading) {
        slides = $container.data("slides");
        total_pagines = parseInt($('#pagina_total').attr('rel'),10);
        if (slide < slides.length){
            newSlide = slides[slide]
            if (newSlide.loaded) {
                changeSlide(oldSlide, newSlide);
                updateSlideSize(newSlide);
            }
            else {
                // Encara no s'ha obtingut els resultats de la pregarrega
                isLoading = true;
                $container.trigger('startLoading');
                waitReady = slide;
            }
        }
        else if ((slide + 1) <= total_pagines){
            // Encara no s'ha precarregat
            slides[slide] = {loaded:false, id: slide};
            newSlide = slides[slide]
            isLoading = true;
            $container.trigger('startLoading');
            waitReady = slide;
            if ($('.pagina' + (slide + 1)).length === 0){
                // No s'ha fet la precarrega
                pinta_pagina_seguent(slide);
            }
        }
      }
    });

    $container.bind("prevSlide nextSlide", function(event, obj) {
        var total_pagines, nextID, currentID;
        currentID = $container.data("currentSlide").id;
        total_pagines = parseInt($('#pagina_total').attr('rel'),10);
        if (event.type == "nextSlide") {
            nextID = (currentID + 1);
            if (nextID > total_pagines){
                nextID = currentID;
            } else{
                preloadSlide();
            }
        } else {
            nextID = currentID - 1;
            if (nextID < 0) {
                nextID = 0;
            }
        }
        if (nextID != currentID){
            $container.trigger("showSlide", nextID);
        }
    });
    var addPreview = function(slides, index){
        var slide, preview;
        preview = '<div class="slide-preview waiting" id="slide-preview-' + index + '"><img src="spinner.gif"/></div>';
        slide = $("#slide-preview-" + index);
        if (index < slides.length){
            if (slides[index].loaded) {
                preview = slides[index].preview;
            }
        }
        if (slide.length === 0){
            $('.slide-selector > .previews').append(preview);
            slide.click( function () {
                    $container.trigger("showSlide", index);
            });
        } else {
            // Comprovar que l'slide s'hagi carregat
            if (slide.hasClass('waiting')){
                slide.replaceWith(preview);
                slide.click( function () {
                    $container.trigger("showSlide", index);
                });
            }
            slide.show();
        }
    }

    // private function to change between slides
    var changeSlide = function(oldSlide, newSlide) {
        var slides, slide, total_pagines = parseInt($('#pagina_total').attr('rel'),10);
        slides = $container.data("slides")
        slide = newSlide.id;

        if (oldSlide !== undefined) {
            $container.trigger("endOfSlide", oldSlide);
            childrens = $('.previews').children();
            childrens.removeClass('selected');
            childrens.hide();
            oldSlide.$img.fadeOut();
        }
        newSlide.$img.fadeIn(function(){
            $container.trigger("startOfSlide", newSlide);
        });
        if (slide === 0){
            startAt = 0;
        }
        else if (slide === total_pagines - 1){
            startAt = slide - 2;
        } else{
            startAt = slide - 1;
        }
        for (i = 0; i < 3; i ++){
            addPreview(slides, startAt + i);
        }
        $('#slide-preview-' + slide).addClass('selected');
        $container.data("currentSlide", newSlide);
    }

    // keyboard navigation
    var keyFunc = function(event) {
      if (event.keyCode == 27) { // ESC
        $container.trigger("close");
      }
      if (event.keyCode == 37) { // Left
        $container.trigger("prevSlide");
      }
      if (event.keyCode == 39) { // Right
        $container.trigger("nextSlide");
      }
    }

    // Close the viewer
    $container.bind("close", function(){
        var options, oldSlide, link, zoom;
        options = $container.data("options");
        oldSlide = $container.data("currentSlide");
        oldSlide.$img.hide();
        $container.trigger("endOfSlide", oldSlide);
        $(document).unbind("keyup", keyFunc);
        // Use the fancy new FullScreenAPI:
        if (options.useFullScreen) {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        }
        if (document.mozCancelFullScreen) {
          $("html").css("overflow", "auto");
          $(document).scrollTop($container.data("mozScrollTop"));
          document.mozCancelFullScreen();
        }
        if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
        document.removeEventListener('fullscreenchange', changeFullScreenHandler);
        document.removeEventListener('mozfullscreenchange', changeFullScreenHandler);
        document.removeEventListener('webkitfullscreenchange', changeFullScreenHandler);
        }
        // Canviem la visuaalització
        link = $('.link_visualitzacio:first-child')
        // seleccionem la nova visualitzacio i deseleccionem la que estava marcada
        $('#visualitzacio_resultats .selected').removeClass('selected');
        link.addClass('selected');
        // repintem els resultats amb la nova visualitzacio
        modifica_parametres_visualitzacio('visualitzacio', link.attr('rel'));
        zoom = consulta_parametre_visualitzacio('zoom');
        modifica_parametres_visualitzacio('resultats_per_pagina', calcula_resultats_per_pagina(zoom));

        $("#slider-wrap-zoom").slider("enable");
        $("#zoom_resultats").removeClass("hidden");
        $("#zoom_resultats").addClass("selected");
        $(".link_visualitzacio1").addClass("hidden");

        // You can close the slide show like this:
        $container
            .removeData("currentSlide slides width height")
            .hide();
        $container.remove();
        //recalculem els resultats
        pinta_resultats();
    });

    // When ESC is pressed in full screen mode, the keypressed event is not
    // triggered, so this here catches the exit-fullscreen event:
    function changeFullScreenHandler(event) {
      if ($container.data("isFullScreen")) {
        $container.trigger("close");
      }
      $container.data("isFullScreen", true);
    }

    var firstrun = true;
    // Show a particular slide
    $container.bind("show", function(event, slide){
      var options, slides, total_pagines;
      total_pagines = parseInt($('#pagina_total').attr('rel'),10);
      options = $container.data("options");
      slides = $container.data("slides");

      $container.trigger("updateSize");
      $(document).bind("keyup", keyFunc);

      if (firstrun) {
        $container.trigger("init");
        // Find and prepare content loaded
        $('.pagina').each(function(i, o){
            slides.push({loaded:false, id: i});
            prepareSlide(i);
        });
        // We want 3 slides to preload if they exist
        while (slides.length < 3 && (slides.length < total_pagines)){
            slides.push({loaded:false, id: slides.length});
        }
        firstrun = false;
      }
      // Use the fancy new FullScreenAPI:
      if (options.useFullScreen) {
        con = $container[0];
        if (con.requestFullScreen) {
          document.requestFullScreen();
          document.addEventListener('fullscreenchange', changeFullScreenHandler);
        }
        if (con.mozRequestFullScreen) {
          con.mozRequestFullScreen();
          document.addEventListener('mozfullscreenchange', changeFullScreenHandler);
          $container.data("mozScrollTop", $(document).scrollTop());
          $("html").css("overflow", "hidden");
        }
        if (con.webkitRequestFullScreen) {
          con.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
          document.addEventListener('webkitfullscreenchange', changeFullScreenHandler);
        }
        $container.data("isFullScreen", false);
      }

      $container.show();
      $container.trigger("showSlide", slide);
    });

  }

  $.fn.fullscreenslides = function(options) {
    $container = $('#fullscreenSlideshowContainer');
    if ($container.length == 0) {
      $container = $('<div id="fullscreenSlideshowContainer">').hide();
      $("body").append($container);
      attachEvents();
    }
    // initialize variables
    var options = $.extend({
      "bgColor"           : "#000",
      "useFullScreen"     : true,
      "startSlide"        : 0
    }, options || {});
    // Check if fullScreenApi is available
    options.useFullScreen = options.useFullScreen && !!(
      $container[0].requestFullScreen ||
      $container[0].mozRequestFullScreen ||
      $container[0].webkitRequestFullScreen);

    $container.data("options", options);
    // Apply default styles
    $container.css({
      "position"         : "fixed",
      "top"              : 0,
      "left"             : 0,
      "width"            : "100%",
      "background-color" : options.bgColor
    });
    $container.data("slides", []);

  }
})(jQuery);

function initFullScreen(){


      // initialize the slideshow
      $(document).fullscreenslides();

      // All events are bound to this container element
      var $container = $('#fullscreenSlideshowContainer');

      $container
        //This is triggered once:
        .bind("init", function() {

          // The slideshow does not provide its own UI, so add your own
          // check the fullscreenstyle.css for corresponding styles
          $container
            .append('<div class="ui" id="fs-caption"></div> \
                <div class="ui" id="fs-header"> \
                <div class="fs-header-extra"><span class="logo">ARTSCOMBINATORIES</span> \
                <span class="title"> ' + document.title + '</span></div> \
                <div class="btns"> \
                    <span id="fs-close">&times;</span> \
                    <span id="fs-info"><img src="++resource++fatac.theme.images/info_16_blanco.png" alt="i" title="Info"></span> \
                    <span class="fs-prev">&lt;</span> \
                    <span class="fs-next">&gt;</span> \
                </div> \
                </div>')
            .append('<div class="ui" id="fs-loader"><img src=\"spinner.gif\" alt="Loading..."></div>')
            .append('<div class="ui" id="fs-footer"> \
                    <div class="slide-selector"> \
                        <div class="fs-prev">&lt;</div> \
                        <div class="fs-next">&gt;</div> \
                        <div class="previews"></div>\
                    </div>\
                    <div class="helper"></div>\
                </div>');
          $('.helper').mouseenter(function (){
               $('.slide-selector').show();
          });
          var timeout = 0;
          $('#fs-footer').mouseleave(function(){
                if (timeout !== 0 ) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(function(){
                    $('.slide-selector').hide();
                }, 400);
          }).mouseenter(function(){
            if (timeout !== 0 ) {
                clearTimeout(timeout);
            }
          });
          // Bind to the ui elements and trigger slideshow events
          $('.fs-prev').each(
                function(){
            $(this).click(function(){
            // You can trigger the transition to the previous slide
                $container.trigger("prevSlide");
              });
            });
          $('.fs-next').click(function(){
            // You can trigger the transition to the next slide
            $container.trigger("nextSlide");
          });
          $('#fs-close').click(function(){
            $container.trigger("close");
          });
          $('#fs-info').click(function(){
            $('#fs-caption').toggle();
          })

        })
        // When a slide starts to load this is called
        .bind("startLoading", function() {
          // show spinner
          $('#fs-loader').show();
        })
        // When a slide stops to load this is called:
        .bind("stopLoading", function() {
          // hide spinner
          $('#fs-loader').hide();
        })
        // When a slide is shown this is called.
        // The "loading" events are triggered only once per slide.
        // The "start" and "end" events are called every time.
        // Notice the "slide" argument:
        .bind("startOfSlide", function(event, slide) {
          // set and show caption
         
          $('#fs-caption').html(slide.info).fadeIn();
          crea_scrolls_verticals();
        })
        // before a slide is hidden this is called:
        .bind("endOfSlide", function(event, slide) {
          $('#fs-caption').hide();
        });
        $container.trigger("show", 0);
}
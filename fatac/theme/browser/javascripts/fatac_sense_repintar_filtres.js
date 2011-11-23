//TODO: canviar ample quan movem!

function inicialitza_filtres() {

    $(document).ready(function() {

        // -------------------------------------------------------------------------------------------------------
        // scroll vertical d'opcions de filtres
        // -------------------------------------------------------------------------------------------------------

        $('.slideopcions').each(function(i, filtre) { //i és el número, filtre és l'element en sí

            //console.log(filtre);

            var slideopcions = 'slideopcions-' + (i + 1)

            //change the main div to overflow-hidden as we can use the slider now
            $('.' + slideopcions).css('overflow','hidden');

            //compare the height of the scroll content to the scroll pane to see if we need a scrollbar
            var difference = $('.' + slideopcions + ' .opcions').height() - $(filtre).height(); //eg it's 200px longer

            //if the scrollbar is needed, set it up...
            if(difference > 5) {
                var proportion = difference / $('.' + slideopcions + ' .opcions').height(); //eg 200px/500px
                var handleHeight = Math.round((1-proportion)*$('.' + slideopcions).height()); //set the proportional height - round it to make sure everything adds up correctly later on
                handleHeight -= handleHeight%2;

                $('.' + slideopcions + ' .opcions').after('<\div class="slider-wrap" id="slider-wrap-' + i + '"><\div id="slider-vertical"><\/div><\/div>'); //append the necessary divs so they're only there if needed
                $("#slider-wrap-" + i).height($('.' + slideopcions).height()); //set the height of the slider bar to that of the scroll pane

                //set up the slider
                $('#slider-wrap-' + i + ' #slider-vertical').slider({
                    orientation: 'vertical',
                    min: 0,
                    max: 100,
                    value: 100,
                    slide: function(event, ui) {//used so the content scrolls when the slider is dragged
                        var topValue = -((100-ui.value)*difference/100);
                        $('.' + slideopcions + ' .opcions').css({'margin-top':topValue});//move the top up (negative value) by the percentage the slider has been moved times the difference in height
                    },
                    change: function(event, ui) {//used so the content scrolls when the slider is changed by a click outside the handle or by the mousewheel
                        var topValue = -((100-ui.value)*difference/100);
                        $('.' + slideopcions + ' .opcions').css({'margin-top':topValue});//move the top up (negative value) by the percentage the slider has been moved times the difference in height
                    }
                });

                //set the handle height and bottom margin so the middle of the handle is in line with the slider
                $('#slider-wrap-' + i + " .ui-slider-handle").css({height:handleHeight,'margin-bottom':-0.5*handleHeight});
                var origSliderHeight = $('#slider-wrap-' + i + " #slider-vertical").height();//read the original slider height
                var sliderHeight = origSliderHeight - handleHeight ;//the height through which the handle can move needs to be the original height minus the handle height
                var sliderMargin =  (origSliderHeight - sliderHeight)*0.5;//so the slider needs to have both top and bottom margins equal to half the difference
                $('#slider-wrap-' + i + " .ui-slider").css({height:sliderHeight,'margin-top':sliderMargin});//set the slider height and margins
            }

            //afegim barra buida, sense slide
            else {
                $('.' + slideopcions + ' .opcions').after('<\div class="slider-wrap" id="slider-wrap-' + i + '"><!-- --><\/div>');
            }

            //code to handle clicks outside the slider handle
            $('#slider-wrap-' + i + " .ui-slider").click(function(event){ //stop any clicks on the slider propagating through to the code below
                event.stopPropagation();
            });
            $("#slider-wrap-" + i).click(function(event){//clicks on the wrap outside the slider range
                var offsetTop = $(this).offset().top;//read the offset of the scroll pane
                var clickValue = (event.pageY-offsetTop)*100/$(this).height();//find the click point, subtract the offset, and calculate percentage of the slider clicked
                $("#slider-wrap-" + i + " #slider-vertical").slider("value", 100-clickValue);//set the new value of the slider
            });

            //additional code for mousewheel
            $('.' + slideopcions + ', #slider-wrap-' + i).mousewheel(function(event, delta){
                var speed = 15;
                var sliderVal = $('#slider-wrap-' + i + " #slider-vertical").slider("value");//read current value of the slider
                sliderVal += (delta*speed);//increment the current value
                $('#slider-wrap-' + i + " #slider-vertical").slider("value", sliderVal);//and set the new value of the slider
                event.preventDefault();//stop any default behaviour
            });

        });


        // -------------------------------------------------------------------------------------------------------
        // scroll horitzontal de filtres
        // -------------------------------------------------------------------------------------------------------

        var api=$(".scrollable").scrollable({api:true});


        // -------------------------------------------------------------------------------------------------------
        // ampliar i reduir filtres
        // -------------------------------------------------------------------------------------------------------

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
        var altura_total_separadors = 17 * (num_files - 1)
        var altura_contenidor = num_files * altura_fila + altura_total_separadors;

        $("input.mostrar_filtres").click(function(){

            //canvia botó 'mostrar' per botó 'amagar'
            $("input.mostrar_filtres").addClass("hidden");
            $("input.amagar_filtres").removeClass("hidden");

            //amaga les fletxes
            $("a.arrow_left img").addClass("hidden");
            $("a.arrow_right img").addClass("hidden");

            //posa en posició inicial l'scroll horitzontal
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


        // -------------------------------------------------------------------------------------------------------
        // click filtres
        // -------------------------------------------------------------------------------------------------------

        //seleccionar els filtres 'Tots' per defecte
        $('.Tots').addClass('selected');

        $('a.link_filtre').click(function(event){

            //que no s'executi el click
            event.preventDefault();

            //posar o treure classe 'selected', i recalcular querystring
                //si ja estava seleccionat, i no és 'Tots': deseleccionem i l'eliminem de la cerca
                    //si no queda cap marcat, marquem 'Tots'
                //sino:
                    //el seleccionem.
                    //si és 'Tots': desmarquem els que estiguéssin marcats i els eliminem de querystring_actual
                    //si no és 'Tots': desmarquem 'Tots' i afegim el nou filtre a querystring_actual
            nou_filtre = $(this).attr('rel');
            querystring_actual = $('input#querystring').attr('value');
            querystring_nou = '';
            nom_filtre = $(this).attr('class').split(' ')[0] //Year
            //opcio_filtre = $(this).attr('class').split(' ')[1] //1991
            estava_seleccionat = $(this).hasClass('selected')
            es_opcio_tots = $(this).hasClass('Tots')


            if (estava_seleccionat && !es_opcio_tots) {
                $(this).removeClass('selected');
                // .......................................................................................
                querystring_nou = querystring_actual.replace(nou_filtre, '') //querystring_nou: elimino nou_filtre de querystring_actual
                if ($('.' + nom_filtre + '.selected').size() == 0) {
                    $('.' + nom_filtre + '.Tots').addClass('selected');
                }
                // .......................................................................................
            } else {
                if(es_opcio_tots) {
                    $('.' + nom_filtre + '.selected').removeClass('selected');
                    // .......................................................................................
                    // elimino tots els nom_filtre de querystring_actual
                    aux = querystring_actual.split('&');
                    nou = '';
                    for (i=0; i<aux.length; i++) {
                        // si es tracta del filtre f, recalculo aquesta part
                        if(aux[i].indexOf('f=') >= 0) {
                            nou_f = ''
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
                    querystring_nou = nou
                    // .......................................................................................
                } else {
                    $('.' + nom_filtre + '.Tots').removeClass('selected');
                    // .......................................................................................
                    // querystring_nou: afegeixo nou_filtre a querystring_actual
                    if(querystring_actual.indexOf('f=') >= 0) {
                        querystring_nou = querystring_actual + ',' + nou_filtre
                    } else {
                        querystring_nou = querystring_actual + '&f=' + nou_filtre
                    }
                    // .......................................................................................
                }
                $(this).addClass('selected');
            }

            // netejar 'querystring_nou' per si han quedat ',,', '=,' etc. en fer 'replace'
            querystring_nou = querystring_nou.replace(',,', ',').replace('=,', '=')
            // eliminar 'f=' si no hi ha cap filtre aplicat, xq el servei retorna error
            if (querystring_nou.match('&f='+"$")=='&f=') {
                querystring_nou = querystring_nou.replace('&f=', '')
            }
            //replace de '&?' per '?'
            querystring_nou = querystring_nou.replace('&?', '?')

            $('input#querystring').attr('value', querystring_nou);

            // cercaAjaxView és el nom de la vista que volem cridar, entre {} els paràmetres
            // dins function(data){...} el que volem que es faci un cop cridada la vista
            //data conté el que retorna la vista
            $.get('cercaAjaxView', {querystring:querystring_nou}, function(data){
                $('input#querystring').attr('value', querystring_nou);

                //un cop ja hem recalculat la cerca, pintem els resultats
                $.get('resultatsView', {querystring: querystring_nou}, function(data){
                    html_resultats = data;
                    $('div#resultats_cerca').replaceWith(html_resultats);
                });

            });

        });


    });
}
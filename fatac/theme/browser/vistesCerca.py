# -*- coding: utf-8 -*-

from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from funcionsCerca import funcionsCerca
from Products.CMFCore.utils import getToolByName


class filtresView(BrowserView, funcionsCerca):
    """ executa la cerca amb el querystring actual () i pinta l'html dels filtres
    """
    __call__ = ViewPageTemplateFile('templates/filtresview.pt')

    def retFiltres(self):
        """ executa la cerca amb el querystring del request (o l'inicial) i
        retorna una llista de diccionaris amb les dades de cada filtre
        """
        resultat_cerca = self.executaCercaIdsOQuerystring()
        filtres = []

        if resultat_cerca:
            if 'dades_json' in resultat_cerca and 'ordre_filtres' in resultat_cerca:
                dades_json = resultat_cerca['dades_json']
                ordre_filtres = resultat_cerca['ordre_filtres']
                if 'facet_counts' in dades_json and 'facet_fields' in dades_json['facet_counts']:
                    filtres_json = dades_json['facet_counts']['facet_fields']
                    for filtre in ordre_filtres:
                        opcions_json = filtres_json[filtre]  # [u'Video', 45, u'Audio', 38, u'Image', 8, u'Text', 4]
                        if len(opcions_json) > 0:
                            i = 0
                            total = 0
                            opcions = []
                            while i < len(opcions_json):
                                opcions.append({'nom': opcions_json[i], 'num': opcions_json[i + 1]})
                                total += opcions_json[i + 1]
                                i += 2
                            opcions = [{'nom': 'Tots', 'num': total}] + opcions
                            filtres.append({'nom_filtre': filtre, 'opcions': opcions})
        return filtres


class resultatsView(BrowserView, funcionsCerca):
    """ pinta els resultats i les dades referents a la paginació i les opcions
    de visualització
    """
    __call__ = ViewPageTemplateFile('templates/resultatsview.pt')

    def retDadesResultats(self):
        """ crida la vista displayResultatsPaginaView i retorna l'html generat
        """
        portal = getToolByName(self, 'portal_url')
        portal = portal.getPortalObject()
        html = portal.restrictedTraverse('@@displayResultatsPaginaView')()
        return html

    def retDadesPaginacio(self):
        """ calcula i retorna les dades referents a la paginació en un diccionari
        ('pagina_actual', 'num_total_pagines', 'num_obj_inicial', 'num_obj_final', 'num_total_obj', )
        """
        parametres_visualitzacio = self.retParametresVisualitzacio()
        resultat_cerca = self.executaCercaIdsOQuerystring()
        dades_paginacio = {'pagina_actual': '?', 'num_total_pagines': '?', 'num_obj_inicial': '?', 'num_obj_final': '?', 'num_total_obj': '?'}
        if resultat_cerca:
            if 'dades_json' in resultat_cerca:
                dades_json = resultat_cerca['dades_json']
                if 'response' in dades_json and 'numFound' in dades_json['response']:
                    num_resultats = float(dades_json['response']['numFound'])
                    pagina_actual = int(parametres_visualitzacio['pagina_actual'])
                    resultats_per_pagina = float(parametres_visualitzacio['resultats_per_pagina'])
                    import math
                    num_total_pagines = int(math.ceil(num_resultats / resultats_per_pagina))
                    num_obj_inicial = int((pagina_actual * resultats_per_pagina) - resultats_per_pagina + 1)
                    num_obj_final = int((pagina_actual * resultats_per_pagina))
                    if num_obj_final > num_resultats:
                        num_obj_final = int(num_resultats)
                    dades_paginacio = {'pagina_actual': pagina_actual, 'num_total_pagines': num_total_pagines, 'num_obj_inicial': num_obj_inicial, 'num_obj_final': num_obj_final, 'num_total_obj': int(num_resultats)}
        return dades_paginacio

    def retDadesVisualitzacio(self):
        """ retorna el tipus de visualització i zoom actius
        """
        parametres_visualitzacio = self.retParametresVisualitzacio()

        return {'visualitzacio': parametres_visualitzacio['visualitzacio'], 'zoom': parametres_visualitzacio['zoom']}

    def retTipusEntrada(self):
        """ pel selector de tipus d'entrada, retorna una llista de diccionaris
        amb les opcions possibles, formades per filtres 'class' amb resultats
        """
        resultat_cerca = self.executaCercaIdsOQuerystring()
        opcions = []
        if resultat_cerca:
            if 'dades_json' in resultat_cerca and 'ordre_filtres' in resultat_cerca:
                dades_json = resultat_cerca['dades_json']
                if 'facet_counts' in dades_json and 'facet_fields' in dades_json['facet_counts']:
                    filtres_json = dades_json['facet_counts']['facet_fields']
                    if 'class' in filtres_json:
                        classes = filtres_json['class']
                        if len(classes) > 0:
                            i = 0
                            opcions = []
                            while i < len(classes):
                                num = classes[i + 1]
                                if num > 0:
                                    opcions.append(classes[i])
                                i += 2
        opcio_inicial = ''
        altres_opcions = []
        if len(opcions) > 0:
            opcio_inicial = opcions[0]
        if len(opcions) > 1:
            altres_opcions = opcions[1:len(opcions)]
        return {'opcio_selec': opcio_inicial, 'altres_opcions': altres_opcions}

    def retTipusOrdre(self):
        """ pel selector de tipus d'ordre, retorna un diccionari amb la opció
        seleccionada i una llista amb la resta d'opcions possibles
        """
        parametres_visualitzacio = self.retParametresVisualitzacio()
        if 'querystring' in parametres_visualitzacio:
            conf = ''
            if 'conf' in parametres_visualitzacio['querystring']:
                conf = parametres_visualitzacio['querystring']['conf']
            clau = conf == 'Explorar' and 'Explorar' or 'default'
            altres_opcions = self.retTipusOrdenacio(clau)
            opcio_selec = 'sort' in parametres_visualitzacio['querystring'] and parametres_visualitzacio['querystring']['sort'] or (len(altres_opcions) > 0 and altres_opcions[0] or '')
            if opcio_selec in altres_opcions:
                altres_opcions.remove(opcio_selec)
            llista_altres_opcions = []
            for o in altres_opcions:
                llista_altres_opcions.append({'opcio': o, 'nom': o.split('+')[0]})

            return {'opcio_selec': {'opcio': opcio_selec, 'nom': opcio_selec.split('+')[0]}, 'altres_opcions': llista_altres_opcions}
        else:
            return {'opcio_selec': '', 'altres_opcions': []}


class displayResultatsPaginaView(BrowserView, funcionsCerca):
    """ pinta l'html corresponent als resultats de la pàgina actual (sense
    controls de visualització)
    """
    __call__ = ViewPageTemplateFile('templates/displayresultatspaginaview.pt')

    def retNumPagina(self):
        """ retorna el número de pàgina que cal pintar pintar
        """
        parametres_visualitzacio = self.retParametresVisualitzacio()
        return int(parametres_visualitzacio['pagina_actual'])

    def retDades(self):
        """ retorna l'html dels resultats de la pàgina actual
        (només els resultats en sí, no els controls de visualització)
        """
        portal = getToolByName(self, 'portal_url')
        portal = portal.getPortalObject()
        html = portal.restrictedTraverse('@@genericView')()
        return html


class cercaInicialView(BrowserView, funcionsCerca):
    """ vista que pinta l'entorn plone, crida les vistes que pinten els filtres
    i els resultats (i executen la cerca, que queda cachejada) i inicialitza el
    codi js que gestionarà els events.
    """
    __call__ = ViewPageTemplateFile('templates/cercaview.pt')

    def getS(self):
        """
        """
        return self.request.get('s')


class cercaAjaxView(BrowserView, funcionsCerca):
    """ vista cridada des del codi js, que executa la cerca amb el querystring o
    llista_ids i en cacheja els resultats
    """

    def __call__(self, querystring=None):
        """ executa la cerca amb els paràmetre sde visualització actuals
        """
        return self.executaCercaIdsOQuerystring()


class explorarView(BrowserView, funcionsCerca):
    """
    """
    __call__ = ViewPageTemplateFile('templates/explorarview.pt')


class demoView(BrowserView, funcionsCerca):
    """ Vista creada per fer proves de pintar la visualització de resultats amb una llista de ids
    """
    __call__ = ViewPageTemplateFile('templates/demoview.pt')

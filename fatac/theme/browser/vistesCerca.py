# -*- coding: utf-8 -*-

from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from funcionsCerca import funcionsCerca
from Products.CMFCore.utils import getToolByName
import ast


class filtresView(BrowserView, funcionsCerca):
    """ vista que executa la cerca amb el querystring actual () i pinta l'html dels filtres
    """
    __call__ = ViewPageTemplateFile('templates/filtresview.pt')

    def retFiltres(self):
        """ executa la cerca amb el querystring del request (o l'inicial) i
        retorna una llista de diccionaris amb les dades de cada filtre
        """
        #si no ens passen cap querystring, consultem l'inicial
        querystring = self.request.get('querystring', self.retQuerystringInicial())
        filtres = []
        resultat_cerca = self.executaCerca(querystring)
        if resultat_cerca:
            dades_json = resultat_cerca['dades_json']
            ordre_filtres = resultat_cerca['ordre_filtres']
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
    """ vista que executa la cerca amb el querystring actual i pinta els resultats
     i les dades referents a la paginació i les opcions de visualització
    """
    __call__ = ViewPageTemplateFile('templates/resultatsview.pt')

    def retDadesVisualitzacio(self):
        """
        """
        visualitzacio = self.request.get('visualitzacio')
        zoom = self.request.get('zoom')
        return {'visualitzacio': visualitzacio, 'zoom': zoom}

    def retDadesPaginacio(self):
        """
        """
        querystring = self.request.get('querystring', self.retQuerystringInicial())
        resultat_cerca = self.executaCerca(querystring)
        dades_paginacio = {'pagina_actual': '?', 'num_total_pagines': '?', 'num_obj_inicial': '?', 'num_obj_final': '?'}
        if resultat_cerca:
            dades_json = resultat_cerca['dades_json']
            num_resultats = float(dades_json['response']['numFound'])
            pagina_actual = int(self.request.get('pagina_actual', '1'))
            resultats_per_pagina = float(self.request.get('resultats_per_pagina', self.resultatsPerPaginaInicial()))
            import math
            num_total_pagines = int(math.ceil(num_resultats / resultats_per_pagina))
            num_obj_inicial = int((pagina_actual * resultats_per_pagina) - resultats_per_pagina + 1)
            num_obj_final = int((pagina_actual * resultats_per_pagina))
            if num_obj_final > num_resultats:
                num_obj_final = int(num_resultats)
            dades_paginacio = {'pagina_actual': pagina_actual, 'num_total_pagines': num_total_pagines, 'num_obj_inicial': num_obj_inicial, 'num_obj_final': num_obj_final}
        return dades_paginacio

    def retDadesResultats(self):
        """
        """
        querystring = self.request.get('querystring', self.retQuerystringInicial())
        visualitzacio = self.request.get('visualitzacio', 'imatge')
        zoom = self.request.get('zoom', '1')
        pagina_actual = self.request.get('pagina_actual', '1')
        resultats_per_pagina = int(self.request.get('resultats_per_pagina', self.resultatsPerPaginaInicial()))

        self.request.set('querystring', querystring)
        self.request.set('visualitzacio', visualitzacio)
        self.request.set('zoom', zoom)
        self.request.set('pagina_a_mostrar', pagina_actual)
        self.request.set('resultats_per_pagina', resultats_per_pagina)

        portal = getToolByName(self, 'portal_url')
        portal = portal.getPortalObject()
        html = portal.restrictedTraverse('@@displayResultatsPaginaView')()
        return html


class displayResultatsPaginaView(BrowserView, funcionsCerca):
    """
    """
    __call__ = ViewPageTemplateFile('templates/displayresultatspaginaview.pt')

    def retDades(self):
        """ retorna les dades necessàries per pintar els resultats de la pàgina 'pagina_a_pintar'
        (només els resultats en sí, no els controls de visualització)
        """
        #resultats = self.request.get('resultats[]')  # TODO: no sé per què cal afegir [], però és el que arriba per request
        querystring = self.request.get('querystring')
        resultat_cerca = self.executaCerca(querystring)
        if resultat_cerca:
            dades_json = resultat_cerca['dades_json']
            resultats = dades_json['response']['docs']

            resultats_per_pagina = int(self.request.get('resultats_per_pagina'))
            pagina_a_mostrar = int(self.request.get('pagina_a_mostrar'))

            num_obj_inicial = (pagina_a_mostrar * resultats_per_pagina) - resultats_per_pagina + 1
            num_obj_final = (pagina_a_mostrar * resultats_per_pagina)

            visualitzacio = self.request.get('visualitzacio')
            zoom = self.request.get('zoom')
            self.request.set('visualitzacio', visualitzacio)
            self.request.set('zoom', zoom)

            portal = getToolByName(self, 'portal_url')
            portal = portal.getPortalObject()
            dades_resultats = []
            for resultat in resultats[num_obj_inicial - 1:num_obj_final]:
                self.request.set('idobjecte', resultat['id'])
                html = portal.restrictedTraverse('@@genericView')()
                dades_resultats.append({'id': resultat['id'], 'html': html})

            return {'dades_resultats': dades_resultats}
        return {'dades_resultats': []}


class cercaInicialView(BrowserView, funcionsCerca):
    """ vista que pinta l'entorn plone, crida les vistes que pinten els filtres
    i els resultats (i executen la cerca, que queda cacheada) i inicialitza el
    codi js que gestionarà els events.
    """
    __call__ = ViewPageTemplateFile('templates/cercaview.pt')

    def retFiltresView(self):
        """ retorna l'html retornat per la vista @@filtresView
        """
        #return self.context.restrictedTraverse('/filtresView')
        #TODO: correcte fer-ho servir amb portal? cal? té un cost elevat?
        portal = getToolByName(self, 'portal_url')
        portal = portal.getPortalObject()
        return portal.restrictedTraverse('@@filtresView')()

    def retResultatsView(self):
        """ retorna l'html retornat per la vista @@resultatsView
        """
        #return self.context.restrictedTraverse('/resultatsView')
        #TODO: correcte fer-ho servir amb portal? cal? té un cost elevat?
        portal = getToolByName(self, 'portal_url')
        portal = portal.getPortalObject()
        return portal.restrictedTraverse('@@resultatsView')()


class cercaAjaxView(BrowserView, funcionsCerca):
    """ vista cridada des del codi js, que executa la cerca amb el querystring
    rebut com a paràmetre o per request, i cacheja els resultats
    """

    def __call__(self, querystring=None):
        """ obté querystring dels paràmetre so per request, i crida cerca()
        """
        querystring = querystring != None and querystring or self.request.get('querystring',)
        return self.cerca(querystring)

    def cerca(self, querystring):
        """ executa la cerca (cahcejant els resultats) i retorna el querystring
        """
        self.executaCerca(querystring)  # per cachejar la nova cerca, si cal
        return querystring
# -*- coding: utf-8 -*-

from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from funcionsCerca import funcionsCerca
from Products.CMFCore.utils import getToolByName


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
    """ vista que executa la cerca amb el querystring actual () i pinta l'html dels resultats
    """
    __call__ = ViewPageTemplateFile('templates/resultatsview.pt')

    def retResultats(self):
        """ executa la cerca amb el querystring del request (o l'inicial) i
        retorna una llista de diccionaris amb les dades de cada resultat
        """
        #si no ens passen cap querystring, consultem l'inicial
        querystring = self.request.get('querystring', self.retQuerystringInicial())
        dades_resultats = []
        resultat_cerca = self.executaCerca(querystring)
        if resultat_cerca:
            dades_json = resultat_cerca['dades_json']
            resultats = dades_json['response']['docs']
            for resultat in resultats:
                portal = getToolByName(self, 'portal_url')
                portal = portal.getPortalObject()
                self.request.set('idobjecte', resultat['id'])
                visualitzacio = self.request.get('visualitzacio', 'imatge')
                self.request.set('visualitzacio', visualitzacio)
                zoom = self.request.get('zoom', '1')
                self.request.set('zoom', zoom)
                html = portal.restrictedTraverse('@@genericView')()
                dades_resultats.append({'id': resultat['id'], 'html': html})
        return dades_resultats


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

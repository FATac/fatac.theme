# -*- encoding: utf-8 -*-
from zope.publisher.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from Products.CMFCore.utils import getToolByName
from funcionsCerca import funcionsCerca


class homeView(BrowserView, funcionsCerca):
    """ Home page default view
    """
    __call__ = ViewPageTemplateFile('templates/homeview.pt')

    def __init__(self, context, request):
        BrowserView.__init__(self, context, request)
        self.context = context
        self.request = request

    def getFrontPage(self):
        """ si existeix un Document amb id 'textintro', en retorna el contingut.
        """
        brain = self.context.portal_catalog.searchResults(portal_type='Document', id='textintro')[:1]
        for i in brain:
            trad = i.getObject().getTranslation()
            if trad:
                return trad.CookedBody()
        return None

    def retUltimsDocuments(self):
        """ executa la cerca dels últims documents i retorna una llista de
        diccionaris amb les dades de cada resultat
        """
        resultat_cerca = self.executaCercaUltimsDocuments()
        dades_resultats = []
        if resultat_cerca:
            dades_json = resultat_cerca['dades_json']
            resultats = dades_json['response']['docs']
            portal = getToolByName(self, 'portal_url')
            portal = portal.getPortalObject()
            self.request.set('visualitzacio', 'fitxa_home')
            for resultat in resultats:
                self.request.set('idobjecte', resultat['id'])
                html = portal.restrictedTraverse('@@genericView')()
                dades_resultats.append({'id': resultat['id'], 'html': html})
        return dades_resultats

    def retUltimsConsultats(self):
        """ executa la cerca dels últims consultats i retorna una llista de
        diccionaris amb l'id i l'html de cada resultat segons la visualització
        seleccionada
        """
        resultat_cerca = self.executaCercaUltimsConsultats()
        dades_resultats = []
        if resultat_cerca:
            dades_json = resultat_cerca['dades_json']
            resultats = dades_json['response']['docs']
            portal = getToolByName(self, 'portal_url')
            portal = portal.getPortalObject()
            self.request.set('visualitzacio', 'fitxa_home')
            for resultat in resultats:
                self.request.set('idobjecte', resultat['id'])
                html = portal.restrictedTraverse('@@genericView')()
                dades_resultats.append({'id': resultat['id'], 'html': html})
        return dades_resultats

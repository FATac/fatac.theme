# -*- encoding: utf-8 -*-
from zope.publisher.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from zope.component import getMultiAdapter
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
        """ retorna la pagina principal de l'espai, tenint en compte l'idioma i
        els permissos de lusuari validat, amb un restrictedTraverse sobre l'objecte
        """
        page = {}
        portal_state = getMultiAdapter((self.context, self.request), name=u'plone_portal_state')
        portal = portal_state.portal()
        FrontPageObj = portal.textintro.getTranslation()
        idFrontPageObj = FrontPageObj.id
        traversal = portal.restrictedTraverse(idFrontPageObj)
        page['body'] = FrontPageObj.CookedBody()
        return page

    def retUltimsDocuments(self):
        """ executa la cerca dels últims documents i retorna una llista de
        diccionaris amb les dades de cada resultat
        """
        resultat_cerca = self.executaCercaUltimsDocuments()
        dades_resultats = []
        if resultat_cerca:
            dades_json = resultat_cerca['dades_json']
            resultats = dades_json['response']['docs']
            for resultat in resultats:
                portal = getToolByName(self, 'portal_url')
                portal = portal.getPortalObject()
                self.request.set('idobjecte', resultat['id'])
                self.request.set('visualitzacio', 'fitxa_home')
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
            for resultat in resultats:
                portal = getToolByName(self, 'portal_url')
                portal = portal.getPortalObject()
                self.request.set('idobjecte', resultat['id'])
                self.request.set('visualitzacio', 'fitxa_home')
                html = portal.restrictedTraverse('@@genericView')()
                dades_resultats.append({'id': resultat['id'], 'html': html})
        return dades_resultats

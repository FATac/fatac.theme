# -*- coding: utf-8 -*-
from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile

from Products.CMFCore.utils import getToolByName


class comentarisLlibre(BrowserView):
    """ classe per generar una vista html del llibre
    """

    def __init__(self, context, request):
        """ self.servidorRest guarda l'adreça del servidor Rest que serveix les
        dades; self.idobjectes guarda l'id del/s objecte/s del que volem mostrar
        """
        super(BrowserView, self).__init__(context, request)
        self.request = request
        self.context = context
        self.llibre = self.request.get('llibre')
        self.title = self.request.get('title')

    def __call__(self):
        """
        """
        return ViewPageTemplateFile('templates/comentarisLlibre.pt')(self)
  

    def getLlibre(self):        
        id_llibre = self.context.id
        portal = getToolByName(self.context, 'portal_url').getPortalObject()
        llibre = portal.portal_catalog.searchResults(portal_type="fatac.dummy", path='/fatac/ac/'+id_llibre)   
        url_llibre = llibre[0].getURL() 
        return url_llibre
    
    def PaginesLlibre(self):        
        id_llibre = self.context.id
        portal = getToolByName(self.context, 'portal_url').getPortalObject()
        workflow = getToolByName(self.context,'portal_workflow')
        pagines = portal.portal_catalog.searchResults(portal_type="fatac.paginaLlibre", path='/fatac/ac/'+id_llibre, sort_on='getObjPositionInParent')
        results = []       
        for pagina in pagines:
                id_pagina = pagina.id
                obj = pagina.getObject() 
                results.append(dict(title=obj.title_or_id(),
                                    url=pagina.getURL(), 
                                    url_edit=pagina.getURL() + '/edit',   
                                    status = workflow.getInfoFor(obj,'review_state'), 
                                    comentaris = [i for i in  portal.portal_catalog.searchResults(portal_type="Discussion Item", path='/fatac/ac/'+id_llibre+'/'+obj.title_or_id())],  
                                    )

                               )            
        return results     
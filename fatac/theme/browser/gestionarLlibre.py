# -*- coding: utf-8 -*-
from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile

from Products.CMFCore.utils import getToolByName


class gestionarLlibre(BrowserView):
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
        return ViewPageTemplateFile('templates/gestionarLlibre.pt')(self)


    def DetallsPagina(self, pagina, id_llibre):    
        details = []
        id_pagina = pagina.id

        portal = getToolByName(self.context, 'portal_url').getPortalObject()
        workflow = getToolByName(self.context,'portal_workflow')
        detalls = portal.portal_catalog.searchResults(portal_type="fatac.detallLlibre", path='/fatac/ac/'+id_llibre+'/'+id_pagina, sort_on='getObjPositionInParent')       

        for detall in detalls:            
            id_pagina = detall.id
            obj = detall.getObject()  
            details.append(dict(title=obj.title_or_id(), 
                                url=detall.getURL(),  
                                status = workflow.getInfoFor(obj,'review_state'),                                                        
                              )
                        )         
        return details[0:]
   

    
    def NotesPagina(self, pagina, id_llibre):    
        notes = []
        id_pagina = pagina.id

        portal = getToolByName(self.context, 'portal_url').getPortalObject()
        workflow = getToolByName(self.context,'portal_workflow')
        notespagina = portal.portal_catalog.searchResults(portal_type="fatac.notaLlibre", path='/fatac/ac/'+id_llibre+'/'+id_pagina, sort_on='getObjPositionInParent')       
        for nota in notespagina:            
            id_nota = nota.id
            obj = nota.getObject()   
            notes.append(dict(title=obj.title, 
                              text=obj.text,   
                              url=nota.getURL(),
                              status = workflow.getInfoFor(obj,'review_state'),                                                       
                              )
                        )         
        return notes[0:]


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
                                    detalls = self.DetallsPagina(obj, id_llibre),                              
                                    notes = self.NotesPagina(obj, id_llibre),                                     
                                    comentaris = [i for i in  portal.portal_catalog.searchResults(portal_type="Discussion Item", path='/fatac/ac/'+id_llibre+'/'+id_pagina)],  
                                    )

                               )            
        return results     
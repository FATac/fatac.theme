# -*- coding: utf-8 -*-
from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile

from Products.CMFCore.utils import getToolByName
from fatac.theme.browser.genericView import genericView
import json

from datetime import datetime
from DateTime import DateTime

class jsonLlibre(genericView):
    """ classe per generar una vista html del llibre
    """

    def __init__(self, context, request):
        """ self.servidorRest guarda l'adreça del servidor Rest que serveix les
        dades; self.idobjectes guarda l'id del/s objecte/s del que volem mostrar
        """
        #super(BrowserView, self).__init__(context, request)
        super(genericView, self).__init__(context, request)
        self.request = request
        self.context = context
        self.servidorRest = self.retServidorRest()
        self.rest_public = self.getSettings('rest_public_server')
        self.zoom = None
        self.visualitzacio = None
        self.idobjectes = None
        self.uidParam = self.getUIDParam()
        self.resultat_cerca = None
        self.idobjectes = None
        # self.request = request
        # self.context = context
        # self.llibre = self.request.get('llibre')
        # self.title = self.request.get('title')

    def __call__(self):
        """
        """
        return ViewPageTemplateFile('templates/jsonLlibre.pt')(self)
    

    def DetallsPagina(self, pagina, id_llibre):    
        details = []
        id_pagina = pagina.id

        portal = getToolByName(self.context, 'portal_url').getPortalObject()
        detalls = portal.portal_catalog.searchResults(portal_type="fatac.detallLlibre", path='/fatac/ac/'+id_llibre+'/'+id_pagina, review_state=['published'], sort_on='getObjPositionInParent')       

        for detall in detalls:            
            id_pagina = detall.id
            obj = detall.getObject()  
            url_image = detall.getURL() + '/@@download/picture/' +  obj.picture.filename.encode() 
            details.append(dict(title=obj.title, 
                                url=url_image,                                                          
                              )
                        )         
        return details[0:]

    def NotesPagina(self, pagina, id_llibre):    
        notes = []
        id_pagina = pagina.id

        portal = getToolByName(self.context, 'portal_url').getPortalObject()
        notespagina = portal.portal_catalog.searchResults(portal_type="fatac.notaLlibre", path='/fatac/ac/'+id_llibre+'/'+id_pagina, review_state=['published'], sort_on='getObjPositionInParent')       
        for nota in notespagina:            
            id_nota = nota.id
            obj = nota.getObject()   
            notes.append(dict(title=obj.title, 
                              text=obj.text,                                                          
                              )
                        )         
        return notes[0:]

    def CommentsPagina(self, pagina, id_llibre):    
        comments = []
        id_pagina = pagina.id

        portal = getToolByName(self.context, 'portal_url').getPortalObject()
        commentspagina = portal.portal_catalog.searchResults(portal_type="Discussion Item", path='/fatac/ac/'+id_llibre+'/'+id_pagina)       
        for comentari in commentspagina:            
            id_comentari = comentari.id
            obj = comentari.getObject() 
            comments.append(dict(title=obj.Title(), 
                                 text=obj.text.encode(),  
                                 author=obj.author_name,  
                                 date='%s/%s/%s' % (obj.creation_date.year, obj.creation_date.month, obj.creation_date.day),                    
                              )
                        )         
        return comments[0:]


    def getProportion(self, obj):
        ret = obj.pagina.getImageSize()
        ample, alt = ret
        if ample > alt:
            proportion = 'horitzontal'
        elif ample < alt:
            proportion = 'vertical'
        else:
            proportion = ''
        return proportion

    def PaginesLlibre(self, llibre):        

        pages = []
        id_llibre = llibre.id

        portal = getToolByName(self.context, 'portal_url').getPortalObject()
        pagines = portal.portal_catalog.searchResults(portal_type="fatac.paginaLlibre", path='/fatac/ac/'+id_llibre, review_state=['published'], sort_on='getObjPositionInParent')           

        for pagina in pagines:            
            id_pagina = pagina.id
            obj = pagina.getObject()
            url_image = pagina.getURL() + '/@@download/pagina/' +  obj.pagina.filename.encode()           
            pages.append(dict(title=obj.title,   
                              image=url_image, 
                              url=pagina.getURL(),
                              proportion=self.getProportion(obj),                  
                              details=self.DetallsPagina(obj, id_llibre),  
                              notes=self.NotesPagina(obj, id_llibre),   
                              comments=self.CommentsPagina(obj, id_llibre),                                                  
                              )
                        )              
        return pages[0:]
      

    def dades_llibre(self):
        """
        """
        dades_json = self.retAllSections()  # retorna diccionari
        resultat = []   
        year = ''   
        autor = ''  
        if dades_json:
            i = 0
            for objecte in dades_json:
                id_objecte = self.idobjectes[i]
                i += 1
                if 'sections' in objecte:
                    titol_objecte = self.getTitolObjecte(objecte['sections'])

                    dades_seccions = []
                    for seccio in objecte['sections']:                    
                        dades = []
                        if 'data' in seccio:
                            for dada in seccio['data']:
                                dada_llegida = self.llegirDada(dada)  # {'nom': nom, 'tipus': tipus, 'valor': valor}
                                if dada_llegida['nom'] == u'Autor':
                                    autor = dada_llegida['valor']    
                                elif dada_llegida['nom'] == u'Authors':
                                    autor = dada_llegida['valor'][0]['text']    
                                if dada_llegida['nom'] == u'Date' or dada_llegida['nom'] == u'Year':
                                    year = dada_llegida['valor']      
                          
                    dades_objecte = {'id': id_objecte,
                                     'title': titol_objecte,
                                     'classe': objecte['className'],
                                     'nom_classe': objecte['className'].replace("ac:", ""),                                     
                                     'year': year,
                                     'author': autor,}
                    resultat.append(dades_objecte)

        return resultat

    def jsonLlibre(self):      
        context = self.context
        request = self.request
        request.response.setHeader("content-type", "application/json")

        llibre = []    
        pages = []   
        year = ''
        autor = ''
        
        id_llibre = self.context.id
        portal = getToolByName(self.context, 'portal_url').getPortalObject()
        llibre = portal.portal_catalog.searchResults(portal_type="fatac.dummy", path='/fatac/ac/'+id_llibre)
        
        obj = llibre[0].getObject()    
        idobjecte = obj.id
        self.idobjectes = [idobjecte]

        dades = self.dades_llibre()
              
        llibre = {                     
            'title': dades[0]['title'],
            'author': dades[0]['author'],
            'year': dades[0]['year'],
            'url': self.context.portal_url() + '/ac/' + idobjecte,
            'pages': self.PaginesLlibre(obj),            
        }       
           
        return json.dumps(llibre)
   
# -*- coding: utf-8 -*-

from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from funcionsCerca import funcionsCerca
import urllib2
import json


class genericView(BrowserView, funcionsCerca):
    """ classe per generar una vista html genèrica vàlida per qualsevol tipus
    d'objecte, amb qualsevol número i tipus de camps.
    Donat un identificacor, demana les dades a un servidor Rest que se les envia
    en format JSON.
    """

    def __init__(self, context, request):
        """ self.servidorRest guarda l'adreça del servidor Rest que serveix les
        dades; self.idobjectes guarda l'id del/s objecte/s del que volem mostrar
        """
        self.request = request
        self.context = context
        self.servidorRest = self.retServidorRest()
        self.zoom = None
        self.visualitzacio = None
        self.idobjectes = None

        parametres_visualitzacio = self.retParametresVisualitzacio()
        idobjecte = self.request.get('idobjecte')
        if idobjecte:
            self.idobjectes = [idobjecte]
            self.zoom = self.request.get('zoom')
            self.visualitzacio = self.request.get('visualitzacio')

        elif parametres_visualitzacio:
            resultat_cerca = self.executaCercaIdsOQuerystring()
            if resultat_cerca:
                if 'dades_json' in resultat_cerca:
                    dades_json = resultat_cerca['dades_json']
                    if 'response' in dades_json and 'docs' in dades_json['response']:
                        resultats = dades_json['response']['docs']
                        resultats_per_pagina = int(parametres_visualitzacio['resultats_per_pagina'])
                        pagina_a_mostrar = int(parametres_visualitzacio['pagina_actual'])
                        num_obj_inicial = (pagina_a_mostrar * resultats_per_pagina) - resultats_per_pagina
                        num_obj_final = (pagina_a_mostrar * resultats_per_pagina)

                        idobjectes = []
                        for resultat in resultats[num_obj_inicial:num_obj_final]:
                            idobjectes.append(resultat['id'])
                        self.idobjectes = idobjectes

            if 'zoom' in parametres_visualitzacio:
                self.zoom = parametres_visualitzacio['zoom']
            if 'visualitzacio' in parametres_visualitzacio:
                self.visualitzacio = parametres_visualitzacio['visualitzacio']

    def __call__(self):
        """
        """
        if self.visualitzacio == 'imatge':
            return ViewPageTemplateFile('templates/genericview_imatge.pt')(self)
        elif self.visualitzacio == 'fitxa_home':
            return ViewPageTemplateFile('templates/genericview_fitxa_home.pt')(self)
        elif self.visualitzacio == 'fitxa_cerca':
            return ViewPageTemplateFile('templates/genericview_fitxa_cerca.pt')(self)
        elif self.visualitzacio == 'fitxa_ampliada_cerca':
            return ViewPageTemplateFile('templates/genericview_fitxa_ampliada_cerca.pt')(self)
        elif self.visualitzacio == 'hover_cerca':
            return ViewPageTemplateFile('templates/genericview_hover_cerca.pt')(self)
        elif self.visualitzacio == 'fitxa_ampliada_cerca_overlay':
            return ViewPageTemplateFile('templates/fitxa_ampliada_cerca_overlay.pt')(self)
        else:
            return ViewPageTemplateFile('templates/genericview.pt')(self)


    #===========================================================================
    # funcions que retornen les dades necessàries per pintar cada vista
    #===========================================================================

    def dades_genericview_header(self):
        """
        """
        dades_json = self.retSectionHeader()  # retorna diccionari
        resultat = []
        if dades_json:
            i = 0
            for objecte in dades_json:
                id_objecte = self.idobjectes[i]
                i += 1
                titol_objecte = self.getTitolObjecte(objecte['sections'])

                dades = []
                for seccio in objecte['sections']:
                    if seccio['name'] == 'header':
                        for dada in seccio['data']:
                            dades.append(self.llegirDada(dada))

                dades_objecte = {'id': id_objecte,
                                 'titol': titol_objecte,
                                 'classe': objecte['className'],
                                 'thumbnail_classe': self.getThumbnailClasse(objecte['className']),
                                 'thumbnail_objecte': self.getThumbnailObjecte(id_objecte),
                                 'dades_header': dades}
                resultat.append(dades_objecte)
        return resultat


    #===========================================================================
    # funcions auxiliars
    #===========================================================================

    def getTitolObjecte(self, seccions):
        """ donat un array de seccions, busca la seccio 'header' i retorna un
        string concatenant els strings del primer camp
        """
        for seccio in seccions:
            if seccio['name'] == 'header':
                titol_objecte = self.llegirDada(seccio['data'][0])['valor']
                return titol_objecte

    def getThumbnailObjecte(self, idobjecte):
        """ crida el servei que retorna el thumbnail de l'objecte
        """
        return self.servidorRest + '/resource/' + idobjecte + '/thumbnail'

    def getThumbnailClasse(self, classe):
        """ crida el servei que retorna el thumbnail de la classe donada
        """
        return self.servidorRest + '/classes/' + classe + '/thumbnail'

    def getMedia(self):
        """ retorna el media associat a l'objecte self.idobjecte
        """
        url = self.servidorRest + '/objects/' + self.idobjecte + '/media'
        return url


    #===========================================================================
    # funcions per cridar serveis
    #===========================================================================

    def retSectionHeader(self):
        """
        """
        if self.idobjectes:
            import string
            idobjectes_str = string.join(self.idobjectes, ',')
            url = self.servidorRest + '/resource/' + idobjectes_str + '/view?section=header'
            #TODO: esborrar quan acabem de testejar
            import time
            t0 = time.time()
            self.context.plone_log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Inici crida: ' + url)
            request = urllib2.urlopen(url)
            read = request.read()
            self.context.plone_log('Fi crida  %.3f segons (%d)Kb' % (time.time() - t0, len(read) / 1024))
            if read:
                dades_json = json.loads(read)  # retorna diccionari
                #si demanem més d'un id concatenats, retorna array de diccionaris; sinó, retorna només diccionari
                if len(self.idobjectes) == 1:
                    dades_json = [dades_json]
                return dades_json
        return


    #===========================================================================
    # funcions per llegir tipus de dades de json
    #===========================================================================

    def llegirDada(self, dada):
        """
        """
        #if dada['type'] == 'text':
        #   return {'nom': dada['name'], 'tipus': dada['type'], 'valor': self.getTextType(dada)}
        valor = getattr(self, 'get_%s_dada' % (dada['type']))(dada)
        return {'selfm': dada['name'], 'tipus': dada['type'], 'valor': valor}

    def get_text_dada(self, dades):
        """ donat un diccionari de tipus {u'type': u'text', u'name': u'Title',
        u'value': [u'Rainer Oldendorf']} retorna un string format pels strings
        dins el 'value' concatenats amb ', '
        """
        titol = ''
        for i in dades['value']:
            if titol != '':
                titol += ', '
            titol += i
        return titol

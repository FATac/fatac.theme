# -*- coding: utf-8 -*-

from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from funcionsCerca import funcionsCerca
import urllib2
import json
from Products.CMFPlone.utils import _createObjectByType
import logging


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
            #return ViewPageTemplateFile('templates/genericview.pt')(self)

            # http://localhost:8084/Plone/genericView?idobjecte=Angela_RicciLucchi
            # self.request.REQUEST.environ['QUERY_STRING'][10:] --> Angela_RicciLucchi
            # value = self.context.portal_catalog.searchResults(portal_type='fata.ghost', id=idobject) --> ok, existeix!
            # obtenim id de la url
            idobject = self.request.REQUEST.environ['QUERY_STRING'][10:]
            # http://ec2-107-20-10-248.compute-1.amazonaws.com:8080/ArtsCombinatoriesRest/resource/Angela_RicciLucchi/exists
            # Mirem si l'objecte existeix al servidor REST i cal crear-lo a Plone (si no s'ha creat amb anterioritat)
            crear_objecte = self.existObjectRest(idobject)
            if crear_objecte == 'true':
                # Busquem si ja estava creat al Plone, sino el creem
                value = self.context.portal_catalog.searchResults(portal_type='fatac.dummy', id=idobject)
                # Si no existeix el creem fantasma per afegir commentaris
                if not value:
                    _createObjectByType('fatac.dummy', self.context, idobject)
                # Retornem la vista de l'objecte que ja permet afegir els commentaris
                return self.request.REQUEST.RESPONSE.redirect(self.context.portal_url() + '/' + idobject)
            else:
                # L'objecte que es passa per string no s'ha de crear o no existeix, retornem ERROR
                logging.exception("Can't create object in Plone, the ID %s doesn't exist in REST server", idobject)
                raise AttributeError

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
                if objecte and 'sections' in objecte:
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

    def dades_genericview_all_sections(self):
        """
        """
        dades_json = self.retAllSections()  # retorna diccionari
        resultat = []
        if dades_json:
            i = 0
            for objecte in dades_json:
                id_objecte = self.idobjectes[i]
                i += 1
                titol_objecte = self.getTitolObjecte(objecte['sections'])
                titol_zona_resultats = self.context.translate('visualitzacio_' + objecte['className'], domain='fatac')

                dades_seccions = []
                te_subcerca = 'sense_subcerca'
                hi_ha_seccio_content = False
                for seccio in objecte['sections']:
                    if seccio['name'] == 'content':
                        hi_ha_seccio_content = True
                    dades = []
                    if 'data' in seccio:
                        for dada in seccio['data']:
                            dades.append(self.llegirDada(dada))  # {'nom': nom, 'tipus': tipus, 'valor': valor}
                            if dada['type'] == 'search':
                                te_subcerca = 'amb_subcerca'
                        dades_seccions.append({'nom': seccio['name'], 'dades': dades})

                dades_objecte = {'id': id_objecte,
                                 'titol': titol_objecte,
                                 'classe': objecte['className'],
                                 'thumbnail_classe': self.getThumbnailClasse(objecte['className']),
                                 'thumbnail_objecte': self.getThumbnailObjecte(id_objecte),
                                 'dades_seccions': dades_seccions,
                                 'te_subcerca': te_subcerca,
                                 'titol_zona_resultats': titol_zona_resultats,
                                 'hi_ha_seccio_content': hi_ha_seccio_content}
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

    def getServidorRest(self):
        """ retorna la url del servidor rest
        """
        return self.servidorRest

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
            self.context.plone_log('Fi urlopen  %.3f segons' % (time.time() - t0))
            read = request.read()
            if read:
                dades_json = json.loads(read)  # retorna diccionari
                #si demanem més d'un id concatenats, retorna array de diccionaris; sinó, retorna només diccionari --> el convertim en array
                if len(self.idobjectes) == 1:
                    dades_json = [dades_json]
                return dades_json
        return

    def retAllSections(self):
        """
        """
        if self.idobjectes:
            import string
            idobjectes_str = string.join(self.idobjectes, ',')
            url = self.servidorRest + '/resource/' + idobjectes_str + '/view?section=header,body,content,footer'
            #TODO: esborrar quan acabem de testejar
            import time
            t0 = time.time()
            self.context.plone_log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Inici crida: ' + url)
            request = urllib2.urlopen(url)
            self.context.plone_log('Fi urlopen  %.3f segons' % (time.time() - t0))
            read = request.read()
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
        nom = 'name' in dada and dada['name'] or ''
        tipus = 'type' in dada and dada['type'] or ''
        valor = getattr(self, 'get_%s_dada' % (dada['type']))(dada)
        return {'nom': self.context.translate(nom, domain="fatac"), 'tipus': tipus, 'valor': valor}

    def get_text_dada(self, dades):
        """ donat un diccionari de tipus {u'type': u'text', u'name': u'Title',
        u'value': [u'Rainer Oldendorf']} retorna un string format pels strings
        dins el 'value' concatenats amb ', '
        """
        text = ''
        for i in dades['value']:
            if text != '':
                text += ', '
            text += i
        return text

    def get_search_dada(self, dades):
        """ donat un diccionari de tipus {u'type': u'search', u'name': u'',
        u'value': ["CaseFile:Expedient_Sol_LeWitt_Dibuixos_19581992"]} cal
        realitzar la cerca amb els filtre indicats i pintar-ne els resultats al pt.
        Retorna un string format pels strings dins el 'value' concatenats amb ','
        """
        #TODO: quin tipus de dades és??
        text = ''
        for i in dades['value']:
            if text != '':
                text += ','  # sense espai, per fer la cerca
            text += i
        return text

    def get_linkedObjects_dada(self, dades):
        """ donat un diccionari de tipus {"name": "Author", "type": "linkedObjects",
        "value": ["Tàpies. Celebració de la mel@Tapies_Celebracio_de_la_mel_3", "Tàpies. Certeses sentides@Tapies_Certeses_sentides", "Homenatge a Picasso@Homenatge_a_Picasso"]}
        cal pintar cada dada dins value formant un link amb la part esquerra de '@'
        que linki a la fitxa de l'objecte amb l'id indicat després de l'@.
        Retorna una llista de ciccionaris tipus {'text':xxx, 'id':xxx}
        """
        llista = []
        for i in dades['value']:
            if '@' in i:
                llista.append({'text': i.split('@')[0], 'link': self.context.portal_url() + '/genericView?idobjecte=' + i.split('@')[1]})
        return llista

    def get_objects_dada(self, dades):
        """
        """
        #TODO: quin tipus de dades és??
        return ','.join(dades['value'])

    def get_media_dada(self, dades):
        """
        """
        #TODO: quin tipus de dades és??
        return dades['value']

    def get_date_dada(self, dades):
        """
        """
        #TODO: quin tipus de dades és??
        return dades['value']

    def get_counter_dada(self, dades):
        """
        """
        #TODO: quin tipus de dades és??
        return dades['value']

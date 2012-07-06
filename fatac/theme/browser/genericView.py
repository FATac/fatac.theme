# -*- coding: utf-8 -*-
from Products.CMFCore.utils import getToolByName
from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from funcionsCerca import funcionsCerca
import urllib2
import json
from Products.CMFPlone.utils import _createObjectByType
from fatac.theme.helpers.columnes import YearPeriodColumn, AgentColumn
import logging
from plone.app.discussion.interfaces import IConversation

N_COLUMNS = 3


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
        super(BrowserView, self).__init__(context, request)
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

        parametres_visualitzacio = self.retParametresVisualitzacio()
        idobjecte = self.request.get('idobjecte')

        if idobjecte:
            self.idobjectes = [idobjecte]
            self.zoom = self.request.get('zoom')
            self.visualitzacio = self.request.get('visualitzacio')

        elif parametres_visualitzacio:
            if 'visualitzacio' in parametres_visualitzacio:
                self.visualitzacio = parametres_visualitzacio['visualitzacio']
            if self.visualitzacio is not None and self.visualitzacio == 'columnes':
                if 'querystring' in parametres_visualitzacio:
                    if 'Year' in parametres_visualitzacio['querystring']['f'][0]:
                        self.columns = YearPeriodColumn(self.getLang())
                    else:
                        self.columns = AgentColumn(self.getLang())
            else:
                rows = 0
                start = 0
                if 'resultats_per_pagina' in parametres_visualitzacio:
                    rows = parametres_visualitzacio['resultats_per_pagina']
                if 'pagina_actual' in parametres_visualitzacio:
                    start = (int(parametres_visualitzacio['pagina_actual']) - 1) * int(parametres_visualitzacio['resultats_per_pagina'])
                resultat_cerca = self.executaCercaIdsOQuerystring(fields='id, Who, What, When, class', rows=rows, start=start)
                self.resultat_cerca = []
                if resultat_cerca:
                    if 'dades_json' in resultat_cerca:
                        dades_json = resultat_cerca['dades_json']
                        if 'response' in dades_json and 'docs' in dades_json['response']:
                            resultats = dades_json['response']['docs']
                            self.resultat_cerca = resultat_cerca['dades_json']['response']['docs']
                            idobjectes = []
                            for resultat in resultats:
                                idobjectes.append(resultat['id'])
                            self.idobjectes = idobjectes

            if 'zoom' in parametres_visualitzacio:
                self.zoom = parametres_visualitzacio['zoom']

        else:
            #cas especial per visualització final dels objectes; no rebem res per request i cal agafar l'id del propi context
            self.idobjectes = [self.context.getId()]

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
        elif self.visualitzacio == 'columnes':
            return ViewPageTemplateFile('templates/genericview_3columnes.pt')(self)
        else:
            idobject = self.idobjectes[0]
            # Mirem si l'objecte existeix al servidor REST i cal crear-lo a Plone (si no s'ha creat amb anterioritat)
            crear_objecte = self.existObjectRest(idobject)
            if crear_objecte == 'true':
                # Busquem si ja estava creat al Plone, sino el creem
                #value = self.context.portal_catalog.searchResults(portal_type='fatac.dummy', id=idobject)
                # Si no existeix el creem fantasma per afegir commentaris
                arts = self.getSettings('arts_folder')
                arts_obj = getattr(self.context, arts)
                value = getattr(arts_obj, idobject, False)
                #TODO? find the context using catalog arts => plone object
                if not value:
                    _createObjectByType('fatac.dummy', arts_obj, idobject)
                    #getattr(arts_obj, idobject).
                    # En la nevera por si acaso, por defecto dejamos el language neutro
                    # getattr(arts_obj, idobject).setLanguage('ca')
                # Retornem la vista de l'objecte que ja permet afegir els commentaris
                #fatac/content/dummy_templates/view.pt
                return self.request.REQUEST.RESPONSE.redirect(self.context.portal_url() + '/' + arts + '/' + idobject)
            else:
                # L'objecte que es passa per string no s'ha de crear o no existeix, retornem ERROR
                logging.exception("Can't create object in Plone, the ID %s doesn't exist in REST server", idobject)
                raise AttributeError

    #===========================================================================
    # funcions que retornen les dades necessàries per pintar cada vista
    #===========================================================================

    def _translate(self, field, lang):
        """ Retorna el valor corresponent a l'idioma (el parametre lang) d'un
            camp multivaluat del solr.
        """

        default = ''
        for value in field:
            if not 'LANG' in value[:4]:
                default = value
            elif 'LANG' + lang in value[:6]:
                return value.replace("LANG" + lang + "__", "")
        return default

    def dades_genericview_solr(self):
        """ Retorna les dades que s'han obtingut de la cerca al solr.
        """
        if self.resultat_cerca is not None:
            resultat = []
            lang = self.getLang()
            for objecte in self.resultat_cerca:
                id_objecte = objecte['id']
                dades_objecte = {'id': id_objecte,
                                 'titol': '',
                                 'quan': '',
                                 'qui': '',
                                 'classe': objecte['class'],
                                 'thumbnail_classe': self.getThumbnailClasse(objecte['class']),
                                 'thumbnail_objecte': self.getThumbnailObjecte(id_objecte),
                                 'dades_header': []}

                if 'What' in objecte:
                    dades_objecte['titol'] = self._translate(objecte['What'], lang)
                if 'Who' in objecte:
                    dades_objecte['qui'] = objecte['Who'][0]
                if 'When' in objecte:
                    dades_objecte['quan'] = objecte['When'][0]
                resultat.append(dades_objecte)
            self.resultat_cerca = None
            return resultat

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
                            dada_llegida = self.llegirDada(dada)  # {'nom': nom, 'tipus': tipus, 'valor': valor}
                            if dada_llegida['valor'] and dada_llegida['valor'] != ' ':
                                dades.append(dada_llegida)
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

    def retNumComentaris(self):
        """ retorna el número de comentaris que té l'objecte
        """

        return IConversation(self.context).total_comments

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
        uid = self.uidParam
        if uid != '':
            uid = '?' + uid
        return self.rest_public + '/resource/' + idobjecte + '/thumbnail' + uid

    def getThumbnailClasse(self, classe):
        """ crida el servei que retorna el thumbnail de la classe donada
        """

        portal = getToolByName(self, 'portal_url')
        portal = portal.getPortalObject()
        classe = classe.replace('ac:', '')
        # una alternativa al replace seria el codi següent
        # if classe[:3] == 'ac:':
        #    classe = classe[3:]

        # Restricted traverse
        try:
            # skins doesn't support filenames with ':', but does in dirnames
            classe_path = str("ac:/" + classe + ".png")
            portal.unrestrictedTraverse(classe_path)
            uri = portal.portal_url() + '/' + classe_path
            return uri
        except:
            pass
        default = portal.portal_url() + "/ac:/default.png"
        return default

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
            idobjectes_str = ','.join(self.idobjectes)
            uid = self.uidParam
            if uid != '':
                uid = '&' + uid
            url = self.servidorRest + '/resource/' + idobjectes_str + '/view?section=header' + uid + '&lang=' + self.getLang()
            #TODO: esborrar quan acabem de testejar
            import time
            t0 = time.time()
            self.context.plone_log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Inici crida: ' + url)
            request = urllib2.urlopen(url, timeout=self.retRequestTimeout())
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
            idobjectes_str = ','.join(self.idobjectes)
            uid = self.uidParam
            if uid != '':
                uid = '&' + uid
            url = self.servidorRest + '/resource/' + idobjectes_str + '/view?section=header,body,content,footer' + uid + '&lang=' + self.getLang()
            #TODO: esborrar quan acabem de testejar
            import time
            t0 = time.time()
            self.context.plone_log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Inici crida: ' + url)
            request = urllib2.urlopen(url, timeout=self.retRequestTimeout())
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
        valor = ''
        if 'type' in dada:
            if hasattr(self, 'get_%s_dada' % (dada['type'])):
                valor = getattr(self, 'get_%s_dada' % (dada['type']))(dada)
        return {'nom': self.context.translate(nom, domain="fatac"), 'tipus': tipus, 'valor': valor}

    def get_text_dada(self, dades):
        """ donat un diccionari de tipus {u'type': u'text', u'name': u'Title',
        u'value': [u'Rainer Oldendorf']} retorna un string format pels strings
        dins el 'value' concatenats amb ', '
        """
        return ', '.join(dades['value'])

    def get_search_dada(self, dades):
        """ donat un diccionari de tipus {u'type': u'search', u'name': u'',
        u'value': ["CaseFile:Expedient_Sol_LeWitt_Dibuixos_19581992"]} cal
        realitzar la cerca amb els filtre indicats i pintar-ne els resultats al pt.
        Retorna un string format pels strings dins el 'value' concatenats amb ','
        """
        return ','.join(dades['value'])

    def get_linkedObjects_dada(self, dades):
        """ donat un diccionari de tipus {"name": "Author", "type": "linkedObjects",
        "value": ["Tàpies. Celebració de la mel@Tapies_Celebracio_de_la_mel_3", "Tàpies. Certeses sentides@Tapies_Certeses_sentides", "Homenatge a Picasso@Homenatge_a_Picasso"]}
        cal pintar cada dada dins value formant un link amb la part esquerra de '@'
        que linki a la fitxa de l'objecte amb l'id indicat després de l'@.
        Retorna una llista de diccionaris tipus {'text':xxx, 'id':xxx}
        """
        llista = []
        for i in dades['value']:
            if '@' in i:
                llista.append({'text': i.split('@')[0], 'link': self.context.portal_url() + '/genericView?idobjecte=' + i.split('@')[1]})
        return llista

    def get_objects_dada(self, dades):
        """ donat un diccionari de tipus {"name": "RelatedActivites","type": "objects",value": ["Ser_fer_pensar_trobades_en_lart_com_a_vida","Moviment_a_Entrevidas_Entre_vides","Laltra_cara_del_paper_Activitat_per_a_families","SpecificActivity","Anna_Maria_Maiolino_Visita_comentada_previa_a_la_inauguracio"]}
        cal pintar un scrollable amb una visualiztació de cada objecte.
        Retorna un string format pels strings dins el 'value' concatenats amb ','
        """
        return ','.join(dades['value'])

    def get_counter_dada(self, dades):
        """ donat un diccionari de tipus {'nom': '', 'tipus': u'counter', 'valor': [u'Text', u'3', u'Media', u'56', u'Image', u'42', u'Video', u'11']}
        cal pintar caixes amb la icona de la classe i el número indicats
        """
        llista = []
        i = 0
        while i < len(dades['value']):
            #ignorem 'media', xq és la superclasse
            if dades['value'][i] != 'Media':
                llista.append({'classe': self.context.translate(dades['value'][i], domain="fatac"), 'num': dades['value'][i + 1], 'icon': self.getThumbnailClasse(dades['value'][i])})
            i += 2
        return llista

    def get_date_dada(self, dades):
        """ donat un diccionari de tipus {u'type': u'date', u'name': u'nom',
        u'value': [llista de valors]} retorna un string format pels strings
        dins el 'value' concatenats amb ', '
        """
        return ', '.join(dades['value'])

    def get_media_dada(self, dades):
        """ donat un diccionari de tipus {"type": "media", "value": ["http://ec2-50-16-26-20.compute-1.amazonaws.com:8080/ArtsCombinatoriesRest/media/gizmo_3719d295746c4cb"]}
        retorna una llista de diccionaris amb la url i el tipus (audio, video, text, image) de cada media a pintar
        """
        info_srt = []
        i = 0
        llista = []
        arts_folder = self.getSettings('arts_folder')
        # Afegim subtitols al player (audio/video)
        values = self.context.portal_catalog.searchResults(portal_type='File', path='/' + self.context.getPhysicalPath()[1] + '/' + arts_folder + '/' + str(self.idobjectes[0]))
        info_srt = [dict(label=obj.Title, src=obj.getURL()) for obj in values]
        while i < len(dades['value']):
            partsDades = (dades['value'][i + 1] + ",default").split(",")
            llista.append({'url': dades['value'][i],
                            'tipus_media': partsDades[0],
                            'profile': partsDades[1],
                            'info_srt': info_srt,
                            'showComments': partsDades[0] in ['audio', 'video']})
            i += 2
        return llista

    def getColumns(self):
        """ Gets de columns and content"""
        titles = self.columns
        columns = []

        if self.visualitzacio == 'columnes':
            pagina = (int(self.retParametresVisualitzacio()['pagina_actual']) - 1) * N_COLUMNS
            max_columns = len(titles)
            for i in range(pagina, pagina + N_COLUMNS):
                if i < max_columns:
                    columns.append({
                            'title': titles.title(i),
                            'content': self._getColumnContent(titles.query(i), titles.field(), titles.fieldFilter)
                        })
        return columns

    def _getColumnContent(self, query, field, fieldFilter):
        #parametres_visualitzacio['querystring']['f'][0]
        resultat_cerca = self.executaCercaIdsOQuerystring([query], "id," + field)
        if resultat_cerca:
            if 'dades_json' in resultat_cerca:
                dades_json = resultat_cerca['dades_json']
                if 'response' in dades_json and 'docs' in dades_json['response']:
                    resultats = dades_json['response']['docs']
                    idobjectes = []
                    for resultat in resultats:
                        idobjectes.append({
                            'id': resultat['id'],
                            'name': fieldFilter(resultat)
                            })
                    self.idobjectes = idobjectes
        return self.idobjectes

    def getColumnHeaders(self):
        columns = self.columns
        res = []
        pagina = (int(self.retParametresVisualitzacio()['pagina_actual']) - 1) * N_COLUMNS
        actius = range(pagina, pagina + N_COLUMNS)
        i = 0
        while (i < len(columns)):
            res.append({
                        'active': i in actius,
                        'title': columns.title(i),
                        'page': (i / N_COLUMNS) + 1
                    })
            i += 1
        return res

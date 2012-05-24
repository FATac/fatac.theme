# -*- coding: utf-8 -*-

from Products.Five.browser import BrowserView
from funcionsCerca import funcionsCerca
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
import logging
import urllib2
import json
from fatac.theme.helpers.columnes import YearPeriodColumn, CapitalLetterColumn
N_COLUMNS = 3


class genericViewColumnes(BrowserView, funcionsCerca):

    def __init__(self, context, request):
        """ self.servidorRest guarda l'adreça del servidor Rest que serveix les
        dades; self.idobjectes guarda l'id del/s objecte/s del que volem mostrar
        """
        self.request = request
        self.context = context
        self.servidorRest = self.getSettings('rest_server')
        self.rest_public = self.getSettings('rest_public_server')
        self.zoom = None
        self.visualitzacio = None
        self.idobjectes = None
        self.uidParam = self.getUIDParam(self.context)
        self.idobjectes = None
        param = self.retParametresVisualitzacio()
        if param:
            if 'visualitzacio' in param:
                self.visualitzacio = param['visualitzacio']
                if 'querystring' in param:
                    if 'Year' in param['querystring']['f'][0]:
                        self.columns = YearPeriodColumn()
                    else:
                        self.columns = CapitalLetterColumn()
            else:
                #TODO throw error
                pass
        else:
                #TODO throw error
                pass

    def __call__(self):
        """
        """
        return ViewPageTemplateFile('templates/genericview_3columnes.pt')(self)

    def _retSectionHeader(self):
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

    def _getObjectHead(self):
        """
        """
        dades_json = self._retSectionHeader()  # retorna diccionari
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
                                 'dades_seccions': dades_seccions,
                                 'te_subcerca': te_subcerca,
                                 'titol_zona_resultats': titol_zona_resultats,
                                 'hi_ha_seccio_content': hi_ha_seccio_content}
                resultat.append(dades_objecte)
        return resultat

    def getColumns(self):
        """ Gets de columns and content"""
        titles = self.columns
        columns = []
        if self.visualitzacio == 'explora':
            pagina = (int(self.retParametresVisualitzacio()['pagina_actual']) - 1) * N_COLUMNS
            max_columns = len(titles)
            for i in range(pagina, pagina + N_COLUMNS):
                if i < max_columns:
                    columns.append({
                            'title': titles.title(i),
                            'content': self._getColumnContent(titles.query(i))
                        })
        return columns

    def _getColumnContent(self, query):
        #parametres_visualitzacio['querystring']['f'][0]
        resultat_cerca = self.executaCercaIdsOQuerystring([query])
        if resultat_cerca:
            if 'dades_json' in resultat_cerca:
                dades_json = resultat_cerca['dades_json']
                if 'response' in dades_json and 'docs' in dades_json['response']:
                    resultats = dades_json['response']['docs']
                    idobjectes = []
                    for resultat in resultats:
                        idobjectes.append(resultat['id'])
                    self.idobjectes = idobjectes
        return self._getObjectHead()


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

    def getTitolObjecte(self, seccions):
        """ donat un array de seccions, busca la seccio 'header' i retorna un
        string concatenant els strings del primer camp
        """
        for seccio in seccions:
            if seccio['name'] == 'header':
                titol_objecte = self.llegirDada(seccio['data'][0])['valor']
                return titol_objecte

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
        llista = []
        i = 0
        while i < len(dades['value']):
            partsDades = (dades['value'][i + 1] + ",default").split(",")
            llista.append({'url': dades['value'][i], 'tipus_media': partsDades[0], 'profile': partsDades[1]})
            i += 2
        return llista

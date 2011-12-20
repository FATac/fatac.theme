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
        dades; self.idobjecte guarda l'id de l'objecte del que volem mostrar la
        vista
        """
        self.request = request
        self.context = context
        self.servidorRest = self.retServidorRest()
        self.idobjecte = self.request.get('idobjecte')
        self.zoom = self.request.get('zoom')
        self.visualitzacio = self.request.get('visualitzacio')

    #__call__ = ViewPageTemplateFile('templates/genericview.pt')
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

    def getZoom(self):
        """ retorna el zoom que cal aplicar a les imatges ([1,2,3])
        """
        return self.zoom


    def getView(self):
        """ retorna un diccionari amb les dades JSON de l'objecte self.idobjecte
        """
        url = self.servidorRest + '/resource/' + self.idobjecte + '/view'
        request = urllib2.urlopen(url)
        read = request.read()
        if read:
            dades_json = json.loads(read)  # retorna diccionari
            return dades_json
        return None

    def getMedia(self):
        """ retorna el media associat a l'objecte self.idobjecte
        """
        url = self.servidorRest + '/objects/' + self.idobjecte + '/media'
        return url
        request = urllib2.urlopen(url)
        return request.read()

    def getThumbnailObjecte(self):
        """ crida el servei que retorna el thumbnail de l'objecte
        """
        return self.servidorRest + '/resource/' + self.idobjecte + '/thumbnail'

    def getThumbnailClasse(self, classe):
        """ crida el servei que retorna el thumbnail de la classe donada
        """
        return self.servidorRest + '/classes/' + classe + '/thumbnail'

    def getTextType(self, dades):
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

    def llegirDada(self, dada):
        """
        """
        if dada['type'] == 'text':
            return {'nom': dada['name'], 'tipus': dada['type'], 'valor': self.getTextType(dada)}
        return

    def getTitolObjecte(self, dades):
        """ donat el 'data' de la seccio 'header', retorna un string concatenant
        els strings del primer camp
        """
        return self.llegirDada(dades[0])['valor']

    def getDadesObjecte(self):
        """ retorna les dades necessàries per pintar les vistes dels objectes:
        títol de l'objecte, thumbnail de l'objecte, thumbnail de la classe,
        dades del header
        """
        url = self.servidorRest + '/resource/' + self.idobjecte + '/view'
        request = urllib2.urlopen(url)
        read = request.read()

        #TODO: tinc alguna altra manera de comprovar que no retorni error? Ara no sé què pintar al template...
        if not read.startswith('"Error: '):

            dades_json = json.loads(read)
            seccions = {}
            titol_objecte = ''
            for seccio in dades_json['sections']:

                dades_seccio = []
                for dada in seccio['data']:
                    dades_seccio.append(self.llegirDada(dada))
                seccions[seccio['name']] = dades_seccio

                if seccio['name'] == 'header':
                    titol_objecte = self.getTitolObjecte(seccio['data'])

            dades_objecte = {'id': self.idobjecte,
                             'titol': titol_objecte,
                             'classe': dades_json['className'],
                             'thumbnail_classe': self.getThumbnailClasse(dades_json['className']),
                             'seccions': seccions}
            return dades_objecte
        return None

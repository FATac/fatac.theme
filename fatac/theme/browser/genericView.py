# -*- coding: utf-8 -*-

from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
import urllib2
import json


class genericView(BrowserView):
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
        self.servidorRest = 'http://stress:8080/ArtsCombinatoriesRest'
        self.idobjecte = self.request.get('idobjecte')

    __call__ = ViewPageTemplateFile('templates/genericview.pt')

    def getView(self):
        """ retorna un diccionari amb les dades JSON de l'objecte self.idobjecte
        """
        url = self.servidorRest + '/objects/' + self.idobjecte + '/view'
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

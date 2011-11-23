# -*- coding: utf-8 -*-

from plone.memoize.ram import cache
import urllib2
import json


class funcionsCerca():
    """ classe que conté les funcions bàsiques relacionades amb la cerca;
    cacheja els resultats fent servir ram.cache
    """

    def retServidorRest(self):
        """ retorna la url on està el servidor rest.
        """
        return 'http://stress:8080/ArtsCombinatoriesRest'

    def retQuerystringInicial(self):
        """ retorna el querystring inicial (start i rows per defecte, corresponents
        a la vista en imatges petites, més el text introduït per l'usuari).
        """
        querystring_inicial = '?start=0&rows=72'
        if 's' in self.request.keys():
            querystring_inicial += '&s=' + self.request.get('s')
        return querystring_inicial

    def modified_cachekey(fn, self, querystring):
        """ Cache the result based on 'querystring'
        TODO: cal que depengui de més coses?? temps, usuari, etc.
        """
        return querystring

    @cache(modified_cachekey)
    def executaCerca(self, querystring):
        """ Crida el servei rest que executa la cerca, i retorna el json resultant
        """
        self.context.plone_log('################################### fatac: nova cerca cachejada')
        #import ipdb; ipdb.set_trace()
        url = self.retServidorRest() + '/solr/search' + querystring
        request = urllib2.urlopen(url)
        read = request.read()
        if read:
            return json.loads(read)  # retorna diccionari
        return None

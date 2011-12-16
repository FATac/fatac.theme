# -*- coding: utf-8 -*-

from plone.memoize.ram import cache
import urllib2
import json
from zope.component import getUtility
from plone.registry.interfaces import IRegistry
from fatac.theme.browser.interfaces import IFatacSettings


class funcionsCerca():
    """ classe que conté les funcions bàsiques relacionades amb la cerca;
    cacheja els resultats fent servir ram.cache
    """

    def retServidorRest(self):
        """ retorna la url del servidor rest, guardada amb plone.app.registry i
        configurable a través de @@fatac_settings
        """
        registry = getUtility(IRegistry)
        settings = registry.forInterface(IFatacSettings)
        url = settings.rest_server
        return url

    def retQuerystringInicial(self):
        """ retorna el querystring inicial (start i rows per defecte, corresponents
        a la vista en imatges petites, més el text introduït per l'usuari).
        """
        #TODO: tornar a posar 66
        querystring_inicial = '?start=0&rows=66'
        if 's' in self.request.keys():
            querystring_inicial += '&s=' + self.request.get('s')
        return querystring_inicial

    def llegeixJson(self, url):
        """ donada una url, l'obre, llegeix el json i el retorna
        Centralitzem per parsejar la url de forma centralitzada (per exemple per
        evitar errors de codificació
        """
        url = url.replace(" ", "%20")
        try:
            request = urllib2.urlopen(url)
            if request:
                return request.read()
            return
        except:
            self.context.plone_log("error en executar urllib2.urlopen(" + url + ")")
            return

    def modified_cachekey(fn, self, querystring):
        """ Cache the result based on 'querystring'
        TODO: cal que depengui de més coses?? temps, usuari, etc.
        """
        return querystring

    #TODO: tornar a posar caché
    #@cache(modified_cachekey)
    def executaCerca(self, querystring):
        """ Crida el servei rest que executa la cerca, i retorna el json resultant
        """
        url = self.retServidorRest() + '/solr/search' + querystring
        read = self.llegeixJson(url)
        if read:
            #quan llegim, perdem l'ordre dels filtres. Per evitar-ho, parsejarem
            #el read amb una expressió regular que ens retornarà una llista on podrem consultar l'ordre.
            import re
            inici = read.find('facet_fields')
            final = read.find('}', inici)
            facet_fields = read[inici:final]
            # busca qualsevol cadena [A-Za-z] seguida de :, i les agrupa guardant la posició inicial
            mm = [(a.groups()[0],a.start()) for a in re.finditer('"([A-Za-z]*)":',facet_fields)]
            #mm = [('ObjectType', 15), ('Year', 139), ('Country', 347), ('Translation', 570), ('Media', 649), ('License', 702), ('Role', 715), ('Person', 832), ('Organisation', 2858), ('Collection', 2876), ('ArtWork', 3043)]
            #ordena mm en funció de la posició guardada
            llista_claus = [a[0] for a in sorted(mm,key=lambda filtre:filtre[1])]
            #llista_claus = ['ObjectType', 'Year', 'Country', 'Translation', 'Media', 'License', 'Role', 'Person', 'Organisation', 'Collection', 'ArtWork']
            return {'ordre_filtres': llista_claus, 'dades_json': json.loads(read)}
        return None

    def modified_cachekey_ultims_documents(fn, self):
        """ Cache the result based on 'querystring'
        TODO: de què la faig dependre? del temps?
        """
        return

    #TODO: tornar a posar caché
    #@cache(modified_cachekey_ultims_documents)
    def executaCercaUltimsDocuments(self):
        """ Crida el servei rest que executa la cerca, i retorna el json resultant
        """
        url = self.retServidorRest() + '/solr/search?start=0&rows=15&sort=creation desc'
        read = self.llegeixJson(url)
        if read:
            return {'dades_json': json.loads(read)}
        return None

    def modified_cachekey_ultims_consultats(fn, self):
        """ Cache the result based on 'querystring'
        TODO: de què la faig dependre? del temps?
        from time import time
        time()//5       --> canvia cada 5 segons
        """
        return

    #TODO: tornar a posar caché
    #@cache(modified_cachekey_ultims_documents)
    def executaCercaUltimsConsultats(self):
        """ Crida el servei rest que executa la cerca, i retorna el json resultant
        """
        url = self.retServidorRest() + '/solr/search?start=0&rows=15&sort=lastView desc'
        read = self.llegeixJson(url)
        if read:
            return {'dades_json': json.loads(read)}
        return None

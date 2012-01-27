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

    def executaCercaIdsOQuerystring(self):
        """
        """
        parametres_visualitzacio = self.retParametresVisualitzacio()

        llista_ids = None
        querystring = None
        if 'llista_ids' in parametres_visualitzacio:
            llista_ids = parametres_visualitzacio['llista_ids']
        if 'querystring' in parametres_visualitzacio:
            querystring = parametres_visualitzacio['querystring']

        return self.executaCerca(querystring, llista_ids)

    def retServidorRest(self):
        """ retorna la url del servidor rest, guardada amb plone.app.registry i
        configurable a través de @@fatac_settings
        """
        registry = getUtility(IRegistry)
        settings = registry.forInterface(IFatacSettings)
        url = settings.rest_server
        return url

    def retParametresVisualitzacio(self):
        """
        """
        if 'parametres_visualitzacio' in self.request.keys():
            parametres_visualitzacio_json = self.request.get('parametres_visualitzacio')
            return json.loads(parametres_visualitzacio_json)
        return None

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

    def modified_cachekey(fn, self, querystring, llista_ids):
        """ Cache the result based on 'querystring'
        TODO: cal que depengui de més coses?? temps, usuari, etc.
        """
        return querystring

    def querystringToString(self, querystring):
        """
        """
        querystring_str = ''
        for key in querystring.keys():
            valor = querystring[key]
            if key == 'f':
                valor = ''
                if len(querystring[key]) > 0:
                    valor = ','.join(querystring[key])
            if valor:
                if querystring_str == '':
                    querystring_str += key + '=' + str(valor)
                else:
                    querystring_str += '&' + key + '=' + str(valor)
        return querystring_str

    #TODO: si està comentada, tornar a posar caché
    @cache(modified_cachekey)
    def executaCerca(self, querystring, llista_ids=None):
        """
        si rep querystring, crida el servei rest que executa la cerca, i
        retorna el json resultant i els filtres ordenats;
        si rep llista_ids, en comptes de querystring, monta un diccionari com si
        sigués el resultat d'una cerca i el retorna
        """
        if querystring:
            querystring_str = self.querystringToString(querystring)
            url = self.retServidorRest() + '/solr/search?' + querystring_str
            self.context.plone_log('$$$$$$$$$$$$$$$$$$$$$$$ cerca: ' + url)
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

        elif llista_ids:
            numFound = len(llista_ids)
            #exemple: docs = [{u'id': u'CulturalManagement_96'}, {u'id': u'CulturalManagement_96'}, {u'id': u'CulturalManagement_96'}]
            docs = []
            for id in llista_ids:
                docs.append({'id': id})
            dades_json = {
                'facet_counts': {u'facet_ranges': {}, u'facet_fields': {}},
                'response': {u'start': 0, u'numFound': numFound, u'docs': docs}
            }
            return {'ordre_filtres': [], 'dades_json': dades_json}

        return None

    def modified_cachekey_tipus_ordenacio(fn, self, clau):
        """ Cache the result based on
        TODO: de què la faig dependre? del temps?
        """
        return

    #TODO: activar caché
    @cache(modified_cachekey_tipus_ordenacio)
    def retTipusOrdenacio(self, clau):
        """ Crida el servei rest que retorna els tipus d'ordenació segons el
        paràmetre rebut
        """
        url = self.retServidorRest() + '/solr/configurations'
        read = self.llegeixJson(url)
        if read:
            dades_json = json.loads(read)
            if 'data' in dades_json:
                data = dades_json['data']
                i = 0
                while i < len(data):
                    if data[i]['name'] == clau:
                        return data[i]['sortFields']
                    i += 1
        return

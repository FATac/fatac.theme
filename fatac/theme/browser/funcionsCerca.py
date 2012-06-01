# -*- coding: utf-8 -*-

from plone.memoize.ram import cache
import urllib2
import json
from zope.component import getUtility
from plone.registry.interfaces import IRegistry
from fatac.theme.browser.interfaces import IFatacSettings
from Products.CMFCore.utils import getToolByName
from base64 import b64encode
from time import time
from zope.deprecation import deprecation


class funcionsCerca():
    """ classe que conté les funcions bàsiques relacionades amb la cerca;
    cacheja els resultats fent servir ram.cache
    """

    # Settings
    _settings = None

    def executaCercaIdsOQuerystring(self, query=None, fields=None):
        """
        """
        parametres_visualitzacio = self.retParametresVisualitzacio()

        llista_ids = None
        querystring = None
        if 'llista_ids' in parametres_visualitzacio:
            llista_ids = parametres_visualitzacio['llista_ids']
            self.context.plone_log("Llista id's: " + str(llista_ids))
        if 'querystring' in parametres_visualitzacio:
            querystring = parametres_visualitzacio['querystring']
            if query != None:
                querystring['f'] = query
            if fields != None:
                querystring['fields'] = fields
        return self.executaCerca(querystring, llista_ids, self.getLang())

    def getSettings(self, key=None):
        """ Retorna la configuració o el valor de la configuració demanat (key).
            El primer cop carrega la configuració desada amb plone.app.registry, els
             següents cops fa servir la variable _settings.
            La configuració es defineix a la vista @@fatac_settings
        """
        # Carrega
        if self._settings == None:
            registry = getUtility(IRegistry)
            self._settings = registry.forInterface(IFatacSettings)
        # Retornar valor clau
        if key != None:
            if hasattr(self._settings, key):
                return getattr(self._settings, key)
            else:
                return None

        return self._settings

    def retServidorRest(self):
        """ retorna la url del servidor rest (rest_server), guardada amb plone.app.registry i
        configurable a través de @@fatac_settings
        """
        return self.getSettings('rest_server')

    # TODOv2.0 remove deprecation mark, and method
    retServidorRest = deprecation.deprecated(retServidorRest, 'retServidorRest() is depreacted use the new getSettings().')

    def retTempsCache(self):
        """ retorna la duració en segons de la cache, guardad amb plone.appe.registry i
         configurable a través de @@fatac_settings"""
        temps = self.getSettings('cache_time')
        if temps == 0 or temps == None:
            return 0.01
        return temps * 60

    def retRequestTimeout(self):
        """ retorna la duració en segons del timeout per les peticions, guardad amb plone.appe.registry i
         configurable a través de @@fatac_settings"""
        return self.getSettings('rest_timeout')

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
            request = urllib2.urlopen(url, timeout=self.retRequestTimeout())
            if request:
                return request.read()
            return
        except:
            self.context.plone_log("error en executar urllib2.urlopen(" + url + ")")
            return

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
                if isinstance(valor, unicode):
                    valor = valor.encode('utf-8')
                if querystring_str == '':
                    querystring_str += key + '=' + str(valor)
                else:
                    querystring_str += '&' + key + '=' + str(valor)
        return querystring_str

    def marca_temps(self):
        """Retorna una marca (string) en funció del temps i la durada de la cache"""
        marca_temps = time()
        durada = self.retTempsCache()
        if durada != 0:
            marca_temps = marca_temps // durada
        return str(marca_temps)

    def modified_cachekey(fn, self, querystring, llista_ids, lang):
        """ Cache the result based on
        """
        llista_ordenada = ''
        if llista_ids is not None:
            llista_ordenada = str(sorted(llista_ids))

        return str(querystring) + llista_ordenada + self.marca_temps() + lang

    @cache(modified_cachekey)
    def executaCerca(self, querystring, llista_ids, lang):
        """
        si rep querystring, crida el servei rest que executa la cerca, i
        retorna el json resultant i els filtres ordenats;
        si rep llista_ids, en comptes de querystring, monta un diccionari com si
        sigués el resultat d'una cerca i el retorna
        """
        if querystring:
            querystring_str = self.querystringToString(querystring)
            url = self.retServidorRest() + '/solr/search?' + querystring_str + "&lang=" + lang
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
                mm = [(a.groups()[0], a.start()) for a in re.finditer('"([A-Za-z]*)":', facet_fields)]
                #mm = [('ObjectType', 15), ('Year', 139), ('Country', 347), ('Translation', 570), ('Media', 649), ('License', 702), ('Role', 715), ('Person', 832), ('Organisation', 2858), ('Collection', 2876), ('ArtWork', 3043)]
                #ordena mm en funció de la posició guardada
                llista_claus = [a[0] for a in sorted(mm, key=lambda filtre:filtre[1])]
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
        """
        return clau + self.marca_temps()

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

    def existObjectRest(self, querystring):
        """ Crida al servei rest que ens diu si l'objecte existeix o no, per després crear-lo al plone
        """
        value = 'false'
        url = self.retServidorRest() + '/resource/' + querystring + '/exists'
        dades = self.llegeixJson(url)
        if dades:
            value = json.loads(dades)
        return value

    def getUIDParam(self, context):
        """ Obte l'uid de l'usuari en base64, si no s'ha identificat retornar una cadena buida
        """

        mt = getToolByName(context, 'portal_membership')
        if mt.isAnonymousUser():
            #  the user has not logged in
            return ''
        else:
            return 'uid=' + b64encode(mt.getAuthenticatedMember().getId())

    def getLang(self):
        """Retorna l'idioma actiu del lloc web"""
        lt = getToolByName(self.context, 'portal_languages')
        return lt.getPreferredLanguage()

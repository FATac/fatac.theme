# -*- coding: utf-8 -*-

from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from funcionsCerca import funcionsCerca
from Products.CMFCore.utils import getToolByName
from fatac.theme.helpers.columnes import YearPeriodColumn, CapitalLetterColumn
from math import ceil


class resultatsViewColumnes(BrowserView, funcionsCerca):
    """ pinta els resultats i les dades referents a la paginació i les opcions
    de visualització
    """
    __call__ = ViewPageTemplateFile('templates/resultatsview.pt')

    column = None

    def __init__(self, context, request):
        """ Constructora """
        self.context = context
        self.request = request
        parametres_visualitzacio = self.retParametresVisualitzacio()
        self.column = None
        if 'querystring' in parametres_visualitzacio:
            if 'Year' in parametres_visualitzacio['querystring']['f'][0]:
                self.column = YearPeriodColumn()
            else:
                self.column = CapitalLetterColumn()

        dades_paginacio = {'pagina_actual': '?', 'num_total_pagines': '?', 'num_obj_inicial': '?', 'num_obj_final': '?', 'num_total_obj': '?'}
        resultat_cerca = self.executaCercaIdsOQuerystring()
        if resultat_cerca:
            if 'dades_json' in resultat_cerca:
                dades_json = resultat_cerca['dades_json']
                if 'response' in dades_json and 'numFound' in dades_json['response']:
                    num_resultats = float(dades_json['response']['numFound'])
                    pagina_actual = int(parametres_visualitzacio['pagina_actual'])
                    resultats_per_pagina = float(parametres_visualitzacio['resultats_per_pagina'])
                    num_total_pagines = int(ceil(len(self.column) / 3.0))
                    num_obj_inicial = int((pagina_actual * resultats_per_pagina) - resultats_per_pagina + 1)
                    num_obj_final = int((pagina_actual * resultats_per_pagina))
                    if num_obj_final > num_resultats:
                        num_obj_final = int(num_resultats)
                    dades_paginacio = {'pagina_actual': pagina_actual, 'num_total_pagines': num_total_pagines, 'num_obj_inicial': num_obj_inicial, 'num_obj_final': num_obj_final, 'num_total_obj': int(num_resultats)}
        self.dades_paginacio = dades_paginacio

    def retDadesResultats(self):
        """ crida la vista displayResultatsPaginaView i retorna l'html generat
        """
        portal = getToolByName(self, 'portal_url')
        portal = portal.getPortalObject()
        html = portal.restrictedTraverse('@@displayResultatsPaginaView')()
        #html = "Hola!"
        return html

    def retDadesPaginacio(self):
        """ calcula i retorna les dades referents a la paginació en un diccionari
        ('pagina_actual', 'num_total_pagines', 'num_obj_inicial', 'num_obj_final', 'num_total_obj', )
        """
        return self.dades_paginacio

    def retDadesVisualitzacio(self):
        """ retorna el tipus de visualització i zoom actius
        """
        parametres_visualitzacio = self.retParametresVisualitzacio()

        return {'visualitzacio': parametres_visualitzacio['visualitzacio'], 'zoom': parametres_visualitzacio['zoom']}

    def retTipusEntrada(self):
        """ pel selector de tipus d'entrada, retorna una llista de diccionaris
        amb les opcions possibles, formades per filtres 'class' amb resultats
        """
        resultat_cerca = self.executaCercaIdsOQuerystring()
        opcions = []
        if resultat_cerca:
            if 'dades_json' in resultat_cerca and 'ordre_filtres' in resultat_cerca:
                dades_json = resultat_cerca['dades_json']
                if 'facet_counts' in dades_json and 'facet_fields' in dades_json['facet_counts']:
                    filtres_json = dades_json['facet_counts']['facet_fields']
                    if 'class' in filtres_json:
                        classes = filtres_json['class']
                        if len(classes) > 0:
                            i = 0
                            opcions = []
                            while i < len(classes):
                                num = classes[i + 1]
                                if num > 0:
                                    opcions.append(classes[i])
                                i += 2
        opcio_inicial = ''
        altres_opcions = []
        if len(opcions) > 0:
            opcio_inicial = opcions[0]
        if len(opcions) > 1:
            altres_opcions = opcions[1:len(opcions)]
        return {'opcio_selec': opcio_inicial, 'altres_opcions': altres_opcions}

    def retTipusOrdre(self):
        """ pel selector de tipus d'ordre, retorna un diccionari amb la opció
        seleccionada i una llista amb la resta d'opcions possibles
        """
        parametres_visualitzacio = self.retParametresVisualitzacio()
        if 'querystring' in parametres_visualitzacio:
            conf = ''
            llista_altres_opcions = []
            if 'conf' in parametres_visualitzacio['querystring']:
                conf = parametres_visualitzacio['querystring']['conf']
            clau = conf == 'Explorar' and 'Explorar' or 'default'
            # Fem una copia de la llista per no modificar la cache
            altres_opcions = list(self.retTipusOrdenacio(clau))
            if altres_opcions:
                opcio_selec = 'sort' in parametres_visualitzacio['querystring'] and parametres_visualitzacio['querystring']['sort'] or (len(altres_opcions) > 0 and altres_opcions[0] or '')
                if opcio_selec in altres_opcions:
                    altres_opcions.remove(opcio_selec)
                for o in altres_opcions:
                    llista_altres_opcions.append({'opcio': o, 'nom': o.split('+')[0]})
                return {'opcio_selec': {'opcio': opcio_selec, 'nom': opcio_selec.split('+')[0]}, 'altres_opcions': llista_altres_opcions}
        return {'opcio_selec': '', 'altres_opcions': []}


# -*- coding: utf-8 -*-
from plone.app.layout.viewlets.common import ViewletBase
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class cercador(ViewletBase):
    render = ViewPageTemplateFile('cercador.pt')


class onestem(ViewletBase):
    render = ViewPageTemplateFile('onestem.pt')


class opcions(ViewletBase):
    render = ViewPageTemplateFile('opcions.pt')


class filtres(ViewletBase):
    render = ViewPageTemplateFile('filtres.pt')

    def retFiltres(self):
        """ retorna els filtres disponibles
        """
        filtres = [
            {
                'nom_filtre': 'Anys',
                'opcions': [{'nom':'Tots', 'num':'13'}, {'nom':'1985', 'num':'5'}, {'nom':'1986', 'num':'1'}, {'nom':'1987', 'num':'4'}, {'nom':'1988', 'num':'2'}, {'nom':'1989', 'num':'1'}],
            },
            {
                'nom_filtre': 'Ubicació',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Espanya', 'num':'5'}, {'nom':'França', 'num':'1'}, {'nom':'Anglaterra', 'num':'1'}, {'nom':'Andorra', 'num':'1'}, {'nom':'Canet de mar', 'num':'1'}, {'nom':'Arenys de mar', 'num':'5'}, {'nom':'Llaveneres', 'num':'1'}, {'nom':'Mataró', 'num':'1'}, {'nom':'Sitges', 'num':'1'}, {'nom':'Japó', 'num':'1'}],
            },
            {
                'nom_filtre': 'Idioma',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Català', 'num':'6'}, {'nom':'Castellà', 'num':'2'}, {'nom':'Anglès', 'num':'1'}],
            },
            {
                'nom_filtre': 'Media',
                'opcions': [{'nom':'Tots', 'num':'12'}, {'nom':'Audio', 'num':'5'}, {'nom':'Imatge', 'num':'1'}, {'nom':'Text', 'num':'4'}, {'nom':'Vídeo', 'num':'2'}, {'nom':'Audio', 'num':'5'}, {'nom':'Imatge', 'num':'1'}, {'nom':'Text', 'num':'4'}, {'nom':'Vídeo', 'num':'2'}, {'nom':'Audio', 'num':'5'}, {'nom':'Imatge', 'num':'1'}, {'nom':'Text', 'num':'4'}, {'nom':'Vídeo', 'num':'2'}],
            },
            {
                'nom_filtre': 'Llicències',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Copyright', 'num':'7'}, {'nom':'Creative Commons', 'num':'1'}, {'nom':'Obres orfes', 'num':'1'}],
            },
            {
                'nom_filtre': 'Rols',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Copyright', 'num':'7'}, {'nom':'Creative Commons', 'num':'1'}, {'nom':'Obres orfes', 'num':'1'}],
            },
            {
                'nom_filtre': 'Persones',
                'opcions': [{'nom':'Tots', 'num':'13'}, {'nom':'1985', 'num':'5'}, {'nom':'1986', 'num':'1'}, {'nom':'1987', 'num':'4'}, {'nom':'1988', 'num':'2'}, {'nom':'1989', 'num':'1'}],
            },
            {
                'nom_filtre': 'Organitzacions',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Espanya', 'num':'5'}, {'nom':'França', 'num':'1'}, {'nom':'Anglaterra', 'num':'1'}, {'nom':'Andorra', 'num':'1'}, {'nom':'Portugal', 'num':'1'}],
            },
            {
                'nom_filtre': 'Esdeveniments',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Català', 'num':'6'}, {'nom':'Castellà', 'num':'2'}, {'nom':'Anglès', 'num':'1'}],
            },
            {
                'nom_filtre': 'Publicacions',
                'opcions': [{'nom':'Tots', 'num':'12'}, {'nom':'Audio', 'num':'5'}, {'nom':'Imatge', 'num':'1'}, {'nom':'Text', 'num':'4'}, {'nom':'Vídeo', 'num':'2'}],
            },
            {
                'nom_filtre': 'Obres d\'Art',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Copyright', 'num':'7'}, {'nom':'Creative Commons', 'num':'1'}, {'nom':'Obres orfes', 'num':'1'}],
            },
            {
                'nom_filtre': 'Coleccions',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Copyright', 'num':'7'}, {'nom':'Creative Commons', 'num':'1'}, {'nom':'Obres orfes', 'num':'1'}],
            },
            {
                'nom_filtre': 'Organitzacions',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Espanya', 'num':'5'}, {'nom':'França', 'num':'1'}, {'nom':'Anglaterra', 'num':'1'}, {'nom':'Andorra', 'num':'1'}, {'nom':'Portugal', 'num':'1'}],
            },
            {
                'nom_filtre': 'Esdeveniments',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Català', 'num':'6'}, {'nom':'Castellà', 'num':'2'}, {'nom':'Anglès', 'num':'1'}],
            },
            {
                'nom_filtre': 'Publicacions',
                'opcions': [{'nom':'Tots', 'num':'12'}, {'nom':'Audio', 'num':'5'}, {'nom':'Imatge', 'num':'1'}, {'nom':'Text', 'num':'4'}, {'nom':'Vídeo', 'num':'2'}],
            },
            {
                'nom_filtre': 'Obres d\'Art',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Copyright', 'num':'7'}, {'nom':'Creative Commons', 'num':'1'}, {'nom':'Obres orfes', 'num':'1'}],
            },
            {
                'nom_filtre': 'Coleccions',
                'opcions': [{'nom':'Tots', 'num':'9'}, {'nom':'Espanya', 'num':'5'}, {'nom':'França', 'num':'1'}, {'nom':'Anglaterra', 'num':'1'}, {'nom':'Andorra', 'num':'1'}, {'nom':'Canet de mar', 'num':'1'}, {'nom':'Arenys de mar', 'num':'5'}, {'nom':'Llaveneres', 'num':'1'}, {'nom':'Mataró', 'num':'1'}, {'nom':'Sitges', 'num':'1'}, {'nom':'Japó', 'num':'1'}],
            }
        ]
        return filtres


class documentsRelacionats(ViewletBase):
    render = ViewPageTemplateFile('documents_relacionats.pt')

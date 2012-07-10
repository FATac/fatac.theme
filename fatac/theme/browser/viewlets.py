# -*- coding: utf-8 -*-
from plone.app.layout.viewlets.common import ViewletBase
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class cercador(ViewletBase):
    render = ViewPageTemplateFile('templates/cercador.pt')


class footer(ViewletBase):
    """
    """
    render = ViewPageTemplateFile('templates/footer.pt')

    #def __init__(self, context, request, view, manager=None):
    #    super(footer, self).__init__(context, request, view, manager)

    def titolPortal(self):
        """ retorna el títol del portal
        """

        return self.portal_state.navigation_root_title()

    def isRoot(self):
        """El viewlet mostra contingut sengons si estem a la pagina principal"""
        # Recuperem la url sense la vista
        # (self.request.getURL() ens retorna la vista del document) aixi que fem
        # servir other['ACTUAL_URL']
        current = self.request.other['ACTUAL_URL']
        # Aquesta url pot contenir una / al final, però self.context.portal_url
        # mai en porta, treiem la / de current abans de comparar.
        if current[-1] == '/':
            current = current[:-1]
        return self.context.portal_url() == current

    def retLinkGeneric(self, id, tipus):
        """ retorna un diccionari amb el títol, la descripció i la url de
        l'objecte de tipus 'tipus' amb id 'id'
        """
        brain = self.context.portal_catalog.searchResults(portal_type=tipus, id=id)[:1]
        for i in brain:
            trad = i.getObject().getTranslation()
            if trad:
                return {'titol': trad.Title(), 'descripcio': trad.Description(), 'enllac': trad.absolute_url()}
        return None

    def linkequip(self):
        """ retorna un diccionari amb el títol, la descripció i la url del
        document amb id equip, en l'idioma actual
        """
        return self.retLinkGeneric('equip', 'Document')

    def linkajuda(self):
        """ retorna un diccionari amb el títol, la descripció i la url del
        document amb id ajuda, en l'idioma actual
        """
        return self.retLinkGeneric('ajuda', 'Document')

    def linkcontacte(self):
        """ retorna un diccionari amb el títol, la descripció i la url de la
        carpeta amb id contacte, en l'idioma actual
        """
        return self.retLinkGeneric('contacte', 'Folder')

    def linkabout(self):
        """ retorna un diccionari amb el títol, la descripció i la url de la
        carpeta amb id contacte, en l'idioma actual
        """
        return self.retLinkGeneric('sobre-aquest-web', 'Document')

    def linkcomfunciona(self):
        """ retorna un diccionari amb el títol, la descripció i la url de la
        carpeta amb id contacte, en l'idioma actual
        """
        return self.retLinkGeneric('com-funciona', 'Document')

    def linkcredits(self):
        """ retorna un diccionari amb el títol, la descripció i la url de la
        carpeta amb id contacte, en l'idioma actual
        """
        return self.retLinkGeneric('credits', 'Document')

    def linkavislegal(self):
        """ retorna un diccionari amb el títol, la descripció i la url de la
        carpeta amb id contacte, en l'idioma actual
        """
        return self.retLinkGeneric('avis-legal', 'Document')

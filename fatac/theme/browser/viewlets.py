# -*- coding: utf-8 -*-
from plone.app.layout.viewlets.common import ViewletBase
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class cercador(ViewletBase):
    render = ViewPageTemplateFile('templates/cercador.pt')


class onestem(ViewletBase):
    render = ViewPageTemplateFile('templates/onestem.pt')


class opcions(ViewletBase):
    render = ViewPageTemplateFile('templates/opcions.pt')


class documentsRelacionats(ViewletBase):
    render = ViewPageTemplateFile('templates/documents_relacionats.pt')


class footer(ViewletBase):
    """
    """
    render = ViewPageTemplateFile('templates/footer.pt')

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

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

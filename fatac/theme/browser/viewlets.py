# -*- coding: utf-8 -*-
from plone.app.layout.viewlets.common import ViewletBase
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class cercador(ViewletBase):
    render = ViewPageTemplateFile('cercador.pt')


class onestem(ViewletBase):
    render = ViewPageTemplateFile('onestem.pt')


class opcions(ViewletBase):
    render = ViewPageTemplateFile('opcions.pt')

class documentsRelacionats(ViewletBase):
    render = ViewPageTemplateFile('documents_relacionats.pt')
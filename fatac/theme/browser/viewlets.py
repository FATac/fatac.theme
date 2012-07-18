# -*- coding: utf-8 -*-
from plone.app.layout.viewlets.common import ViewletBase
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from fatac.theme.browser.utils import utilitats


class cercador(ViewletBase):
    render = ViewPageTemplateFile('templates/cercador.pt')


class footer(ViewletBase, utilitats):
    """
    """
    render = ViewPageTemplateFile('templates/footer.pt')

    #def __init__(self, context, request, view, manager=None):
    #    super(footer, self).__init__(context, request, view, manager)



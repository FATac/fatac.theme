# -*- encoding: utf-8 -*-
from zope.publisher.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from Products.CMFCore.utils import getToolByName
from funcionsCerca import funcionsCerca


class homeView(BrowserView, funcionsCerca):
    """ Home page default view
    """
    __call__ = ViewPageTemplateFile('templates/homeview.pt')

    def __init__(self, context, request):
        BrowserView.__init__(self, context, request)
        self.context = context
        self.request = request

    def getFrontPage(self):
        """ si existeix un Document amb id 'textintro', en retorna el contingut.
        """
        brain = self.context.portal_catalog.searchResults(portal_type='Document', id='textintro')[:1]
        for i in brain:
            trad = i.getObject().getTranslation()
            if trad:
                return trad.CookedBody()
        return None

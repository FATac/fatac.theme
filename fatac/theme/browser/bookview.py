# -*- encoding: utf-8 -*-
from zope.publisher.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from Products.CMFCore.utils import getToolByName


class BookView(BrowserView):
    """ Author Book independent view
    """
    __call__ = ViewPageTemplateFile('templates/bookview.pt')

    def __init__(self, context, request):
        BrowserView.__init__(self, context, request)
        self.context = context
        self.request = request

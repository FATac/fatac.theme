# -*- encoding: utf-8 -*-
from zope.publisher.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from zope.component import getMultiAdapter
from Acquisition import aq_inner


class BookView(BrowserView):
    """ Author Book independent view
    """
    __call__ = ViewPageTemplateFile('templates/bookview.pt')

    def __init__(self, context, request):
        BrowserView.__init__(self, context, request)
        self.context = context
        self.request = request

    def anonymous(self):
        portal_state = getMultiAdapter(
            (self.context, self.request), name="plone_portal_state")
        return portal_state.anonymous()

    def portal_url(self):
        context = aq_inner(self.context)
        tools = getMultiAdapter((context, self.request), name=u'plone_tools')
        return tools.url().getPortalObject().absolute_url()

    def commentclass(self):
        return 'btn btn-success' if not self.anonymous() else 'btn btn-disabled'

# -*- encoding: utf-8 -*-
from zope.publisher.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from zope.component import getMultiAdapter


class homeView(BrowserView):
    """ Home page default view
    """
    __call__ = ViewPageTemplateFile('templates/homeview.pt')

    def __init__(self, context, request):
        BrowserView.__init__(self, context, request)
        self.context = context
        self.request = request

    def getFrontPage(self):
        """ retorna la pagina principal de l'espai, tenint en compte l'idioma i
        els permissos de lusuari validat, amb un restrictedTraverse sobre l'objecte
        """
        page = {}
        portal_state = getMultiAdapter((self.context, self.request), name=u'plone_portal_state')
        portal = portal_state.portal()
        FrontPageObj = portal.textintro.getTranslation()
        idFrontPageObj = FrontPageObj.id
        traversal = portal.restrictedTraverse(idFrontPageObj)
        page['body'] = FrontPageObj.CookedBody()
        return page

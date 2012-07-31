# -*- coding: utf-8 -*-
from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class imageView(BrowserView):
    """ classe per generar una vista html amb la imatge rebuda per request en la
    mida original
    """

    def __init__(self, context, request):
        """ self.servidorRest guarda l'adreça del servidor Rest que serveix les
        dades; self.idobjectes guarda l'id del/s objecte/s del que volem mostrar
        """
        super(BrowserView, self).__init__(context, request)
        self.request = request
        self.context = context
        self.image = self.request.get('image')
        self.title = self.request.get('title')

    def __call__(self):
        """
        """
        return ViewPageTemplateFile('templates/imageView.pt')(self)

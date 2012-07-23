# -*- coding: utf-8 -*-

from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from Products.CMFPlone.PloneBatch import Batch


class allPlaylistsView(BrowserView):
    """
    """
    __call__ = ViewPageTemplateFile('templates/allPlaylistsView.pt')

    def retAllPlaylists(self):
        """ retorna una llista de dicionaris amb les dades de totes les playlists
        ordenades per data de creació inversa
        """

        llista = []
        idiomes = [a for a in self.context.portal_languages.getAvailableLanguages()]
        dades = self.context.portal_catalog.searchResults(portal_type='fatac.playlist',
                                                          sort_on='Date', sort_order='reverse',
                                                          language=idiomes)
        for dada in dades:
            obj = dada.getObject()
            autor = obj.Creator()
            llista.append({'titol': dada.Title,
                           'autor': autor,
                           'obj': obj,
                           'icono': dada.getIcon,
                           'url': dada.getURL()})
        return llista

    def retBatchedItems(self):
        """ retorna els objectes paginats
        """

        all_items = self.retAllPlaylists()
        b_start = self.request.get('b_start', 0)
        b_size = self.request.get('b_size', 15)
        batch = Batch(all_items, b_size, int(b_start), orphan=1)
        return batch

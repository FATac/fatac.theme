from plone.theme.interfaces import IDefaultPloneLayer
from zope import schema
from zope.interface import Interface
from fatac.theme import FatacThemeMessageFactory as _


class IThemeSpecific(IDefaultPloneLayer):
    """Marker interface that defines a Zope 3 browser layer.
    """


class IFatacSettings(Interface):
    """Global fatac settings. This describes records stored in the
    configuration registry and obtainable via plone.registry.
    """

    # Backend uri for the internal plone querys
    rest_server = schema.TextLine(title=_(u"REST server URI"),
                                  description=_(u"Per exemple: http://localhost:8080/ArtsCombinatoriesRest"),
                                  required=False,
                                  default=u'http://localhost:8080/ArtsCombinatoriesRest',)

    # Public backend uri for thumbnails and classes (or end user requests)
    rest_public_server = schema.TextLine(title=_(u"REST server public URI"),
                                  description=_(u"Per exemple: http://example.com/rest/"),
                                  required=False,
                                  default=u'http://example.com/rest',)
    # Public uri for media
    media_server = schema.TextLine(title=_(u"Media Server URI"),
                                   description=_(u"Per exemple: http://localhost:8080/ArtsCombinatoriesRest/media/"),
                                   required=False,
                                   default=u'http://localhost:8080/ArtsCombinatoriesRest/media/',)

    # Timeout for the internal querys to the backend
    rest_timeout = schema.Int(title=_(u"REST request timeout"),
                                   description=_(u"Timeout in seconds for the resquests to the REST Serve."),
                                   required=False,
                                   min=2,
                                   max=30,
                                   default=5,)
    # Cache time in minutes
    cache_time = schema.Int(title=_(u"Cache time"),
                                   description=_(u"Duration of the internal cache in minutes, it must be betwen 0 and 60"),
                                   required=False,
                                   min=0,
                                   max=60,
                                   default=5,)

    # Public uri for media
    arts_folder = schema.TextLine(title=_(u"Arts folder"),
                                   description=_(u"Folder name where the Plone representations of the rest objectes will be created, must be inside root folder."),
                                   required=False,
                                   default=u'arts',)
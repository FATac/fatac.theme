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

    rest_server = schema.TextLine(title=_(u"REST Server URI"),
                                  description=_(u"Per exemple: http://localhost:8080/ArtsCombinatoriesRest"),
                                  required=False,
                                  default=u'http://localhost:8080/ArtsCombinatoriesRest',)

    media_server = schema.TextLine(title=_(u"Media Server URI"),
                                   description=_(u"Per exemple: http://localhost:8080/ArtsCombinatoriesRest/media/"),
                                   required=False,
                                   default=u'http://localhost:8080/ArtsCombinatoriesRest/media/',)

    rest_timeout = schema.Int(title=_(u"REST request timeout"),
                                   description=_(u"Timeout in seconds for the resquests to the REST Serve."),
                                   required=False,
                                   min=2,
                                   max=30,
                                   default=5,)

    cache_time = schema.Int(title=_(u"Cache time"),
                                   description=_(u"Duration of the internal cache in minutes, it must be betwen 0 and 60"),
                                   required=False,
                                   min=0,
                                   max=60,
                                   default=5,)

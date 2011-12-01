from plone.theme.interfaces import IDefaultPloneLayer
from zope import schema
from zope.interface import Interface


class IThemeSpecific(IDefaultPloneLayer):
    """Marker interface that defines a Zope 3 browser layer.
    """


class IFatacSettings(Interface):
    """Global fatac settings. This describes records stored in the
    configuration registry and obtainable via plone.registry.
    """

    rest_server = schema.TextLine(title=(u"REST Server URL"),
                                  description=(u"Per exemple: http://localhost:8080/ArtsCombinatoriesRest"),
                                  required=False,
                                  default=u'http://localhost:8080/ArtsCombinatoriesRest',)

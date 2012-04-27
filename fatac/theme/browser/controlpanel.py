from plone.app.registry.browser import controlpanel
from fatac.theme.browser.interfaces import IFatacSettings
from fatac.theme import FatacThemeMessageFactory as _


class FatacSettingsEditForm(controlpanel.RegistryEditForm):
    """
    """

    schema = IFatacSettings
    label = _(u"Fatac settings")
    description = _(u"Specific settings for FATac based sites")

    def updateFields(self):
        """
        """
        super(FatacSettingsEditForm, self).updateFields()

    def updateWidgets(self):
        """
        """
        super(FatacSettingsEditForm, self).updateWidgets()


class FatacSettingsControlPanel(controlpanel.ControlPanelFormWrapper):
    """
    """
    form = FatacSettingsEditForm

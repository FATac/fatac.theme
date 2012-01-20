from plone.app.registry.browser import controlpanel
from fatac.theme.browser.interfaces import IFatacSettings


class FatacSettingsEditForm(controlpanel.RegistryEditForm):
    """
    """

    schema = IFatacSettings
    label = (u"Fatac settings")
    description = (u"""""")

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

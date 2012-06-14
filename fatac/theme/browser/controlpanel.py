# -*- coding: utf-8 -*-
from plone.app.registry.browser import controlpanel
from fatac.theme.browser.interfaces import IFatacSettings
from fatac.theme import FatacThemeMessageFactory as _
from z3c.form import button
from Products.statusmessages.interfaces import IStatusMessage
from Products.CMFCore.utils import getToolByName

from fatac.core.utils import crearObjecte


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

    @button.buttonAndHandler(_('Save'), name=None)
    def handleSave(self, action):
        data, errors = self.extractData()
        if errors:
            self.status = self.formErrorsMessage
            return
        self.applyChanges(data)

        self.create_ghostContainer(data['arts_folder'])

        IStatusMessage(self.request).addStatusMessage(_(u"Changes saved"),
                                                      "info")
        self.context.REQUEST.RESPONSE.redirect("@@fatac_settings")

    @button.buttonAndHandler(_('Cancel'), name='cancel')
    def handleCancel(self, action):
        IStatusMessage(self.request).addStatusMessage(_(u"Edit cancelled"),
                                                      "info")
        self.request.response.redirect("%s/%s" % (self.context.absolute_url(),
                                                  self.control_panel_view))

    def create_ghostContainer(self, nom_container):
        portal = getToolByName(self, 'portal_url').getPortalObject()
        crearObjecte(portal, nom_container, 'Folder', 'Contenidor objectes ghost', 'Aquest es el contenidor dels objectes que representen els objectes de la base de dades semàntica')


class FatacSettingsControlPanel(controlpanel.ControlPanelFormWrapper):
    """
    """
    form = FatacSettingsEditForm

# -*- coding: utf-8 -*-
from plone.app.registry.browser import controlpanel
from fatac.theme.browser.interfaces import IFatacSettings
from fatac.theme import FatacThemeMessageFactory as _
from z3c.form import button
from Products.statusmessages.interfaces import IStatusMessage
from Products.CMFCore.utils import getToolByName
from Products.CMFPlone.utils import _createObjectByType


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

        self.create_ghostContainer()

        IStatusMessage(self.request).addStatusMessage(_(u"Changes saved"),
                                                      "info")
        self.context.REQUEST.RESPONSE.redirect("@@fatac_settings")

    def create_ghostContainer(self, nom_container):
        portal = getToolByName(self, 'portal_url').getPortalObject()
        self.crearObjecte(portal, nom_container, 'Folder', 'Contenidor objectes ghost', 'Aquest es el contenidor dels objectes que representen els objectes de la base de dades semàntica')

    def crearObjecte(self, context, id, type_name, title, description, exclude=True, constrains=None):
        pt = getToolByName(context, 'portal_types')
        if not getattr(context, id, False) and type_name in pt.listTypeTitles().keys():
            #creem l'objecte i el publiquem
            _createObjectByType(type_name, context, id)
        #populem l'objecte
        created = context[id]
        self.doWorkflowAction(created)
        created.setTitle(title)
        created.setDescription(description)
        created._at_creation_flag = False
        created.setExcludeFromNav(exclude)
        if constrains:
            created.setConstrainTypesMode(1)
            if len(constrains) > 1:
                created.setLocallyAllowedTypes(tuple(constrains[0] + constrains[1]))
            else:
                created.setLocallyAllowedTypes(tuple(constrains[0]))
            created.setImmediatelyAddableTypes(tuple(constrains[0]))

        created.reindexObject()
        return created

    def doWorkflowAction(self, context):
        pw = getToolByName(context, "portal_workflow")
        object_workflow = pw.getWorkflowsFor(context)[0].id
        object_status = pw.getStatusOf(object_workflow, context)
        if object_status:
            try:
                pw.doActionFor(context, {'genweb_simple': 'publish', 'genweb_review': 'publicaalaintranet'}[object_workflow])
            except:
                pass


class FatacSettingsControlPanel(controlpanel.ControlPanelFormWrapper):
    """
    """
    form = FatacSettingsEditForm

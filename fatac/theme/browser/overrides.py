from plone.app.layout.viewlets.common import PersonalBarViewlet
from plone.app.i18n.locales.browser.selector import LanguageSelector
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class PersonalBarViewletFatac(PersonalBarViewlet):
    index = ViewPageTemplateFile('personal_bar.pt')


class LanguageSelectorFatac(LanguageSelector):
    render = ViewPageTemplateFile('languageselector.pt')

    def retIdiomes(self):
        """
        """
        altres_idiomes = []
        for lang in self.languages():
            dades = {'code': lang['code'], 'name': lang['name'], 'shortname': lang['name'][0:3].lower()}
            if lang['selected']:
                idioma_actual = dades
            else:
                altres_idiomes.append(dades)
        return {'idioma_actual': idioma_actual, 'altres_idiomes': altres_idiomes}

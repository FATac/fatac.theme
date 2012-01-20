from plone.app.layout.viewlets.common import PersonalBarViewlet
from plone.app.i18n.locales.browser.selector import LanguageSelector
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class PersonalBarViewletFatac(PersonalBarViewlet):
    """
    """
    index = ViewPageTemplateFile('templates/personal_bar.pt')


class LanguageSelectorFatac(LanguageSelector):
    """
    """
    render = ViewPageTemplateFile('templates/languageselector.pt')

    def retIdiomes(self):
        """ retorna un diccionari amb el codi i el nom de l'idioma actiu i dels
        idiomes disponibles
        """
        altres_idiomes = []
        for lang in self.languages():
            dades = {'code': lang['code'], 'name': lang['name']}
            if lang['selected']:
                idioma_actual = dades
            else:
                altres_idiomes.append(dades)
        return {'idioma_actual': idioma_actual, 'altres_idiomes': altres_idiomes}

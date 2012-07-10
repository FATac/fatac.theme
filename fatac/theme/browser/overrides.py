from plone.app.layout.viewlets.common import PersonalBarViewlet
from plone.app.i18n.locales.browser.selector import LanguageSelector
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from zope.component import getMultiAdapter
from Products.LinguaPlone.interfaces import ITranslatable


class PersonalBarViewletFatac(PersonalBarViewlet):
    """
    """
    index = ViewPageTemplateFile('templates/personal_bar.pt')


class LanguageSelectorFatac(LanguageSelector):
    """
    """
    render = ViewPageTemplateFile('templates/languageselector.pt')

    def retIdiomesOld(self):
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

    def retIdiomes(self):
        """ retorna un diccionari amb la url, el codi i el nom de l'idioma actiu i dels
        idiomes disponibles
        """
        results = LanguageSelector.languages(self)
        translatable = ITranslatable(self.context, None)
        if translatable is not None:
            translations = translatable.getTranslations()
        else:
            translations = []

        for data in results:
            data['translated'] = data['code'] in translations
            if data['translated']:
                trans = translations[data['code']][0]
                state = getMultiAdapter((trans, self.request),
                        name='plone_context_state')
                data['url'] = state.view_url() + '?set_language=' + data['code']
            else:
                state = getMultiAdapter((self.context, self.request),
                        name='plone_context_state')
                try:
                    data['url'] = state.view_url() + '?set_language=' + data['code']
                except AttributeError:
                    data['url'] = self.context.absolute_url() + '?set_language=' + data['code']

        altres_idiomes = []
        for resultat in results:
            dades = {'code': resultat['code'], 'name': resultat['name'], 'url': resultat['url']}
            if resultat['selected']:
                idioma_actual = dades
            else:
                altres_idiomes.append(dades)

        return {'idioma_actual': idioma_actual, 'altres_idiomes': altres_idiomes}

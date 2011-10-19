from plone.app.layout.viewlets.common import PersonalBarViewlet
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class PersonalBarViewletFatac(PersonalBarViewlet):
    index = ViewPageTemplateFile('personal_bar.pt')

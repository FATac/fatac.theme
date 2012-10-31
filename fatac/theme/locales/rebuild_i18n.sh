#! /bin/sh

# Sincroniza el pot con las plantillas y los scripts

/var/plone/python2.7/bin/i18ndude rebuild-pot --pot pot/LC_MESSAGES/fatac.theme.pot \
    --create fatac.theme ../../../../fatac.theme ../../../../fatac.core ../../../../fatac.forms ../../../../fatac.content

/var/plone/python2.7/bin/i18ndude rebuild-pot --pot pot/LC_MESSAGES/plone.pot \
    --create plone ../../../../fatac.theme ../../../../fatac.core ../../../../fatac.forms ../../../../fatac.content

# Añadir las traducciones que se hayan añadido a mano en los .po

/var/plone/python2.7/bin/i18ndude merge --pot pot/LC_MESSAGES/fatac.theme.pot \
    --merge ca/LC_MESSAGES/fatac.theme.po
/var/plone/python2.7/bin/i18ndude merge --pot pot/LC_MESSAGES/fatac.theme.pot \
    --merge es/LC_MESSAGES/fatac.theme.po
/var/plone/python2.7/bin/i18ndude merge --pot pot/LC_MESSAGES/fatac.theme.pot \
    --merge en/LC_MESSAGES/fatac.theme.po
/var/plone/python2.7/bin/i18ndude merge --pot pot/LC_MESSAGES/plone.pot \
    --merge ca/LC_MESSAGES/plone.po
/var/plone/python2.7/bin/i18ndude merge --pot pot/LC_MESSAGES/plone.pot \
    --merge es/LC_MESSAGES/plone.po
/var/plone/python2.7/bin/i18ndude merge --pot pot/LC_MESSAGES/plone.pot \
    --merge en/LC_MESSAGES/plone.po

# Actualiza las entradas de los .po con el .pot sin borrar las anteriores

/var/plone/python2.7/bin/i18ndude sync --pot pot/LC_MESSAGES/fatac.theme.pot \
    ca/LC_MESSAGES/fatac.theme.po
/var/plone/python2.7/bin/i18ndude sync --pot pot/LC_MESSAGES/fatac.theme.pot \
    es/LC_MESSAGES/fatac.theme.po
/var/plone/python2.7/bin/i18ndude sync --pot pot/LC_MESSAGES/fatac.theme.pot \
    en/LC_MESSAGES/fatac.theme.po
/var/plone/python2.7/bin/i18ndude sync --pot pot/LC_MESSAGES/plone.pot \
    ca/LC_MESSAGES/plone.po
/var/plone/python2.7/bin/i18ndude sync --pot pot/LC_MESSAGES/plone.pot \
    es/LC_MESSAGES/plone.po
/var/plone/python2.7/bin/i18ndude sync --pot pot/LC_MESSAGES/plone.pot \
    en/LC_MESSAGES/plone.po

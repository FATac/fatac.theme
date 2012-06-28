from plone.app.discussion.browser.comments import CommentsViewlet
from Products.CMFCore.utils import getToolByName
from plone.app.discussion.interfaces import IConversation
from fatac.theme import FatacThemeMessageFactory as FATACMF
from AccessControl import getSecurityManager
from Products.CMFCore import permissions


class CustomCommentsViewlet(CommentsViewlet):

    def can_delete(self, creator):
        pm = getToolByName(self.context, "portal_membership")
        username = pm.getAuthenticatedMember().getUserName()
        userIsManager = getSecurityManager().checkPermission(permissions.ManagePortal, self.context)
        if creator == username:
            return True
        elif userIsManager:
            return True
        else:
            return False

    def numberOfComments(self):
        singular = FATACMF('comment')
        plural = FATACMF('comments')
        cap = FATACMF('any_comments')
        number = IConversation(self.context).total_comments
        if number == 1:
            return "%s %s" % (str(number), singular)
        elif number == 0:
            return "%s %s" % (str(number), cap)
        else:
            return "%s %s" % (str(number), plural)

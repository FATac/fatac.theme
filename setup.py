from setuptools import setup, find_packages
import os

version = '1.1'

setup(name='fatac.theme',
      version=version,
      description="FATAC Theme",
      long_description=open("README.txt").read() + "\n" +
                       open(os.path.join("docs", "HISTORY.txt")).read(),
      # Get more strings from
      # http://pypi.python.org/pypi?:action=list_classifiers
      classifiers=[
        "Framework :: Plone",
        "Programming Language :: Python",
        ],
      keywords='web zope plone theme',
      author='UPCnet Plone Team',
      author_email='plone.team@upcnet.es',
      url='http://svn.plone.org/svn/collective/',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['fatac'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          'collective.js.jqueryui'
      ],
      entry_points="""
      # -*- Entry points: -*-

      [z3c.autoinclude.plugin]
      target = plone
      """,
      setup_requires=[""],
      )

import os, sys, site

# enable the virtualenv
site.addsitedir('/var/www/tako/tako/ve/lib/python2.7/site-packages')

# paths we might need to pick up the project's settings
sys.path.append('/var/www/')
sys.path.append('/var/www/tako/')
sys.path.append('/var/www/tako/tako/')

os.environ['DJANGO_SETTINGS_MODULE'] = 'tako.settings_production'

import django.core.handlers.wsgi

application = django.core.handlers.wsgi.WSGIHandler()

# flake8: noqa
from settings_shared import *

TEMPLATE_DIRS = (
    "/var/www/tako/tako/tako/templates",
)

MEDIA_ROOT = '/var/www/tako/uploads/'
# put any static media here to override app served static media
STATICMEDIA_MOUNTS = (
    ('/sitemedia', '/var/www/tako/tako/sitemedia'),)

STATICFILES_DIRS = ()
STATIC_ROOT = "/var/www/tako/tako/media/"

DEBUG = False
TEMPLATE_DEBUG = DEBUG

try:
    from local_settings import *
except ImportError:
    pass
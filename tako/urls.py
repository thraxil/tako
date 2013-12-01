from django.conf.urls import patterns, include
from django.contrib import admin
from django.conf import settings
admin.autodiscover()


redirect_after_logout = getattr(settings, 'LOGOUT_REDIRECT_URL', None)
auth_urls = (r'^accounts/', include('django.contrib.auth.urls'))
logout_page = (r'^accounts/logout/$',
               'django.contrib.auth.views.logout',
               {'next_page': redirect_after_logout})
if hasattr(settings, 'WIND_BASE'):
    auth_urls = (r'^accounts/', include('djangowind.urls'))
    logout_page = (r'^accounts/logout/$',
                   'djangowind.views.logout',
                   {'next_page': redirect_after_logout})

urlpatterns = patterns(
    '',
    auth_urls,
    logout_page,
    (r'^api/(?P<node_id>\d*)/?$', 'tako.main.views.api'),
    (r'^api/(?P<node_id>\d*)/reorder/?$', 'tako.main.views.reorder'),
    (r'^search/$', 'tako.main.views.search'),
    (r'^(?P<node_id>\d*)/edit/$', 'tako.main.views.edit'),
    (r'^(?P<node_id>\d*)/?$', 'tako.main.views.node'),
    (r'^(?P<node_id>\d*)/?add/$', 'tako.main.views.add'),
    (r'^admin/', include(admin.site.urls)),
)

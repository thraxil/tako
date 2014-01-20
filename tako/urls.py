from django.conf.urls import patterns, include
from django.contrib import admin
admin.autodiscover()


urlpatterns = patterns(
    '',
    (r'^accounts/', include('django.contrib.auth.urls')),
    (r'^api/(?P<node_id>\d*)/?$', 'tako.main.views.api'),
    (r'^api/(?P<node_id>\d*)/reorder/?$', 'tako.main.views.reorder'),
    (r'^search/$', 'tako.main.views.search'),
    (r'^(?P<node_id>\d*)/edit/$', 'tako.main.views.edit'),
    (r'^(?P<node_id>\d*)/?$', 'tako.main.views.node'),
    (r'^(?P<node_id>\d*)/?add/$', 'tako.main.views.add'),
    (r'^admin/', include(admin.site.urls)),
)

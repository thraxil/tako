from lettuce import *
from django.test.client import Client
from twill import get_browser
from lettuce.django import django_url

@before.all
def set_browser():
    world.browser = Client()

@step(r'I access the url "(.*)"')
def access_url(step, url):
    world.response = world.browser.get(django_url(url))
#    world.dom = html.fromstring(response.content)

@step(r'I see the header "(.*)"')
def see_header(step, text):
 #   header = world.dom.cssselect('h1')[0]
#    assert header.text == text
#    print str(dir(world.response))
    assert text in world.response.content

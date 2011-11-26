from lettuce import *
from django.test.client import Client
from lettuce.django import django_url
from twill import get_browser

@before.all
def set_browser():
    world.browser = get_browser()

@step(r'I access the url "(.*)"')
def access_url(step, url):
    r = world.browser.go(django_url(url))

@step(r'I see the header "(.*)"')
def see_header(step, text):
    assert text in world.browser.get_html()

@step(r'I see the text "(.*)"')
def see_text(step, text):
    assert text.lower() in world.browser.get_html().lower()

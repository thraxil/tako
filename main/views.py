from tako.main.models import Node
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseNotFound
from annoying.decorators import render_to

@render_to("main/index.html")
def index(request):
    return dict()

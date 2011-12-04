from tako.main.models import Node, user_top_level
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseNotFound
from annoying.decorators import render_to
from simplejson import loads, dumps

@login_required
@render_to("main/index.html")
def node(request,node_id):
    if node_id:
        n = get_object_or_404(Node,id=node_id)
        return dict(node=n,nodes=n.get_children())
    else:
        return dict(nodes=user_top_level(request.user))

@login_required
def add(request,node_id):
    if node_id:
        p = get_object_or_404(Node,id=node_id)
        p.add_child(user=request.user,label=request.POST.get('label',''))
        return HttpResponseRedirect(p.get_absolute_url())
    else:
        n = Node.add_root(user=request.user,label=request.POST.get('label',''))
        return HttpResponseRedirect("/")

@login_required
def api(request,node_id):
    if request.method == "POST":
        d = loads(request.read())
        if node_id:
            p = get_object_or_404(Node,id=node_id)
            p.add_child(user=request.user,label=d['label'])
        else:
            n = Node.add_root(user=request.user,label=d['label'])

    if request.method == "PUT":
        if node_id:
            n = get_object_or_404(Node,id=node_id)
            d = loads(request.read())
            n.label = d['label']
            n.details = d['details']
            n.save()

    if request.method == "DELETE":
        if node_id:
            n = get_object_or_404(Node,id=node_id)
            n.delete()
            return HttpResponse(dumps({}),mimetype="application/json")

    if node_id:
        n = get_object_or_404(Node,id=node_id)
        return HttpResponse(dumps([n.as_dict() for n in n.get_children()]),
                            mimetype="application/json")
    else:
        nodes = user_top_level(request.user)
        return HttpResponse(dumps([n.as_dict() for n in nodes]), 
                            mimetype="application/json")

from django.db.models import Q
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
        return dict(node=n)
    else:
        return dict()

@login_required
@render_to("main/search.html")
def search(request):
    q = request.GET.get("q","")
    results = Node.objects.filter(Q(label__icontains=q) | Q(details__icontains=q))
    return dict(q=q,results=results)

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
def edit(request,node_id):
    node = get_object_or_404(Node,id=node_id)
    node.label = request.POST.get('label','')
    node.details = request.POST.get('details','')
    node.save()
    return HttpResponseRedirect("/%d/" % node.id)

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

@login_required
def reorder(request,node_id):
    if request.method == "POST":
        p = get_object_or_404(Node,id=node_id)
        keys = [k for k in request.GET.keys() if k.startswith("node_")]
        keys.sort(key=lambda x:int(x.split("_")[1]))
        children = [int(request.GET[k]) for k in keys if k.startswith('node_')]
        p.update_children_order(children)
        return HttpResponse("ok")
    return HttpResponse("POST, only. Thanks")

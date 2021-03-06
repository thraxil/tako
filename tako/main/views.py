from django.db.models import Q
from tako.main.models import Node, user_top_level
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse
from annoying.decorators import render_to
from json import loads, dumps
from datetime import datetime


@login_required
@render_to("main/index.html")
def node(request, node_id):
    due = Node.objects.filter(user=request.user, target=datetime.now())
    overdue = Node.objects.filter(
        user=request.user,
        target__lt=datetime.now()).order_by("target")
    upcoming = Node.objects.filter(
        user=request.user,
        target__gt=datetime.now()).order_by("target")[:10]
    d = dict(due=due, overdue=overdue, upcoming=upcoming)
    if node_id:
        n = get_object_or_404(Node, id=node_id)
        if n.user.id != request.user.id:
            return HttpResponse("you are not the owner of this node")
        d['node'] = n
    return d


@login_required
@render_to("main/search.html")
def search(request):
    q = request.GET.get("q", "")
    results = Node.objects.filter(
        Q(label__icontains=q) | Q(details__icontains=q),
        user=request.user)
    return dict(q=q, results=results)


@login_required
def add(request, node_id):
    if node_id:
        p = get_object_or_404(Node, id=node_id)
        if p.user.id != request.user.id:
            return HttpResponse("you are not the owner of this node")
        p.add_child(user=request.user, label=request.POST.get('label', ''))
        return HttpResponseRedirect(p.get_absolute_url())
    else:
        Node.add_root(user=request.user, label=request.POST.get('label', ''))
        return HttpResponseRedirect("/")


@login_required
def edit(request, node_id):
    node = get_object_or_404(Node, id=node_id)
    if node.user.id != request.user.id:
        return HttpResponse("you are not the owner of this node")
    node.label = request.POST.get('label', '')
    node.details = request.POST.get('details', '')
    if request.POST.get('target', None):
        node.target = request.POST.get('target', None)
    else:
        node.target = None
    node.save()
    return HttpResponseRedirect("/%d/" % node.id)


@login_required
def api(request, node_id):
    if request.method == "POST":
        d = loads(request.read())
        if node_id:
            p = get_object_or_404(Node, id=node_id)
            if p.user.id != request.user.id:
                return HttpResponse("you are not the owner of this node")
            p.add_child(user=request.user, label=d['label'])
        else:
            n = Node.add_root(user=request.user, label=d['label'])
    if request.method == "PUT" and node_id:
        n = get_object_or_404(Node, id=node_id)
        if n.user.id != request.user.id:
            return HttpResponse("you are not the owner of this node")
        d = loads(request.read())
        n.label = d['label']
        n.details = d['details']
        if 'target' in d and d['target'] != "":
            n.target = d['target']
        n.save()
    if request.method == "DELETE" and node_id:
        return api_delete_node(request, node_id)

    return api_get(request, node_id)


def api_delete_node(request, node_id):
    n = get_object_or_404(Node, id=node_id)
    if n.user.id != request.user.id:
        return HttpResponse("you are not the owner of this node")
    n.delete()
    return HttpResponse(dumps({}), content_type="application/json")


def api_get(request, node_id):
    if node_id:
        n = get_object_or_404(Node, id=node_id)
        if n.user.id != request.user.id:
            return HttpResponse("you are not the owner of this node")

        return HttpResponse(dumps([c.as_dict() for c in n.get_children()]),
                            content_type="application/json")
    else:
        nodes = user_top_level(request.user)
        return HttpResponse(
            dumps([n.as_dict() for n in nodes]),
            content_type="application/json")


@login_required
def reorder(request, node_id):
    if request.method == "POST":
        p = get_object_or_404(Node, id=node_id)
        if p.user.id != request.user.id:
            return HttpResponse("you are not the owner of this node")
        keys = [k for k in request.GET.keys() if k.startswith("node_")]
        keys.sort(key=lambda x: int(x.split("_")[1]))
        children = [int(request.GET[k]) for k in keys if k.startswith('node_')]
        p.update_children_order(children)
        return HttpResponse("ok")
    return HttpResponse("POST, only. Thanks")

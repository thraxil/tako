from tako.main.models import Node, user_top_level
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseNotFound
from annoying.decorators import render_to

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
        p = get_object_or_404(Node,id=parent_id)
        return HttpResponseRedirect(p.get_absolute_url())
    else:
        n = Node.add_root(user=request.user,label=request.POST.get('label',''))
        return HttpResponseRedirect("/")

from django.db import models
from django.template.defaultfilters import slugify
from treebeard.mp_tree import MP_Node
from django.contrib.auth.models import User

class Node(MP_Node):
    label = models.CharField(max_length=256,default="")
    slug = models.SlugField(max_length=256,editable=False)
    user = models.ForeignKey(User)
    details = models.TextField(blank=True,default="")
    added = models.DateTimeField(auto_now_add=True,editable=False)
    modified = models.DateTimeField(auto_now=True,editable=False)

    def save(self,*args,**kwargs):
        slug = slugify(self.label)[:255]
        # TODO: uniquify for the particular level of the tree
#        addto = 1
#        while Node.objects.filter(slug=slug).count() > 0:
#            slug = slug + str(addto)
#            addto += 1
        self.slug = slug
        super(Node, self).save(*args,**kwargs)

def user_top_level(user):
    return Node.get_root_nodes().filter(user=user)

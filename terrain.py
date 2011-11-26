from lettuce.terrain import *
from django.contrib.auth.models import User

@before.each_feature
def populate_blog_database(feature):
    User.objects.create(username='testuser',first_name="test",last_name="user",
                        email='testuser@thraxil.org',password="foobar")

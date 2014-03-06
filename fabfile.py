from fabric.api import run, sudo, local, cd, env

env.hosts = ['orlando.thraxil.org']
nginx_hosts = ['lolrus.thraxil.org']
env.forward_agent = True
env.user = 'anders'

def restart_gunicorn():
    sudo("restart tako")

def prepare_deploy():
    local("./manage.py test")

def deploy():
    code_dir = "/var/www/tako/tako"
    with cd(code_dir):
        run("git pull origin master")
        run("./bootstrap.py")
        run("./manage.py migrate")
        run("./manage.py collectstatic --noinput --settings=tako.settings_production")
        for n in nginx_hosts:
            run(("rsync -avp --delete media/ "
                 "%s:/var/www/tako/tako/media/") % n)
    restart_gunicorn()

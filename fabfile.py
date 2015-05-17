from fabric.api import run, sudo, local, cd, env

env.hosts = ['orlando.thraxil.org']
nginx_hosts = ['north.thraxil.org']
env.user = 'anders'

def restart_gunicorn():
    sudo("restart tako", shell=False)

def prepare_deploy():
    local("make test")
    local("make flake8")

def deploy():
    code_dir = "/var/www/tako/tako"
    with cd(code_dir):
        run("git pull origin master")
        run("make migrate")
        run("make collectstatic")
        run("make compress")
    restart_gunicorn()

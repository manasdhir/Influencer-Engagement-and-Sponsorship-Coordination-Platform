from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemySessionUserDatastore, auth_required 
from flask_caching  import Cache
from backend.celery.celery_f import celery_init_app
import flask_excel as xlsx
def createApp():
    app= Flask (__name__, template_folder='frontend',static_folder='frontend', static_url_path='/static')
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    cache=Cache(app)
    datast=SQLAlchemySessionUserDatastore(db.session,User, Role)
    app.cache=cache
    app.security=Security(app, datastore=datast, register_blueprint=False)
    app.app_context().push()
    return app

app=createApp()
celery_app=celery_init_app(app)
import backend.celery.celety_schedule
import backend.create_init_data

import backend.routes 
xlsx.init_excel(app)
if(__name__=='__main__'):
    app.run(debug=True)
from flask import current_app as app
from backend.models import db
from flask_security import SQLAlchemyUserDatastore, hash_password 
with app.app_context():
    db.create_all()
    userds : SQLAlchemyUserDatastore =app.security.datastore
    userds.find_or_create_role(name='admin', desc= 'superuser')
    userds.find_or_create_role(name='sponsor', desc='company or product')
    userds.find_or_create_role(name='influencer', desc='people looking to promote products on their social media')
    if not userds.find_user(email='admin@gmail.com'):
        userds.create_user(email='admin@gmail.com', password=hash_password('admin'), roles=['admin'])
    #if not userds.find_user(email='sponsor@gmail.com'):
        #userds.create_user(email='sponsor@gmail.com', password=hash_password('sponsor'), roles=['sponsor'])
    #if not userds.find_user(email='influencer@gmail.com'):
        #userds.create_user(email='influencer@gmail.com', password=hash_password('influencer'), roles=['influencer'])
    db.session.commit()

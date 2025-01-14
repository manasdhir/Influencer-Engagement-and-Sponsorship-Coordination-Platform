from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime

db=SQLAlchemy()

class User(db.Model, UserMixin):
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)
    active = db.Column(db.Boolean, default=True)
    roles = db.Relationship('Role', backref='role', secondary='user_roles')
    last_login = db.Column(db.DateTime, nullable=True)  

class Role(db.Model, RoleMixin):
    id= db.Column(db.Integer, primary_key=True)
    name= db.Column(db.String, unique=True, nullable=False)
    desc= db.Column(db.String, nullable=False)

class UserRoles(db.Model):
    id= db.Column(db.Integer, primary_key=True)
    user_id= db.Column(db.Integer, db.ForeignKey('user.user_id'))
    role_id= db.Column(db.Integer, db.ForeignKey('role.id'))

class SponsorDetails(db.Model):
    sponsor_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    company_name = db.Column(db.String)
    industry = db.Column(db.String)
    status=db.Column(db.String, default='Not Approved')

class InfluencerDetails(db.Model):
    influencer_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    name = db.Column(db.String)
    category = db.Column(db.String)
    niche = db.Column(db.String)
    reach = db.Column(db.Integer)
    ad_requests = db.relationship('AdRequestDetails', backref='influencer', lazy=True)

class CampaignDetails(db.Model):
    campaign_id = db.Column(db.Integer, primary_key=True)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('sponsor_details.sponsor_id'))
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    budget = db.Column(db.Float)
    visibility = db.Column(db.String(10))
    goals = db.Column(db.Text)
    niche = db.Column(db.String(120))

class AdRequestDetails(db.Model):
    ad_request_id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign_details.campaign_id'))
    influencer_id = db.Column(db.Integer, db.ForeignKey('influencer_details.influencer_id'))
    messages = db.Column(db.Text)
    requirements = db.Column(db.Text)
    payment_amount = db.Column(db.Float)
    status = db.Column(db.String(10))

class FlaggedUserDetails(db.Model):
    flag_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign_details.campaign_id'))
    reason = db.Column(db.Text)
    flagged_at = db.Column(db.DateTime, default=db.func.current_timestamp())


from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import sendemail
from backend.models import db, User, InfluencerDetails, AdRequestDetails, CampaignDetails
from datetime import datetime, timedelta

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=20, minute=41),  
        daily_reminders.s(),
        name="Daily Influencer Reminders"
    )

    sender.add_periodic_task(
        crontab(hour=0, minute=0, day_of_month=1),  
        monthly_activity_report.s(),
        name="Monthly Sponsor Reports"
    )

@celery_app.task
def daily_reminders():
    influencers = (
    db.session.query(User, InfluencerDetails)
    .join(InfluencerDetails, User.user_id == InfluencerDetails.user_id)
    .filter(
        (User.last_login == None) |  
        (User.last_login < datetime.utcnow() - timedelta(hours=24)) | 
        (AdRequestDetails.query.filter_by(
            influencer_id=InfluencerDetails.influencer_id, 
            status='Sent to Influencer'
        ).count() > 0)  
    )
).all()
    print(influencers)
    for user, influencer in influencers:
        sendemail(
            to=user.email,
            subject="Reminder: Pending Actions",
            content=f"""
                <h1>Hello {influencer.name},</h1>
                <p>You have pending ad requests or haven't logged in recently. Please log in to the platform to check your tasks.</p>
                <p>Visit the platform to view ad requests and stay updated!</p>
                <p>Thank you!</p>
            """
        )

@celery_app.task
def monthly_activity_report():
    sponsors = User.query.join(
        CampaignDetails, User.user_id == CampaignDetails.sponsor_id
    ).all()

    for sponsor in sponsors:
        campaigns = CampaignDetails.query.filter_by(sponsor_id=sponsor.user_id).all()
        total_ads = sum(
            AdRequestDetails.query.filter_by(campaign_id=campaign.campaign_id, status="Accepted").count()
            for campaign in campaigns
        )
        total_budget_used = sum(
            ad.payment_amount for campaign in campaigns
            for ad in AdRequestDetails.query.filter_by(campaign_id=campaign.campaign_id, status="Accepted").all()
        )
        total_budget_remaining = sum(campaign.budget for campaign in campaigns) - total_budget_used
        report_content = f"""
            <h1>Monthly Activity Report</h1>
            <p>Dear {sponsor.email},</p>
            <p>Here is your activity report for the past month:</p>
            <ul>
                <li>Total campaigns: {len(campaigns)}</li>
                <li>Total advertisements completed: {total_ads}</li>
                <li>Budget used: ${total_budget_used:.2f}</li>
                <li>Budget remaining: ${total_budget_remaining:.2f}</li>
            </ul>
            <p>Thank you for using our platform!</p>
        """
        
        sendemail(
            to=sponsor.email,
            subject="Monthly Activity Report",
            content=report_content
        )

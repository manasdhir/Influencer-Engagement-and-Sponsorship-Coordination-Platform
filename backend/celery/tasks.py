from celery import shared_task
import time
from backend.models import CampaignDetails
import flask_excel
from backend.celery.mailservice import sendemail

@shared_task(ignore_results= False)
def add(a,b):
    time.sleep(10)
    return a+b

@shared_task(bind=True,ignore_results=False)
def create_file(self,id):
    data=CampaignDetails.query.filter_by(sponsor_id=id).all()
    taskid=self.request.id
    filename=f'campaign_data_{taskid}'
    column_names=[column.name for column in CampaignDetails.__table__.columns]
    csv= flask_excel.make_response_from_query_sets(data,column_names,file_type='csv')
    with open(f'./backend/celery/user_download/{filename}.csv','wb') as file:
          file.write(csv.data)
    return filename


@shared_task(ignore_results=True)
def email_reminder(to,subject,content):
     sendemail(to,subject,content)
from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, verify_password, hash_password, current_user, roles_required
from backend.models import db,InfluencerDetails,CampaignDetails,User, SponsorDetails, FlaggedUserDetails,AdRequestDetails
from sqlalchemy.orm import aliased
from datetime import datetime
from celery.result import AsyncResult

ds=app.security.datastore
cache=app.cache

@app.get('/')
def home():
    return render_template('index.html')
@app.get('/protected')
@auth_required('token')
def protected():
    return '<h1> protected</h1'

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password:
        return jsonify({"message": 'Email or password missing'}), 404

    user = ds.find_user(email=email)
    if user is None:
        return jsonify({"message": 'User does not exist'}), 400

    if user.roles[0].name != role:
        return jsonify({"message": 'Incorrect role'}), 400

    if not user.active:
        return jsonify({'message': 'User not approved'}), 400

    if verify_password(password, user.password):
        user.last_login = datetime.utcnow()
        db.session.commit()
        return jsonify({
            "token": user.get_auth_token(),
            "email": user.email,
            "role": user.roles[0].name,
            "id": user.user_id
        })

    return jsonify({'message': 'Wrong password'}), 400

@app.route('/registerinf', methods=['post'])
def register():
    data=request.get_json()
    email=data.get('email')
    password=data.get('password')
    role=data.get('role')
    name=data.get('name')
    category=data.get('category')
    niche=data.get('niche')
    reach=data.get('reach')
    print(password)
    if not email or not password or role not in ['admin','influencer','sponsor']:
        return jsonify({"message":"invalid inputs"}), 404
    
    user=ds.find_user(email=email)
    
    if user:
        return jsonify({'message':'user already exists'}), 404
    try: 
        ds.create_user(email=email, password=hash_password(password), roles=[role])
        if role=='influencer':
            user = User.query.filter_by(email=email).first()
            inf=InfluencerDetails(user_id=user.user_id,name=name,category=category,niche=niche,reach=reach)
            db.session.add(inf)
        db.session.commit()
        return jsonify({'message':'user created'}),200
    except:
        db.session.rollback()
        return jsonify({'message':'error creating user'}), 400


@app.route('/registersp', methods=['post'])
def registersp():
    data=request.get_json()
    email=data.get('email')
    password=data.get('password')
    role=data.get('role')
    name=data.get('name')
    category=data.get('category')
    print(password)
    if not email or not password or role not in ['admin','influencer','sponsor']:
        return jsonify({"message":"invalid inputs"}), 404
    
    user=ds.find_user(email=email)
    
    if user:
        return jsonify({'message':'user already exists'}), 404
    try: 
        ds.create_user(email=email, password=hash_password(password), roles=[role], active=False)
        if role=='sponsor':
            user = User.query.filter_by(email=email).first()
            inf=SponsorDetails(user_id=user.user_id,company_name=name,industry=category)
            db.session.add(inf)
        db.session.commit()
        return jsonify({'message':'user created'}),200
    except:
        db.session.rollback()
        return jsonify({'message':'error creating user'}), 400

@app.get('/sponsors')
@auth_required('token') 
@cache.cached(timeout=5) 
def sponsors():
    try:
        sponsors_data = db.session.query(SponsorDetails, User.email).join(User, SponsorDetails.user_id == User.user_id).all()
        result = [
            {
                "sponsor_id": sponsor.sponsor_id,
                "company_name": sponsor.company_name,
                "industry": sponsor.industry,
                "status": sponsor.status,
                "user": {
                    "user_id": sponsor.user_id,
                    "email": email  
                }
            }
            for sponsor,email in sponsors_data
        ]
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/updatespstatus/<int:uid>', methods=['POST'])
@auth_required('token')
def updatespstatus(uid):
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"error": "Missing 'status' in request body"}), 400

    status = data.get('status')

    try:
        sponsor = db.session.query(SponsorDetails).filter_by(user_id=uid).first()

        if not sponsor:
            return jsonify({"error": "Sponsor not found"}), 404
        sponsor.status = status
        if status == 'Approved':
            user = db.session.query(User).filter_by(user_id=uid).first()
            if user:
                user.active = True
        db.session.commit()

        return jsonify({"message": "Sponsor status updated successfully", "status": sponsor.status}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/campaigns", methods=["GET"])
@auth_required('token')
@cache.cached(timeout=5) 
def get_campaigns():
    name = request.args.get("name", "")
    niche = request.args.get("niche", "")
    min_budget = request.args.get("minBudget", type=float)

    sponsor = db.session.query(SponsorDetails).filter(SponsorDetails.user_id == current_user.user_id).first()
    if not sponsor:
        return jsonify({"error": "No sponsor found for the current user"}), 404

    campaigns_query = db.session.query(CampaignDetails).filter(CampaignDetails.sponsor_id == sponsor.sponsor_id)
    if name:
        campaigns_query = campaigns_query.filter(CampaignDetails.name.ilike(f"%{name}%"))
    if niche:
        campaigns_query = campaigns_query.filter(CampaignDetails.niche.ilike(f"%{niche}%"))
    if min_budget is not None:
        campaigns_query = campaigns_query.filter(CampaignDetails.budget >= min_budget)

    campaigns = campaigns_query.all()
    flagged_campaign_ids = {flag.campaign_id for flag in db.session.query(FlaggedUserDetails.campaign_id).distinct()}

    campaign_data = []
    for campaign in campaigns:
        is_flagged = campaign.campaign_id in flagged_campaign_ids
        campaign_data.append({
            "id": campaign.campaign_id,
            "name": campaign.name,
            "niche": campaign.niche,
            "budget": campaign.budget,
            "start_date":campaign.start_date.strftime('%d-%m-%y'),
            "end_date": campaign.end_date.strftime('%d-%m-%y'),
            "is_flagged": f'{is_flagged}',
        })
    return jsonify(campaign_data), 200


@app.route('/createcampaigns', methods=['POST'])
@auth_required('token')
def create_campaign():
    data = request.get_json()

    sponsor = db.session.query(SponsorDetails).filter(SponsorDetails.user_id == current_user.user_id).first()
    if not sponsor:
        return jsonify({'error': 'Sponsor not found for the current user'}), 404

    required_fields = {'name', 'description', 'niche', 'budget', 'start_date', 'end_date', 'visibility', 'goals'}
    if not required_fields.issubset(data.keys()):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    try:

        new_campaign = CampaignDetails(
            name=data['name'],
            sponsor_id=sponsor.sponsor_id,
            description=data['description'],
            niche=data['niche'],
            budget=data['budget'],
            start_date=start_date,
            end_date=end_date,
            visibility=data['visibility'],
            goals=data['goals']
        )
        db.session.add(new_campaign)
        db.session.commit()
        flagged_campaign_ids = {flag.campaign_id for flag in db.session.query(FlaggedUserDetails.campaign_id).distinct()}
        isflagged=False
        if(new_campaign.campaign_id in flagged_campaign_ids):
            isflagged=True
        return jsonify({
            'id': new_campaign.campaign_id,
            'name': new_campaign.name,
            'description': new_campaign.description,
            'niche': new_campaign.niche,
            'budget': new_campaign.budget,
            'start_date': new_campaign.start_date.strftime('%d-%m-%y'),
            'end_date': new_campaign.end_date.strftime('%d-%m-%y'),
            'visibility': new_campaign.visibility,
            'goals': new_campaign.goals,
            'is_flagged':f'{isflagged}'
        }), 200

    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({'error': 'Failed to create campaign', 'message': str(e)}), 500

@app.route('/scampaigns/<int:sno>', methods=['GET'])
@auth_required('token')
@cache.memoize(timeout=5)
def show_campaign(sno):
    try:
        campaign = CampaignDetails.query.filter_by(campaign_id=sno).first()
        if not campaign:
            return jsonify({"error": "Campaign not found"}), 404
        campaign_details = {
            "id": campaign.campaign_id,
            "name": campaign.name,
            "description": campaign.description,
            "niche": campaign.niche,
            "budget": campaign.budget,
            "start_date": campaign.start_date.strftime('%Y-%m-%d'),
            "end_date": campaign.end_date.strftime('%Y-%m-%d'),
            "visibility": campaign.visibility,
            "goals": campaign.goals
        }

        return jsonify(campaign_details), 200

    except Exception as e:
        return jsonify({"error": "An error occurred while fetching the campaign", "details": str(e)}), 500


@app.route('/updatecampaigns/<int:campaign_id>', methods=['PUT'])
@auth_required('token')
def update_campaign(campaign_id):
    data = request.get_json()

    sponsor = db.session.query(SponsorDetails).filter(SponsorDetails.user_id == current_user.user_id).first()
    if not sponsor:
        return jsonify({'error': 'Sponsor not found for the current user'}), 404

    campaign = db.session.query(CampaignDetails).filter(
        CampaignDetails.campaign_id == campaign_id,
        CampaignDetails.sponsor_id == sponsor.sponsor_id
    ).first()
    
    if not campaign:
        return jsonify({'error': 'Campaign not found or does not belong to the current sponsor'}), 404

    allowed_fields = {'name', 'description', 'niche', 'budget', 'start_date', 'end_date', 'visibility', 'goals'}
    update_fields = {key: data[key] for key in data if key in allowed_fields}

    if 'start_date' in update_fields or 'end_date' in update_fields:
        try:
            if 'start_date' in update_fields:
                update_fields['start_date'] = datetime.strptime(update_fields['start_date'], '%Y-%m-%d').date()
            if 'end_date' in update_fields:
                update_fields['end_date'] = datetime.strptime(update_fields['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    try:
        for key, value in update_fields.items():
            setattr(campaign, key, value)
        
        db.session.commit()

        flagged_campaign_ids = {flag.campaign_id for flag in db.session.query(FlaggedUserDetails.campaign_id).distinct()}
        is_flagged = campaign.campaign_id in flagged_campaign_ids

        return jsonify({
            'id': campaign.campaign_id,
            'name': campaign.name,
            'description': campaign.description,
            'niche': campaign.niche,
            'budget': campaign.budget,
            'start_date': campaign.start_date.strftime('%d-%m-%y') if campaign.start_date else None,
            'end_date': campaign.end_date.strftime('%d-%m-%y') if campaign.end_date else None,
            'visibility': campaign.visibility,
            'goals': campaign.goals,
            'is_flagged': f'{is_flagged}'
        }), 200

    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({'error': 'Failed to update campaign', 'message': str(e)}), 500

@app.route('/deletecampaigns/<int:campaign_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('sponsor')
def delete_campaign(campaign_id):
    sponsor = db.session.query(SponsorDetails).filter(SponsorDetails.user_id == current_user.user_id).first()
    if not sponsor:
        return jsonify({'error': 'Sponsor not found for the current user'}), 404

    campaign = db.session.query(CampaignDetails).filter(
        CampaignDetails.campaign_id == campaign_id,
        CampaignDetails.sponsor_id == sponsor.sponsor_id
    ).first()

    if not campaign:
        return jsonify({'error': 'Campaign not found or does not belong to the current sponsor'}), 404

    try:
        ad_requests = db.session.query(AdRequestDetails).filter(
            AdRequestDetails.campaign_id == campaign_id
        ).all()
        
        for ad_request in ad_requests:
            db.session.delete(ad_request)

        db.session.delete(campaign)
        db.session.commit()

        return jsonify({
            'message': f'Campaign with ID {campaign_id} and all associated ad requests deleted successfully.',
            'id': campaign.campaign_id
        }), 200

    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({'error': 'Failed to delete campaign and associated ad requests', 'message': str(e)}), 500


@app.route("/influencers", methods=["GET"])
@auth_required('token')
@cache.cached(timeout=5) 
def get_influencers():
    name = request.args.get("name", "")
    category = request.args.get("category", "")
    min_reach = request.args.get("minReach", type=int)
    influencers_query = db.session.query(InfluencerDetails)
    if name:
        influencers_query = influencers_query.filter(InfluencerDetails.name.ilike(f"%{name}%"))
    if category:
        influencers_query = influencers_query.filter(InfluencerDetails.category.ilike(f"%{category}%"))
    if min_reach is not None:
        influencers_query = influencers_query.filter(InfluencerDetails.reach >= min_reach)
    influencers = influencers_query.all()
    flagged_user_ids = {
        flag.user_id for flag in db.session.query(FlaggedUserDetails.user_id).distinct()
    }
    influencer_data = []
    for influencer in influencers:
        is_flagged = influencer.user_id in flagged_user_ids
        influencer_data.append({
            "influencer_id": influencer.influencer_id,
            "name": influencer.name,
            "category": influencer.category,
            "reach": influencer.reach,
            "niche": influencer.niche,
            "is_flagged": f'{is_flagged}',
        })

    return jsonify(influencer_data), 200


@app.route('/createad', methods=['POST'])
@auth_required('token')
def create_ad():
    try:
        data = request.get_json()
        print(data)
        required_fields = ['campaign_id', 'influencer_id', 'messages', 'requirements', 'payment_amount', 'status']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Field '{field}' is required"}), 400
        campaign = CampaignDetails.query.get(data['campaign_id'])
        if not campaign:
            return jsonify({"error": f"Campaign with ID {data['campaign_id']} does not exist"}), 404
        influencer = InfluencerDetails.query.get(data['influencer_id'])
        if not influencer:
            return jsonify({"error": f"Influencer with ID {data['influencer_id']} does not exist"}), 404
        new_ad_request = AdRequestDetails(
            campaign_id=data['campaign_id'],
            influencer_id=data['influencer_id'],
            messages=data['messages'],
            requirements=data['requirements'],
            payment_amount=data['payment_amount'],
            status=data['status']
        )
        db.session.add(new_ad_request)
        db.session.commit()

        return jsonify({"message": "Ad request created successfully", "ad_request_id": new_ad_request.ad_request_id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/adrequests', methods=['GET'])
@auth_required('token')
@cache.cached(timeout=5) 
def get_ad_requests():
    try:
        role = current_user.roles[0].name if current_user.roles else None
        user_id = current_user.user_id

        if role == 'sponsor':
            sponsor = SponsorDetails.query.filter_by(user_id=user_id).first()
            if not sponsor:
                return jsonify({"error": "No sponsor details found for the current user"}), 404
            
            sponsor_id = sponsor.sponsor_id
            campaigns = CampaignDetails.query.filter_by(sponsor_id=sponsor_id).all()
            campaign_ids = [campaign.campaign_id for campaign in campaigns]

            if not campaign_ids:
                return jsonify({"error": "No campaigns found for the current sponsor"}), 404

            ad_requests = AdRequestDetails.query.filter(AdRequestDetails.campaign_id.in_(campaign_ids)).all()

        elif role == 'influencer':
            influencer = InfluencerDetails.query.filter_by(user_id=user_id).first()
            if not influencer:
                return jsonify({"error": "No influencer details found for the current user"}), 404
            
            influencer_id = influencer.influencer_id
            ad_requests = AdRequestDetails.query.filter_by(influencer_id=influencer_id).all()

        else:
            return jsonify({"error": "Unauthorized role"}), 403

        response = []
        for ad_request in ad_requests:
            influencer = InfluencerDetails.query.get(ad_request.influencer_id)
            influencer_name = influencer.name if influencer else "Unknown Influencer"

            campaign = CampaignDetails.query.get(ad_request.campaign_id)
            campaign_name = campaign.name if campaign else "Unknown Campaign"

            response.append({
                "id": ad_request.ad_request_id,
                "campaign_name": campaign_name,
                "influencer_name": influencer_name,
                "status": ad_request.status,
                "payment_amount": ad_request.payment_amount,
            })

        return jsonify(response), 200

    except Exception as e:
        print(f"Error fetching ad requests: {e}")
        return jsonify({"error": "An error occurred while fetching ad requests"}), 500

@app.route('/getad/<int:ad_id>', methods=['GET'])
@auth_required('token')
@cache.memoize(timeout=5)
def get_ad(ad_id):
    try:
        role = current_user.roles[0].name if current_user.roles else None
        user_id = current_user.user_id
        ad_request = AdRequestDetails.query.get(ad_id)
        if not ad_request:
                return jsonify({"error": "Ad Request not found"}), 404
        if role == 'sponsor':
            sponsor = SponsorDetails.query.filter_by(user_id=user_id).first()
            if not sponsor:
                return jsonify({"error": "No sponsor details found for the current user"}), 404

            sponsor_id = sponsor.sponsor_id
            campaigns = CampaignDetails.query.filter_by(sponsor_id=sponsor_id).all()
            campaign_ids = [campaign.campaign_id for campaign in campaigns]

            if not campaign_ids:
                return jsonify({"error": "No campaigns found for the current sponsor"}), 404


            if ad_request.campaign_id not in campaign_ids:
                return jsonify({"error": "Unauthorized access to this ad request"}), 403

        elif role == 'influencer':
            influencer = InfluencerDetails.query.filter_by(user_id=user_id).first()
            if not influencer:
                return jsonify({"error": "No influencer details found for the current user"}), 404

            if ad_request.influencer_id != influencer.influencer_id:
                return jsonify({"error": "Unauthorized access to this ad request"}), 403

        else:
            return jsonify({"error": "Unauthorized role"}), 403

        campaign = CampaignDetails.query.get(ad_request.campaign_id)
        campaign_name = campaign.name 
        influencer = InfluencerDetails.query.get(ad_request.influencer_id)
        influencer_name = influencer.name 
        response = {
            "id": ad_request.ad_request_id,
            "campaign_name": campaign_name,
            "influencer_name": influencer_name,
            "status": ad_request.status,
            "payment_amount": ad_request.payment_amount,
            "messages": ad_request.messages,
            "requirements": ad_request.requirements,
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"Error fetching ad request details: {e}")
        return jsonify({"error": "An error occurred while fetching ad request details"}), 500

@app.route('/updatead/<int:ad_id>', methods=['PUT'])
@auth_required('token')
def update_ad(ad_id):
    try:
        role = current_user.roles[0].name if current_user.roles else None
        user_id = current_user.user_id

        ad_request = AdRequestDetails.query.get(ad_id)
        if not ad_request:
            return jsonify({"error": "Ad Request not found"}), 404

        if role == 'sponsor':
            sponsor = SponsorDetails.query.filter_by(user_id=user_id).first()
            if not sponsor:
                return jsonify({"error": "No sponsor details found for the current user"}), 404

            sponsor_id = sponsor.sponsor_id
            campaigns = CampaignDetails.query.filter_by(sponsor_id=sponsor_id).all()
            campaign_ids = [campaign.campaign_id for campaign in campaigns]

            if not campaign_ids or ad_request.campaign_id not in campaign_ids:
                return jsonify({"error": "Unauthorized access to this ad request"}), 403

        elif role == 'influencer':
            influencer = InfluencerDetails.query.filter_by(user_id=user_id).first()
            if not influencer:
                return jsonify({"error": "No influencer details found for the current user"}), 404

            if ad_request.influencer_id != influencer.influencer_id:
                return jsonify({"error": "Unauthorized access to this ad request"}), 403

        else:
            return jsonify({"error": "Unauthorized role"}), 403

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        if role == 'sponsor':
            ad_request.messages = data.get("messages", ad_request.messages)
            ad_request.requirements = data.get("requirements", ad_request.requirements)
            ad_request.payment_amount = data.get("payment_amount", ad_request.payment_amount)
            ad_request.status = 'Sent to Influencer'

        elif role == 'influencer':
            ad_request.messages = data.get("messages", ad_request.messages)
            ad_request.requirements = data.get("requirements", ad_request.requirements)
            ad_request.payment_amount = data.get("payment_amount", ad_request.payment_amount)
            ad_request.status = 'Sent to Sponsor'

        db.session.commit()

        response = {
            "id": ad_request.ad_request_id,
            "campaign_name": CampaignDetails.query.get(ad_request.campaign_id).name,
            "influencer_name": InfluencerDetails.query.get(ad_request.influencer_id).name,
            "status": ad_request.status,
            "payment_amount": ad_request.payment_amount,
            "messages": ad_request.messages,
            "requirements": ad_request.requirements,
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"Error updating ad request: {e}")
        return jsonify({"error": "An error occurred while updating ad request"}), 500


@app.route('/deletead/<int:ad_id>', methods=['DELETE'])
@auth_required('token')
def delete_ad(ad_id):
    try:
        role = current_user.roles[0].name if current_user.roles else None
        user_id = current_user.user_id

        ad_request = AdRequestDetails.query.get(ad_id)
        if not ad_request:
            return jsonify({"error": "Ad Request not found"}), 404

        if role == 'sponsor':
            sponsor = SponsorDetails.query.filter_by(user_id=user_id).first()
            if not sponsor:
                return jsonify({"error": "No sponsor details found for the current user"}), 404

            sponsor_id = sponsor.sponsor_id
            campaigns = CampaignDetails.query.filter_by(sponsor_id=sponsor_id).all()
            campaign_ids = [campaign.campaign_id for campaign in campaigns]

            if not campaign_ids or ad_request.campaign_id not in campaign_ids:
                return jsonify({"error": "Unauthorized access to this ad request"}), 403

        elif role == 'influencer':
            influencer = InfluencerDetails.query.filter_by(user_id=user_id).first()
            if not influencer:
                return jsonify({"error": "No influencer details found for the current user"}), 404

            if ad_request.influencer_id != influencer.influencer_id:
                return jsonify({"error": "Unauthorized access to this ad request"}), 403

        else:
            return jsonify({"error": "Unauthorized role"}), 403

        db.session.delete(ad_request)
        db.session.commit()

        return jsonify({"message": "Ad request deleted successfully"}), 200

    except Exception as e:
        print(f"Error deleting ad request: {e}")
        return jsonify({"error": "An error occurred while deleting the ad request"}), 500


@app.route('/acceptad/<int:ad_id>', methods=['POST'])
@auth_required('token')
def accept_ad(ad_id):
    try:
        user_id = current_user.user_id
        role = current_user.roles[0]

        ad_request = AdRequestDetails.query.get(ad_id)
        if not ad_request:
            return jsonify({"error": "Ad Request not found"}), 404

        if role == 'sponsor':
            sponsor = SponsorDetails.query.filter_by(user_id=user_id).first()
            if not sponsor:
                return jsonify({"error": "No sponsor details found for the current user"}), 404

            sponsor_id = sponsor.sponsor_id
            campaigns = CampaignDetails.query.filter_by(sponsor_id=sponsor_id).all()
            campaign_ids = [campaign.campaign_id for campaign in campaigns]

            if ad_request.campaign_id not in campaign_ids:
                return jsonify({"error": "Unauthorized access to this ad request"}), 403

        elif role == 'influencer':
            influencer = InfluencerDetails.query.filter_by(user_id=user_id).first()
            if not influencer:
                return jsonify({"error": "No influencer details found for the current user"}), 404

            if ad_request.influencer_id != influencer.influencer_id:
                return jsonify({"error": "Unauthorized access to this ad request"}), 403

        else:
            return jsonify({"error": "Invalid role"}), 403

        if (role == 'sponsor' and ad_request.status != 'Sent to Sponsor') or \
           (role == 'influencer' and ad_request.status != 'Sent to Influencer'):
            return jsonify({"error": "Ad Request cannot be accepted in its current state"}), 400

        ad_request.status = 'Accepted'
        db.session.commit()

        campaign = CampaignDetails.query.get(ad_request.campaign_id)
        campaign_name = campaign.name if campaign else "Unknown Campaign"

        influencer = InfluencerDetails.query.get(ad_request.influencer_id)
        influencer_name = influencer.name if influencer else "Unknown Influencer"

        response = {
            "id": ad_request.ad_request_id,
            "campaign_name": campaign_name,
            "influencer_name": influencer_name,
            "status": ad_request.status,
            "payment_amount": ad_request.payment_amount,
            "messages": ad_request.messages,
            "requirements": ad_request.requirements,
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"Error accepting ad request: {e}")
        return jsonify({"error": "An error occurred while accepting ad request"}), 500

@app.route('/getinfluencer', methods=['GET'])
@auth_required('token')
@roles_required('influencer')
@cache.cached(timeout=5)
def get_influencer():
    try:
        user_id = current_user.user_id
        influencer = InfluencerDetails.query.filter_by(user_id=user_id).first()
        
        if not influencer:
            return jsonify({"error": "Influencer profile not found"}), 404

        response = {
            "influencer_id": influencer.influencer_id,
            "name": influencer.name,
            "category": influencer.category,
            "niche": influencer.niche,
            "reach": influencer.reach
        }

        return jsonify(response), 200
    except Exception as e:
        print(f"Error fetching influencer details: {e}")
        return jsonify({"error": "An error occurred while fetching influencer details"}), 500

@app.route('/updateinfluencer', methods=['PUT'])
@auth_required('token')
@roles_required('influencer')
def update_influencer():
    try:
        user_id = current_user.user_id
        influencer = InfluencerDetails.query.filter_by(user_id=user_id).first()

        if not influencer:
            return jsonify({"error": "Influencer profile not found"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        influencer.name = data.get("name", influencer.name)
        influencer.category = data.get("category", influencer.category)
        influencer.niche = data.get("niche", influencer.niche)
        influencer.reach = data.get("reach", influencer.reach)

        db.session.commit()

        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        print(f"Error updating influencer details: {e}")
        return jsonify({"error": "An error occurred while updating influencer details"}), 500

@app.route('/deleteinfluencer', methods=['DELETE'])
@auth_required('token')
@roles_required('influencer')
def delete_influencer():
    try:
        user_id = current_user.user_id
        
        influencer = InfluencerDetails.query.filter_by(user_id=user_id).first()
        user = User.query.filter_by(user_id=user_id).first()

        if not influencer:
            return jsonify({"error": "Influencer profile not found"}), 404
        if not user:
            return jsonify({"error": "User not found"}), 404

        AdRequestDetails.query.filter_by(influencer_id=influencer.influencer_id).delete()

        db.session.delete(influencer)

        db.session.delete(user)

        db.session.commit()

        return jsonify({"message": "Profile and user account deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting influencer profile and user: {e}")
        return jsonify({"error": "An error occurred while deleting influencer profile and user"}), 500


@app.route("/campaignsinf", methods=["GET"])
@auth_required('token')
@cache.cached(timeout=5) 
def get_public_campaigns():
    name = request.args.get("name", "")
    niche = request.args.get("niche", "")
    min_budget = request.args.get("minBudget", type=float)
    campaigns_query = db.session.query(CampaignDetails).filter(CampaignDetails.visibility == "Public")
    if name:
        campaigns_query = campaigns_query.filter(CampaignDetails.name.ilike(f"%{name}%"))
    if niche:
        campaigns_query = campaigns_query.filter(CampaignDetails.niche.ilike(f"%{niche}%"))
    if min_budget is not None:
        campaigns_query = campaigns_query.filter(CampaignDetails.budget >= min_budget)
    flagged_campaign_ids = {flag.campaign_id for flag in db.session.query(FlaggedUserDetails.campaign_id).distinct()}
    campaigns_query = campaigns_query.filter(~CampaignDetails.campaign_id.in_(flagged_campaign_ids))

    campaigns = campaigns_query.all()
    campaign_data = []
    for campaign in campaigns:
        campaign_data.append({
            "id": campaign.campaign_id,
            "name": campaign.name,
            "niche": campaign.niche,
            "budget": campaign.budget,
            "start_date": campaign.start_date.strftime('%d-%m-%y') if campaign.start_date else None,
            "end_date": campaign.end_date.strftime('%d-%m-%y') if campaign.end_date else None,
            "visibility": campaign.visibility,
            "goals": campaign.goals,
            "description": campaign.description
        })

    return jsonify(campaign_data), 200


@app.route('/influencerflag/<int:influencer_id>', methods=['POST'])
@auth_required()  
@roles_required('admin') 
def flag_influencer(influencer_id):
    try:
        influencer = InfluencerDetails.query.filter_by(influencer_id=influencer_id).first()
        if not influencer:
            return jsonify({"error": "Influencer not found"}), 404
        user = User.query.filter_by(user_id=influencer.user_id).first()
        if not user:
            return jsonify({"error": "User associated with influencer not found"}), 404

        AdRequestDetails.query.filter_by(influencer_id=influencer_id).delete()
        user.active = False  

        flagged_user = FlaggedUserDetails(
            user_id=influencer.user_id,
            reason="Flagged by admin",
        )
        db.session.add(flagged_user)

        db.session.commit()

        return jsonify({"message": "Influencer flagged, ad requests deleted, and user deactivated successfully"}), 200

    except Exception as e:
        db.session.rollback() 
        return jsonify({"error": str(e)}), 500

@app.route('/campaignflag/<int:campaign_id>', methods=['POST'])
@auth_required()  
@roles_required('admin') 
def flag_campaign(campaign_id):
    try:
        campaign = CampaignDetails.query.filter_by(campaign_id=campaign_id).first()
        if not campaign:
            return jsonify({"error": "Campaign not found"}), 404
        
        sponsor = SponsorDetails.query.filter_by(sponsor_id=campaign.sponsor_id).first()
        if not sponsor:
            return jsonify({"error": "Sponsor associated with campaign not found"}), 404

        AdRequestDetails.query.filter_by(campaign_id=campaign_id).delete()
        
        flagged_user = FlaggedUserDetails(
            campaign_id=campaign_id,
            reason="Campaign flagged by admin",
        )
        db.session.add(flagged_user)
        
        db.session.commit()

        return jsonify({"message": "Campaign flagged, ad requests deleted, and sponsor deactivated successfully"}), 200

    except Exception as e:
        db.session.rollback() 
        return jsonify({"error": str(e)}), 500

from datetime import datetime
@app.get('/cache')
@cache.cached(timeout=5)
def cache():
    return {'time':str(datetime.now())}


from backend.celery.tasks import create_file
@app.get('/createfile')
@auth_required('token')
@roles_required('sponsor')
def createfile():
    user_id=current_user.user_id
    sp=SponsorDetails.query.filter_by(user_id=user_id).first()
    task=create_file.delay(sp.sponsor_id)
    return{'task_id':task.id},200

@app.get('/getfile/<id>')
def getfile(id):
    res=AsyncResult(id)
    if res.ready():
        return send_file(f'./backend/celery/user_download/{res.result}.csv')
    else:
        return {'message': 'task not ready'},405

@app.route('/adminstats', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_stats():
    influencers_count = InfluencerDetails.query.count()
    campaigns_count = CampaignDetails.query.count()
    flagged_users_count = FlaggedUserDetails.query.count()

    active_users_count = User.query.count()
    public_campaigns_count = CampaignDetails.query.filter(CampaignDetails.visibility == 'Public').count()
    private_campaigns_count = CampaignDetails.query.filter(CampaignDetails.visibility == 'Private').count()

    ad_requests_sent_to_sponsors_count = AdRequestDetails.query.filter(AdRequestDetails.status == 'Sent to Sponsor').count()
    ad_requests_sent_to_influencers_count = AdRequestDetails.query.filter(AdRequestDetails.status == 'Sent to Influencer').count()
    ad_requests_accepted_count = AdRequestDetails.query.filter(AdRequestDetails.status == 'Accepted').count()

    flagged_influencers_count = FlaggedUserDetails.query.join(InfluencerDetails, FlaggedUserDetails.user_id == InfluencerDetails.user_id).count()
    flagged_sponsors_count = FlaggedUserDetails.query.join(CampaignDetails, FlaggedUserDetails.campaign_id == CampaignDetails.campaign_id).count()

    return jsonify({
        "influencers_count": influencers_count,
        "campaigns_count": campaigns_count,
        "flagged_users_count": flagged_users_count,
        "active_users_count": active_users_count,
        "public_campaigns_count": public_campaigns_count,
        "private_campaigns_count": private_campaigns_count,
        "ad_requests_sent_to_sponsors_count": ad_requests_sent_to_sponsors_count,
        "ad_requests_sent_to_influencers_count": ad_requests_sent_to_influencers_count,
        "ad_requests_accepted_count": ad_requests_accepted_count,
        "flagged_influencers_count": flagged_influencers_count,
        "flagged_sponsors_count": flagged_sponsors_count
    })

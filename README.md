# Influencer-Engagement-and-Sponsorship-Coordination-Platform
## Overview
This web application facilitates seamless collaboration between sponsors and influencers. Sponsors can create campaigns, find suitable influencers, and track campaign progress, while influencers can manage their profiles, participate in sponsorships, and showcase their performance. An admin oversees the platform, ensuring smooth operations and handling disputes.
## Features
The platform has three user roles- Influencers, sponsors and admin.
### Sponsors
- Campaign Management: Create, edit, and track sponsorship campaigns.
- Search and Filter Influencers: Discover influencers based on demographics, niche, and engagement metrics.
- Proposal Management: Send and receive proposals for collaborations.
- Campaign Analytics: Monthly reports of campaign analytics are sent to all of the sponsors.
- Download reports: Asynchronous job to compile and download all campaign analytics in the form of a csv.
### Influencers
- Profile Management: Update bio, social media links, audience demographics, and engagement stats.
- View Campaigns: Browse, search and apply to campaigns matching their niche and audience.
- Earnings Dashboard: Track earnings and payout history.
- Collaboration Tracking: Manage active collaborations and deadlines.
- Daily reminders: Emails were sent to users who have not logged in recently or have unseen messages. 
### Admin
- User Management: Approve new accounts, manage existing user profiles, and handle complaints.
- Analytics and Reports: Access platform-wide metrics, including user activity, campaign success rates, and revenue.
- Content Moderation: Review and approve influencer profiles and sponsor campaigns to ensure compliance with platform guidelines.

## Technologies used:
- Frontend, navigation and state management: Vue.js, Veu Router, Veux store
- Backend: Flask (RESTful APIs)
- Database: SQLite
- Authentication: JWT based authentication was implemented using Flask-security.
- Asynchronous Jobs and daily reminders/ monthly reports: Implemented using celery worker and celery beat.
- Caching: Redis to improve performance

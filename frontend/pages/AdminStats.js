export default {
    template: `
    <div class="p-4">
        <h2 style="margin-left: 5vh;">Admin Stats</h2>
        <canvas id="adminChart" style="height: 25%;width: 25%"></canvas>
        <div style="margin-top: 5vh;">
            <h3 style="margin-top: 5vh; margin-left: 5vh;">Additional Information</h3>
            <ul style="margin-left: 5vh;">
                <li><strong>Active Users:</strong> {{ stats.active_users_count }}</li>
                <li><strong>Campaigns:</strong>
                    <ul>
                        <li>Public: {{ stats.public_campaigns_count }}</li>
                        <li>Private: {{ stats.private_campaigns_count }}</li>
                    </ul>
                </li>
                <li><strong>Ad Requests:</strong>
                    <ul>
                        <li>Sent to Sponsors: {{ stats.ad_requests_sent_to_sponsors_count }}</li>
                        <li>Sent to Influencers: {{ stats.ad_requests_sent_to_influencers_count }}</li>
                        <li>Accepted: {{ stats.ad_requests_accepted_count }}</li>
                    </ul>
                </li>
                <li><strong>Flagged Users:</strong>
                    <ul>
                        <li>Influencers: {{ stats.flagged_influencers_count }}</li>
                        <li>Campaigns: {{ stats.flagged_sponsors_count }}</li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
    `,
    data() {
        return {
            stats: {
                active_users_count: 0,
                public_campaigns_count: 0,
                private_campaigns_count: 0,
                ad_requests_sent_to_sponsors_count: 0,
                ad_requests_sent_to_influencers_count: 0,
                ad_requests_accepted_count: 0,
                flagged_influencers_count: 0,
                flagged_sponsors_count: 0,
                influencers_count: 0,
                campaigns_count: 0,
                flagged_users_count: 0
            }
        };
    },
    methods: {
        async fetchAdminStats() {
            try {
                const res = await fetch('/adminstats', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Auth-Token': this.$store.state.auth_token,
                    },
                  });
                if (res.ok) {
                    const data = await res.json();
                    this.stats = { ...data };
                    this.renderChart();
                } else {
                    alert('Failed to fetch admin stats.');
                }
            } catch (error) {
                console.error('Error fetching admin stats:', error);
                alert('Network error while fetching admin stats.');
            }
        },
        renderChart() {
            const ctx = document.getElementById('adminChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Influencers', 'Campaigns', 'Flagged Users'],
                    datasets: [{
                        label: '# of Records',
                        data: [
                            this.stats.influencers_count,
                            this.stats.campaigns_count,
                            this.stats.flagged_users_count
                        ],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },
    async mounted() {
        await this.fetchAdminStats();
    }
};

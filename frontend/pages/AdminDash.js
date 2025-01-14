import SpcardAdmin from "../components/SpcardAdmin.js";

export default {
    template: `
    <div class="p-4">
        <h1>Sponsors List 🏢</h1>
        <div v-if="sponsors.length > 0" class="row">
            <div 
                v-for="sponsor in sponsors" 
                :key="sponsor.sponsor_id" 
                class="col-lg-3 col-md-4 col-sm-12 mb-4"
            >
                <SpcardAdmin
                    :sponsor_id="sponsor.sponsor_id" 
                    :company_name="sponsor.company_name" 
                    :industry="sponsor.industry" 
                    :status="sponsor.status" 
                    :user="sponsor.user" 
                    @update-status="updateSponsorStatus"
                />
            </div>
        </div>
        <div v-else class="text-muted">No sponsors found</div>
    </div>
    `,
    data() {
        return {
            sponsors: [] 
        };
    },
    methods: {
        async fetchSponsors() {
            try {
                const res = await fetch(location.origin + `/sponsors`, {
                    headers: {
                        'Auth-Token': this.$store.state.auth_token
                    }
                });

                if (res.ok) {
                    const r = await res.json();
                    this.sponsors = r.data;
                } else {
                    console.error('Error fetching sponsors:', res.statusText);
                }
            } catch (error) {
                console.error('Network error fetching sponsors:', error);
            }
        },
        async updateSponsorStatus({ userId, newStatus }) {
            const sponsor = this.sponsors.find(s => s.user.user_id === userId);

            if (!sponsor) {
                alert(`Sponsor with user ID ${userId} not found!`);
                return;
            }

            try {
                const res = await fetch(location.origin + `/updatespstatus/${userId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Auth-Token": this.$store.state.auth_token
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (res.ok) {
                    sponsor.status = newStatus; 
                    alert(`Sponsor status updated successfully to: ${newStatus}`);
                } else {
                    alert("Failed to update sponsor status. Please try again.");
                }
            } catch (error) {
                alert("An error occurred while updating the sponsor status. Please check your connection and try again.");
            }
        }
    },
    async mounted() {
        await this.fetchSponsors(); 
    },
    components: {
        SpcardAdmin
    }
};

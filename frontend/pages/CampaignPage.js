import CampaignInf from '../components/CampaignInf.js';
import AdRequestModal from '../components/AdRequestModal.js';

export default {
  components: {
    CampaignInf,
    AdRequestModal
  },
  template: `
    <div class="p-4">
      <h1>Campaigns</h1>
      <div class="d-flex mb-3">
        <input 
          v-model="searchQuery.name" 
          placeholder="Search by Campaign Name" 
          class="form-control mr-2" 
          @input="search"
          style="flex: 1;"
        />
        <input 
          v-model="searchQuery.niche" 
          placeholder="Search by Niche" 
          class="form-control mr-2" 
          @input="search"
          style="flex: 1;"
        />
        <input 
          v-model="searchQuery.minBudget" 
          type="number" 
          placeholder="Min Budget" 
          class="form-control" 
          @input="search"
          style="flex: 1;"
        />
      </div>

      <div v-if="campaigns.length > 0" class="row">
        <div 
          v-for="campaign in campaigns" 
          :key="campaign.id" 
          class="col-lg-3 col-md-4 col-sm-12 mb-4"
        >
          <CampaignInf 
            :id="campaign.id"
            :name="campaign.name" 
            :niche="campaign.niche" 
            :budget="campaign.budget"
            :start_date="campaign.start_date"
            :end_date="campaign.end_date"
            :visibility="campaign.visibility"
            :goals="campaign.goals"
            :description="campaign.description"
            :isFlagged="campaign.is_flagged"
            @send-request="openAdRequestModal"
            @update-flag-status="updateFlagStatus"
          />
        </div>
      </div>

      <div v-else class="text-muted">No campaigns available</div>

      <AdRequestModal 
        v-if="showModal" 
        :influencer="influencer" 
        :campaigns="[selectedCampaign]"
        :sendToSponsor="true"
        @close="closeModal" 
        @submit="submitAdRequest"
      />
    </div>
  `,
  data() {
    return {
      campaigns: [], 
      influencer: null,
      showModal: false,
      selectedCampaign: null,
      searchQuery: {
        name: '',
        niche: '',
        minBudget: null
      }
    };
  },
  computed: {
    isAdmin() {
      return this.$store.state.role === 'admin'; 
    }
  },
  methods: {
    updateFlagStatus(campaignId, isFlagged) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (campaign) campaign.isFlagged = isFlagged;
      },
    async fetchInfluencer() {
      if (this.isAdmin) return; 

      try {
        const res = await fetch('/getinfluencer', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token
          }
        });

        if (res.ok) {
          this.influencer = await res.json();
          console.log(this.influencer)
        } else {
          alert('Error fetching influencer details');
        }
      } catch (error) {
        alert('Error fetching influencer details:', error);
      }
    },
    async search() {
      const queryParams = new URLSearchParams();

      if (this.searchQuery.name) queryParams.append('name', this.searchQuery.name);
      if (this.searchQuery.niche) queryParams.append('niche', this.searchQuery.niche);
      if (this.searchQuery.minBudget) queryParams.append('minBudget', this.searchQuery.minBudget);

      const queryString = queryParams.toString();

      try {
        const res = await fetch(`/campaignsinf?${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token
          }
        });

        if (res.ok) {
          this.campaigns = await res.json();
        } else {
          alert('Error fetching campaigns');
        }
      } catch (error) {
        alert('Error fetching campaigns:', error);
      }
    },
    openAdRequestModal(campaign) {
      this.selectedCampaign = campaign;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedCampaign = null;
    },
    async submitAdRequest(adRequestData) {
      try {
        const res = await fetch('/createad', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token
          },
          body: JSON.stringify(adRequestData)
        });

        if (res.ok) {
          alert('Ad request sent successfully!');
          this.closeModal();
        } else {
          alert('Error sending ad request');
        }
      } catch (error) {
        alert('Error sending ad request:', error);
      }
    }
  },
  async mounted() {
    if (!this.isAdmin) {
      await this.fetchInfluencer(); 
    }
    this.search();
  },
  
};

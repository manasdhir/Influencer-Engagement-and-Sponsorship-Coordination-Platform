import Influencer from '../components/Influencer.js'
import AdRequestModal from '../components/AdRequestModal.js';
export default {
  template: `
    <div class="p-4">
      <h1>Influencers</h1>
      <div class="d-flex mb-3">
        <input 
          v-model="searchQuery.name" 
          placeholder="Search by Name" 
          class="form-control mr-2" 
          @input="search"
          style="flex: 1;"
        />
        <input 
          v-model="searchQuery.category" 
          placeholder="Search by Category" 
          class="form-control mr-2" 
          @input="search"
          style="flex: 1;"
        />
        <input 
          v-model="searchQuery.minReach" 
          type="number" 
          placeholder="Min Reach" 
          class="form-control" 
          @input="search"
          style="flex: 1;"
        />
      </div>

      <div v-if="influencers.length > 0" class="row">
        <div 
          v-for="influencer in influencers" 
          :key="influencer.id" 
          class="col-lg-3 col-md-4 col-sm-12 mb-4"
        >
          <Influencer 
            :id="influencer.influencer_id"
            :name="influencer.name" 
            :category="influencer.category" 
            :niche="influencer.niche" 
            :reach="influencer.reach"
            :is-flagged="influencer.is_flagged"
            @create-ad-request="openAdRequestModal(influencer)"
          />
        </div>
      </div>
      <div v-else class="text-muted">No influencers available</div>

      <AdRequestModal
        v-if="showAdRequestModal"
        :influencer="selectedInfluencer"
        :campaigns="campaigns"
        @close="showAdRequestModal = false"
        @submit="createAdRequest"
      />
    </div>
  `,
  data() {
    return {
      influencers: [],
      campaigns: [],
      searchQuery: {
        name: '',
        category: '',
        minReach: null,
      },
      showAdRequestModal: false,
      selectedInfluencer: null,
    };
  },
  computed: {
    isAdmin() {
      return this.$store.state.role === 'admin';
    },
  },
  methods: {
    async search() {
      const queryParams = new URLSearchParams();

      if (this.searchQuery.name) queryParams.append('name', this.searchQuery.name);
      if (this.searchQuery.category) queryParams.append('category', this.searchQuery.category);
      if (this.searchQuery.minReach) queryParams.append('minReach', this.searchQuery.minReach);

      const queryString = queryParams.toString();

      try {
        const res = await fetch(location.origin + `/influencers?${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token,
          },
        });
        if (res.ok) {
          this.influencers = await res.json();
        } else {
          alert('Error fetching influencers');
        }
      } catch (error) {
        alert('Error fetching influencers:', error);
      }
    },
    async fetchCampaigns() {
      if (!this.isAdmin) {
        try {
          const res = await fetch(location.origin + `/campaigns`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Auth-Token': this.$store.state.auth_token,
            },
          });
          if (res.ok) {
            this.campaigns = await res.json();
          } else {
            alert('Error fetching campaigns');
          }
        } catch (error) {
          alert('Error fetching campaigns:', error);
        }
      }
    },
    openAdRequestModal(influencer) {
      this.selectedInfluencer = influencer;
      this.showAdRequestModal = true;
    },
    async createAdRequest(adRequestData) {
      try {
        console.log(JSON.stringify(adRequestData));
        const res = await fetch(location.origin + `/createad`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify(adRequestData),
        });
        if (res.ok) {
          alert('Ad request sent successfully');
          this.showAdRequestModal = false;
        } else {
          alert('Error creating ad request');
        }
      } catch (error) {
        alert('Error creating ad request:', error);
      }
    },
    updateFlagStatus(influencerId, isFlagged) {
      const influencer = this.influencers.find(i => i.influencer_id === influencerId);
      if (influencer) {
        influencer.is_flagged = isFlagged;
      }
    },
  },
  async mounted() {
    await this.search();
    await this.fetchCampaigns();
  },
  components: {
    Influencer,
    AdRequestModal,
  },
};

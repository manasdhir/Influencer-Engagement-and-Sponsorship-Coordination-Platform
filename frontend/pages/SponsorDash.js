import Campaign from "../components/Campaign.js";

export default {
  template: `
    <div class="p-4">
      <h1>Campaigns</h1>
      <button 
        class="btn btn-success mb-3" 
        @click="showAddCampaignForm = true"
      >
        Add Campaign
      </button>
      <button 
        class="btn btn-outline-success mb-3" 
        @click="DownloadDetails"
      >
        Download Details
      </button>
      <div v-if="showUpdateCampaignForm" class="modal-overlay" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; background-color: white; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; width: 60%; height: 80%; overflow: auto;">
  <div class="modal-content" style="width:100%;height:100%;">
    <button 
      class="btn btn-danger btn-sm close-btn" 
      @click="showUpdateCampaignForm = false"
    >
      &times; <!-- Cross button -->
    </button>

    <div class="card">
      <div class="card-header">Update Campaign</div>
      <div class="card-body">
        <form @submit.prevent="updateForm">
          <!-- Same form fields as Add Campaign, but bind to updatingCampaign -->
          <div class="form-group">
            <label for="campaignName">Campaign Name</label>
            <input 
              id="campaignName" 
              v-model="updatingCampaign.name" 
              type="text" 
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="campaignDescription">Description</label>
            <textarea 
              id="campaignDescription" 
              v-model="updatingCampaign.description" 
              class="form-control"
              required
            ></textarea>
          </div>
          <div class="form-group">
            <label for="campaignNiche">Niche</label>
            <input 
              id="campaignNiche" 
              v-model="updatingCampaign.niche" 
              type="text" 
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="campaignBudget">Budget</label>
            <input 
              id="campaignBudget" 
              v-model="updatingCampaign.budget" 
              type="number" 
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="campaignStartDate">Start Date</label>
            <input 
              id="campaignStartDate" 
              v-model="updatingCampaign.start_date" 
              type="date" 
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="campaignEndDate">End Date</label>
            <input 
              id="campaignEndDate" 
              v-model="updatingCampaign.end_date" 
              type="date" 
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="campaignVisibility">Visibility</label>
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-outline-primary" :class="{ active: updatingCampaign.visibility === 'Public' }">
                <input 
                  type="radio" 
                  id="visibilityPublic" 
                  value="Public" 
                  v-model="updatingCampaign.visibility" 
                  required
                /> Public
              </label>
              <label class="btn btn-outline-primary" :class="{ active: updatingCampaign.visibility === 'Private' }">
                <input 
                  type="radio" 
                  id="visibilityPrivate" 
                  value="Private" 
                  v-model="updatingCampaign.visibility" 
                  required
                /> Private
              </label>
            </div>
          </div>
          <div class="form-group">
            <label for="campaignGoals">Goals</label>
            <textarea 
              id="campaignGoals" 
              v-model="updatingCampaign.goals" 
              class="form-control"
              required
            ></textarea>
          </div>
          <button type="submit" class="btn btn-outline-primary" style="margin-top:2%">Save Changes</button>
        </form>
      </div>
    </div>
  </div>
</div>

      <div v-if="showCampaignDetails" class="modal-overlay" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; background-color: white; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; width: 60%; height: 80%; overflow: auto;">
  <div class="modal-content" style="width: 100%; height: 100%;">
    <button class="btn btn-danger btn-sm close-btn" @click="showCampaignDetails = false">
      &times; <!-- Cross button -->
    </button>
    <div class="card">
      <div class="card-header">Campaign Details</div>
      <div class="card-body">
        <form>
          <div class="form-group">
            <label for="campaignName">Campaign Name</label>
            <input id="campaignName" v-model="selectedCampaign.name" type="text" class="form-control" readonly />
          </div>
          <div class="form-group">
            <label for="campaignDescription">Description</label>
            <textarea id="campaignDescription" v-model="selectedCampaign.description" class="form-control" readonly></textarea>
          </div>
          <div class="form-group">
            <label for="campaignNiche">Niche</label>
            <input id="campaignNiche" v-model="selectedCampaign.niche" type="text" class="form-control" readonly />
          </div>
          <div class="form-group">
            <label for="campaignBudget">Budget</label>
            <input id="campaignBudget" v-model="selectedCampaign.budget" type="number" class="form-control" readonly />
          </div>
          <div class="form-group">
            <label for="campaignStartDate">Start Date</label>
            <input id="campaignStartDate" v-model="selectedCampaign.start_date" type="date" class="form-control" readonly />
          </div>
          <div class="form-group">
            <label for="campaignEndDate">End Date</label>
            <input id="campaignEndDate" v-model="selectedCampaign.end_date" type="date" class="form-control" readonly />
          </div>
          <div class="form-group">
            <label for="campaignVisibility">Visibility</label>
            <input id="campaignVisibility" v-model="selectedCampaign.visibility" type="text" class="form-control" readonly />
          </div>
          <div class="form-group">
            <label for="campaignGoals">Goals</label>
            <textarea id="campaignGoals" v-model="selectedCampaign.goals" class="form-control" readonly></textarea>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

      <div v-if="showAddCampaignForm" class="modal-overlay" style="position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background-color: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: 60%; 
  height: 80%; 
  overflow: auto;">
        <div class="modal-content" style="width:100%;height:100%;">
          <button 
            class="btn btn-danger btn-sm close-btn" 
            @click="showAddCampaignForm = false"
          >
            &times; <!-- Cross button -->
          </button>

          <div class="card">
            <div class="card-header">Add New Campaign</div>
            <div class="card-body">
              <form @submit.prevent="submitForm">
                <div class="form-group">
                  <label for="campaignName">Campaign Name</label>
                  <input 
                    id="campaignName" 
                    v-model="newCampaign.name" 
                    type="text" 
                    class="form-control"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="campaignDescription">Description</label>
                  <textarea 
                    id="campaignDescription" 
                    v-model="newCampaign.description" 
                    class="form-control"
                    required
                  ></textarea>
                </div>
                <div class="form-group">
                  <label for="campaignNiche">Niche</label>
                  <input 
                    id="campaignNiche" 
                    v-model="newCampaign.niche" 
                    type="text" 
                    class="form-control"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="campaignBudget">Budget</label>
                  <input 
                    id="campaignBudget" 
                    v-model="newCampaign.budget" 
                    type="number" 
                    class="form-control"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="campaignStartDate">Start Date</label>
                  <input 
                    id="campaignStartDate" 
                    v-model="newCampaign.start_date" 
                    type="date" 
                    class="form-control"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="campaignEndDate">End Date</label>
                  <input 
                    id="campaignEndDate" 
                    v-model="newCampaign.end_date" 
                    type="date" 
                    class="form-control"
                    required
                  />
                </div>
                <div class="form-group">
  <label for="campaignVisibility">Visibility</label>
  <div class="btn-group btn-group-toggle" data-toggle="buttons">
    <label class="btn btn-outline-primary" :class="{ active: newCampaign.visibility === 'Public' }">
      <input 
        type="radio" 
        id="visibilityPublic" 
        value="Public" 
        v-model="newCampaign.visibility" 
        required
      /> Public
    </label>
    <label class="btn btn-outline-primary" :class="{ active: newCampaign.visibility === 'Private' }">
      <input 
        type="radio" 
        id="visibilityPrivate" 
        value="Private" 
        v-model="newCampaign.visibility" 
        required
      /> Private
    </label>
  </div>
</div>

                <div class="form-group">
                  <label for="campaignGoals">Goals</label>
                  <textarea 
                    id="campaignGoals" 
                    v-model="newCampaign.goals" 
                    class="form-control"
                    required
                  ></textarea>
                </div>
                <button type="submit" class="btn btn-outline-primary" style="margin-top:2%" :disabled="isFormInvalid">Save</button>
              </form>
            </div>
          </div>
        </div>
      </div>
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
    <Campaign 
      :id="campaign.id"
      :name="campaign.name" 
      :niche="campaign.niche" 
      :budget="campaign.budget"
      :start_date="campaign.start_date"
      :end_date="campaign.end_date"
      :is_flagged="campaign.is_flagged"
      @showCampaign="showCampaign"
      @editCampaign="editCampaign"
      @deleteCampaign="deleteCampaign"
    />
  </div>
</div>
<div v-else class="text-muted">No campaigns available</div>
</div>
  `,
  data() {
    return {showUpdateCampaignForm: false,
      updatingCampaign: {
        id: '',
        name: '',
        description: '',
        niche: '',
        budget: null,
        start_date: '',
        end_date: '',
        visibility: '',
        goals: ''
      },
      campaigns: [],
      showAddCampaignForm: false,
      newCampaign: {
        name: '',
        description: '',
        niche: '',
        budget: null,
        start_date: '',
        end_date: '',
        visibility: '',
        goals: ''
      },
      searchQuery: {
        name: '',
        niche: '',
        minBudget: null
      },
      showCampaignDetails: false,
      selectedCampaign: {},
      formErrors: {},
    };
  },
  computed: {
    isFormInvalid() {
      return (
        !this.newCampaign.name ||
        !this.newCampaign.description ||
        !this.newCampaign.niche ||
        !this.newCampaign.budget ||
        !this.newCampaign.start_date ||
        !this.newCampaign.end_date ||
        !this.newCampaign.visibility ||
        !this.newCampaign.goals ||
        new Date(this.newCampaign.start_date) > new Date(this.newCampaign.end_date)
      );
    }
  },
  methods: {async DownloadDetails(){
    const res= await fetch(location.origin + '/createfile',{
      method:'GET',
      headers:{
        'Content-Type': 'application/json',
        'Auth-Token': this.$store.state.auth_token,
      }
    });
    const task_id=(await res.json()).task_id

    const interval= setInterval(async()=>{
      const res= await fetch(location.origin+'/getfile'+`/${task_id}`)
      if(res.ok){
        window.open(location.origin+'/getfile'+`/${task_id}`)
      }
    },100)

  },  async deleteCampaign(campaignId) {
    try {
      const res = await fetch(location.origin +`/deletecampaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Auth-Token': this.$store.state.auth_token,
        },
      });

      if (res.ok) {
        const deletedCampaignId = await res.json();
        this.campaigns = this.campaigns.filter(campaign => campaign.id !== deletedCampaignId.id);
      } else {
        alert('Failed to delete campaign');
      }
    } catch (error) {
      alert('Error deleting campaign:', error);
    }
  },
  async editCampaign(campaignId) {
    const campaign = await fetch(`/scampaigns/${campaignId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Auth-Token': this.$store.state.auth_token,
      },
    });
    if (campaign.ok) {
      const camp=await campaign.json()
      this.updatingCampaign = { ...camp};
      this.showUpdateCampaignForm = true;
    }
  },

  async updateForm() {
    try {
      const res = await fetch(`/updatecampaigns/${this.updatingCampaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Auth-Token': this.$store.state.auth_token,
        },
        body: JSON.stringify(this.updatingCampaign),
      });

      if (res.ok) {
        const updatedCampaign = await res.json();
        const index = this.campaigns.findIndex(c => c.id === updatedCampaign.id);
        if (index !== -1) {
          this.$set(this.campaigns, index, updatedCampaign); 
        }
        this.showUpdateCampaignForm = false; 
      } else {
        alert('Failed to update campaign');
      }
    } catch (error) {
      alert('Error updating campaign:', error);
    }
  },
    async showCampaign(campaignId) {
        try {
          const res = await fetch(`/scampaigns/${campaignId.campaignId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Auth-Token': this.$store.state.auth_token,
            },
          });
          if (res.ok) {
            this.selectedCampaign = await res.json();
            this.showCampaignDetails = true;
          } else {
            alert('Failed to fetch campaign details');
          }
        } catch (error) {
          alert('Error fetching campaign details:', error);
        }
      },    
    async search() {
      const queryParams = new URLSearchParams();

      if (this.searchQuery.name) queryParams.append('name', this.searchQuery.name);
      if (this.searchQuery.niche) queryParams.append('niche', this.searchQuery.niche);
      if (this.searchQuery.minBudget) queryParams.append('minBudget', this.searchQuery.minBudget);

      const queryString = queryParams.toString();
      
      try {
        const res = await fetch(location.origin+`/campaigns?${queryString}`, {
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
    },
    async submitForm() {
      this.formErrors = {};
      if (!this.newCampaign.name) {
        this.formErrors.name = 'Campaign name is required';
      }
      if (!this.newCampaign.description) {
        this.formErrors.description = 'Description is required';
      }
      if (!this.newCampaign.niche) {
        this.formErrors.niche = 'Niche is required';
      }
      if (!this.newCampaign.budget) {
        this.formErrors.budget = 'Budget is required';
      }
      if (!this.newCampaign.start_date) {
        this.formErrors.startDate = 'Start date is required';
      }
      if (!this.newCampaign.end_date) {
        this.formErrors.endDate = 'End date is required';
      }
      if (new Date(this.newCampaign.start_date) > new Date(this.newCampaign.end_date)) {
        this.formErrors.dateRange = 'Start date cannot be later than end date';
      }
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      try {
        const res = await fetch('/createcampaigns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify(this.newCampaign),
        });
        if (res.ok) {
          this.campaigns.push(await res.json()); 
          this.showAddCampaignForm = false; 
          this.newCampaign = { name: '', description: '', niche: '', budget: null, start_date: '', end_date: '', visibility: '', goals: '' }; // Clear form
        } else {
          console.log(res)
          alert('Failed to add campaign');
        }
      } catch (error) {
        alert('Error submitting form:', error);
      }
    }
  },
  async mounted() {
    await this.search();
  },  
  components: {
    Campaign,
  },
  
};

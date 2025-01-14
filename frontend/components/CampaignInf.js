export default {
    props: {
      id: Number,
      name: String,
      niche: String,
      budget: Number,
      start_date: String,
      end_date: String,
      visibility: String,
      goals: String,
      description: String,
      isFlagged: String 
    },
    template: `
      <div class="card mb-4" :class="{ 'border-danger': computedIsFlagged }">
        <div class="card-header">
          Campaign: {{ name }}
        </div>
        <div class="card-body">
          <p><strong>Niche:</strong> {{ niche }}</p>
          <p><strong>Budget:</strong> {{ budget }}</p>
          <p><strong>Start Date:</strong> {{ start_date }}</p>
          <p><strong>End Date:</strong> {{ end_date }}</p>
          <p><strong>Visibility:</strong> {{ visibility }}</p>
          <p><strong>Goals:</strong> {{ goals }}</p>
          <p><strong>Description:</strong> {{ description }}</p>
          <div>
            <button 
              v-if="isAdmin" 
              class="btn btn-warning" 
              @click="flagCampaign" 
              :disabled="computedIsFlagged"
            >
              {{ computedIsFlagged ? 'Already Flagged' : 'Flag Campaign' }}
            </button>
            <button 
              v-else 
              class="btn btn-primary" 
              @click="sendRequest" 
              :disabled="computedIsFlagged"
            >
              {{ computedIsFlagged ? 'Flagged' : 'Send Request' }}
            </button>
          </div>
        </div>
      </div>
    `,
    computed: {
      isAdmin() {
        return this.$store.state.role === 'admin';
      },
      computedIsFlagged() {
        return this.isFlagged === "True";
      }
    },
    methods: {
      sendRequest() {
        this.$emit('send-request', {
          id: this.id,
          name: this.name,
          niche: this.niche,
          budget: this.budget,
          start_date: this.start_date,
          end_date: this.end_date,
          visibility: this.visibility,
          goals: this.goals,
          description: this.description
        });
      },
      async flagCampaign() {
        try {
          const res = await fetch(location.origin + `/campaignflag/${this.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Auth-Token': this.$store.state.auth_token
            }
          });
  
          if (res.ok) {
            alert('Campaign flagged successfully');
            this.$emit('update-flag-status', this.id, true);
          } else {
            alert('Error flagging campaign');
          }
        } catch (error) {
          alert('Error flagging campaign:', error);
        }
      }
    }
  };
  
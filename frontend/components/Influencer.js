export default {
  props: [
    'id',
    'name',
    'category',
    'niche',
    'reach',
    'isFlagged', 
  ],
  template: `
    <div 
      class="card h-100" 
      :class="{ 'border-danger': computedIsFlagged }" 
      style="width: 100%; margin-top: 1.5vh;"
    >
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">{{ name }}</h5>
        <p class="card-text"><strong>ID:</strong> {{ id }}</p>
        <p class="card-text"><strong>Category:</strong> {{ category }}</p>
        <p class="card-text"><strong>Niche:</strong> {{ niche }}</p>
        <p class="card-text"><strong>Reach:</strong> {{ reach }}</p>
        <button 
          v-if="isAdmin" 
          class="btn btn-warning mt-auto" 
          @click="flagInfluencer" 
          :disabled="computedIsFlagged"
        >
          {{ computedIsFlagged ? 'Already Flagged' : 'Flag Influencer' }}
        </button>
        <button 
          v-else 
          class="btn mt-auto"
          :class="computedIsFlagged ? 'btn-danger' : 'btn-outline-success'"
          :disabled="computedIsFlagged"
          @click="sendRequest"
        >
          {{ computedIsFlagged ? 'Flagged' : 'Send Ad Request' }}
        </button>
      </div>
    </div>
  `,
  computed: {
    isAdmin() {
      return this.$store.state.role === 'admin';
    },
    computedIsFlagged() {
      return this.isFlagged === 'True';
    },
  },
  methods: {
    sendRequest() {
      this.$emit('create-ad-request', {
        id: this.id,
        name: this.name,
        category: this.category,
        niche: this.niche,
        reach: this.reach,
      });
    },
    async flagInfluencer() {
      try {
        const res = await fetch(location.origin + `/influencerflag/${this.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token,
          },
        });
        if (res.ok) {
          alert('Influencer flagged successfully');
          this.$emit('update-flag-status', this.id, true);
        } else {
          alert('Error flagging influencer');
        }
      } catch (error) {
        alert('Error flagging influencer:', error);
      }
    },
  },
};

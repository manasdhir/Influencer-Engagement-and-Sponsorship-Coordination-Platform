export default {
  props: {
    adRequest: Object,
    role: String,
  },
  template: `
    <tr>
      <td>{{ adRequest.campaign_name }}</td>
      <td>{{ adRequest.influencer_name }}</td>
      <td>{{ adRequest.status }}</td>
      <td>{{ adRequest.payment_amount }}</td>
      <td>
        <button @click="showAdRequest" class="btn btn-info btn-sm">Show</button>
        
        <button 
          v-if="role === 'sponsor'" 
          @click="emitNegotiateOrUpdate" 
          class="btn btn-warning btn-sm"
          :disabled="!isNegotiateEnabled"
        >
          Update
        </button>

        <button 
          v-if="role === 'sponsor'" 
          @click="emitDeleteOrReject" 
          class="btn btn-danger btn-sm"
          :disabled="!isActionEnabled"
        >
          Delete
        </button>
        
        <button 
          v-if="role === 'influencer'" 
          @click="emitNegotiateOrUpdate" 
          class="btn btn-primary btn-sm"
          :disabled="!isNegotiateEnabled"
        >
          Negotiate
        </button>
        
        <button 
          v-if="role === 'influencer'" 
          @click="emitDeleteOrReject" 
          class="btn btn-danger btn-sm"
          :disabled="!isActionEnabled"
        >
          Reject
        </button>

        <button 
          :disabled="!isAcceptEnabled" 
          @click="emitAccept" 
          class="btn btn-success btn-sm"
        >
          Accept
        </button>
      </td>
    </tr>
  `,
  computed: {
    isNegotiateEnabled() {
      return (
        (this.role === 'influencer' && this.adRequest.status === 'Sent to Influencer') ||
        (this.role === 'sponsor' && this.adRequest.status === 'Sent to Sponsor')
      );
    },
    isAcceptEnabled() {
      return (
        (this.role === 'sponsor' && this.adRequest.status === 'Sent to Sponsor') ||
        (this.role === 'influencer' && this.adRequest.status === 'Sent to Influencer')
      );
    },
    isActionEnabled() {
      return this.adRequest.status !== 'Accepted';
    },
  },
  methods: {
    showAdRequest() {
      this.$emit('show', this.adRequest);
    },
    emitNegotiateOrUpdate() {
      this.$emit('negotiate-or-update', this.adRequest);
    },
    emitDeleteOrReject() {
      this.$emit('delete-or-reject', this.adRequest);
    },
    async emitAccept() {
      try {
        const res = await fetch(`/acceptad/${this.adRequest.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token,
          },
        });
    
        if (res.ok) {
          const updatedAdRequest = await res.json();
          this.$emit('update', updatedAdRequest); // Emit updated data to parent
          alert('Ad request accepted successfully!');
        } else {
          alert('Failed to accept the ad request.');
        }
      } catch (error) {
        console.error('Error accepting ad request:', error);
        alert('Error accepting ad request.');
      }
    }
    ,
  },
};

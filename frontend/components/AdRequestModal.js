export default {
  props: {
    influencer: Object,
    campaigns: Array,
    sendToSponsor: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedCampaign: null,
      messages: '',
      requirements: '',
      paymentAmount: null,
    };
  },
  computed: {
    isFormValid() {
      return (
        this.selectedCampaign &&
        this.messages.trim() !== '' &&
        this.requirements.trim() !== '' &&
        this.paymentAmount !== null
      );
    },
  },
  template: `
    <div class="modal-overlay" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; background-color: white; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; width: 60%; height: 60%; overflow: auto;">
      <div class="modal-content p-4">
        <button class="btn btn-danger btn-sm float-right" @click="$emit('close')"> &times </button>
        <h2>Create Ad Request</h2>
        <form @submit.prevent="submitAdRequest">
          <div class="form-group">
            <label for="campaign">Select Campaign</label>
            <select id="campaign" v-model="selectedCampaign" class="form-control">
              <option v-for="campaign in campaigns" :key="campaign.campaign_id" :value="campaign">
                {{ campaign.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="messages">Messages</label>
            <textarea id="messages" v-model="messages" class="form-control"></textarea>
          </div>
          <div class="form-group">
            <label for="requirements">Requirements</label>
            <textarea id="requirements" v-model="requirements" class="form-control"></textarea>
          </div>
          <div class="form-group">
            <label for="paymentAmount">Payment Amount</label>
            <input id="paymentAmount" v-model="paymentAmount" type="number" class="form-control" />
          </div>
          <button type="submit" class="btn btn-outline-primary" :disabled="!isFormValid" style="margin-top:1%;">Send Ad Request</button>
        </form>
      </div>
    </div>
  `,
  methods: {
    submitAdRequest() {
      const adRequestData = {
        campaign_id: this.selectedCampaign.id,
        influencer_id: this.influencer.influencer_id ,
        messages: this.messages,
        requirements: this.requirements,
        payment_amount: this.paymentAmount,
        status: this.sendToSponsor ? 'Sent to Sponsor' : 'Sent to Influencer',
      };
      this.$emit('submit', adRequestData);
    },
  },
};

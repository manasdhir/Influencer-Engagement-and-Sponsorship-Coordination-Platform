export default {
    props: {
      adRequest: Object,
      mode: String,
    },
    data() {
      return {
        editableData: {},
      };
    },
    watch: {
      adRequest: {
        immediate: true,
        handler(newAdRequest) {
          if (this.mode === "update" && newAdRequest) {
            this.editableData = { ...newAdRequest };
          }
        },
      },
    },
    computed: {
      isFormValid() {
        return (
          this.editableData.messages &&
          this.editableData.requirements &&
          this.editableData.payment_amount
        );
      },
    },
    methods: {
      closeModal() {
        this.$emit("close");
      },
      async saveChanges() {
        this.$emit("update", this.editableData);
        this.closeModal();
      },
    },
    template: `
      <div class="modal-overlay" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; background-color: white; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; width: 60%; height: 60%; overflow: auto;">
        <div class="modal-content p-4">
          <button class="btn btn-danger btn-sm float-right" @click="closeModal">&times;</button>
          <h3 v-if="mode === 'show'">Ad Request Details</h3>
          <h3 v-if="mode === 'update'">Update/Negotiate Ad Request</h3>
          <div v-if="adRequest">
            <div class="form-group">
              <label>Campaign Name:</label>
              <p>{{ adRequest.campaign_name }}</p>
            </div>
            <div class="form-group">
              <label>Influencer Name:</label>
              <p>{{ adRequest.influencer_name }}</p>
            </div>
            <div class="form-group">
              <label>Messages:</label>
              <textarea 
                v-if="mode === 'update'" 
                v-model="editableData.messages" 
                class="form-control"></textarea>
              <p v-if="mode === 'show'">{{ adRequest.messages }}</p>
            </div>
            <div class="form-group">
              <label>Requirements:</label>
              <textarea 
                v-if="mode === 'update'" 
                v-model="editableData.requirements" 
                class="form-control"></textarea>
              <p v-if="mode === 'show'">{{ adRequest.requirements }}</p>
            </div>
            <div class="form-group">
              <label>Payment Amount:</label>
              <input 
                v-if="mode === 'update'" 
                type="number" 
                v-model="editableData.payment_amount" 
                class="form-control" />
              <p v-if="mode === 'show'">{{ adRequest.payment_amount }}</p>
            </div>
            <div class="form-group">
              <label>Status:</label>
              <p>{{ adRequest.status }}</p>
            </div>
            <button 
              v-if="mode === 'update'" 
              @click="saveChanges" 
              :disabled="!isFormValid" 
              class="btn btn-outline-primary" style="margin-top: 1%;">Save</button>
          </div>
        </div>
      </div>
    `,
  };
  
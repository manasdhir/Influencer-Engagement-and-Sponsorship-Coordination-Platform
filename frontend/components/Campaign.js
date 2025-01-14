export default {
  props: [
    'id',
    'name',
    'niche',
    'budget',
    'start_date',
    'end_date',
    'is_flagged'
  ],
  template: `
    <div :class="['card', isFlagged ? 'border-danger' : 'border-success', 'mb-3']" style="width: 100%; margin: 0;">
        <div :class="['card-header', isFlagged ? 'text-danger' : 'text-success']">
            {{ name }}
        </div>
        <div :class="['card-body', isFlagged ? 'text-danger' : 'text-success']">
            <h5 class="card-title">Niche: {{ niche }}</h5>
            <p class="card-text">Budget: {{ budget }}</p>
            <p class="card-text">Start Date: {{ start_date }}</p>
            <p class="card-text">End Date: {{ end_date }}</p>
            <hr>
            <div class="d-flex">
            <button 
            class="btn btn-primary m-2" 
            :disabled="isFlagged"
            @click="showC(id)"
          >
            Show
          </button>
          
                <button 
                    class="btn btn-warning m-2" 
                    :disabled="isFlagged"
                    @click="updateCampaign"
                >
                    Update
                </button>
                <button 
                    class="btn btn-danger m-2" 
                    :disabled="isFlagged"
                    @click="deleteCampaign"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
  `,
  computed: {
    isFlagged() {
      return this.is_flagged === "True";
    }
  },
  methods: {
    showC(id){
      this.$emit('showCampaign', {campaignId:id});
    },
    updateCampaign() {
      this.$emit('editCampaign', this.id);
    },
    deleteCampaign() {
      this.$emit('deleteCampaign', this.id);
    }
  },
};

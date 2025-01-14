import TableRow from '../components/TableRow.js'
import AdReqDet from '../components/AdReqDet.js';

export default {
  template: `
    <div class="p-4">
      <h1>Ad Requests</h1>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Campaign Name</th>
            <th>Influencer Name</th>
            <th>Status</th>
            <th>Payment Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <TableRow
            v-for="adRequest in adRequests" 
            :key="adRequest.id" 
            :ad-request="adRequest"
            :role="role"
            @show="handleShow"
            @negotiate-or-update="handleNegotiateOrUpdate"
            @delete-or-reject="handleDeleteOrReject"
            @update="updateAdRequest"
          />
        </tbody>
      </table>
      
      <AdReqDet
        v-if="selectedAdRequest"
        :ad-request="selectedAdRequest"
        :mode="modalMode"
        @close="closeModal"
        @update="saveUpdatedAdRequest"
      />
    </div>
  `,
  data() {
    return {
      adRequests: [], 
      selectedAdRequest: null, 
      modalMode: null, 
    };
  },
  computed: {
    role() {
      return this.$store.state.role;
    },
  },
  methods: {
    async fetchAdRequests() {
      try {
        const res = await fetch(location.origin + `/adrequests`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token,
          },
        });

        if (res.ok) {
          this.adRequests = await res.json();
        } else {
          alert('Error fetching ad requests');
        }
      } catch (error) {
        console.error('Error fetching ad requests:', error);
        alert('Error fetching ad requests');
      }
    },
    async handleShow(adRequest) {
      try {
        const res = await fetch(`/getad/${adRequest.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token,
          }
        });
        if (res.ok) {
          this.selectedAdRequest = await res.json();
          this.modalMode = 'show';
        } else {
          alert('Error fetching ad details');
        }
      } catch (error) {
        console.error('Error fetching ad details:', error);
        alert('Error fetching ad details');
      }
    },
    async handleNegotiateOrUpdate(adRequest) {
      try {
        const res = await fetch(`/getad/${adRequest.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token,
          }
        });
        if (res.ok) {
          this.selectedAdRequest = await res.json();
          this.modalMode = 'update';
        } else {
          alert('Error fetching ad details');
        }
      } catch (error) {
        console.error('Error fetching ad details:', error);
        alert('Error fetching ad details');
      }
    },
    async saveUpdatedAdRequest(updatedAdRequest) {
      try {
        const res = await fetch(`/updatead/${updatedAdRequest.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Auth-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify(updatedAdRequest),
        });
  
        if (res.ok) {
          const updatedData = await res.json();
          this.updateAdRequest(updatedData); 
          this.closeModal();
          alert('Ad request updated successfully!');
        } else {
          alert('Failed to update ad request');
        }
      } catch (error) {
        console.error('Error updating ad request:', error);
        alert('Error updating ad request');
      }
    },
    async handleDeleteOrReject(adRequest) {
      if (this.role === 'sponsor') {
        const confirmed = confirm(`Are you sure you want to delete the ad request: ${adRequest.campaign_name}?`);
        if (confirmed) {
          try {
            const res = await fetch(`/deletead/${adRequest.id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Auth-Token': this.$store.state.auth_token,
              },
            });
    
            if (res.ok) {
              alert('Ad request deleted successfully!');
              this.removeAdRequest(adRequest.id);
            } else {
              alert('Failed to delete ad request');
            }
          } catch (error) {
            console.error('Error deleting ad request:', error);
            alert('Error deleting ad request');
          }
        }
      } else if (this.role === 'influencer') {
        const confirmed = confirm(`Are you sure you want to reject the ad request: ${adRequest.campaign_name}?`);
        if (confirmed) {
          try {
            const res = await fetch(`/deletead/${adRequest.id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Auth-Token': this.$store.state.auth_token,
              },
            });
    
            if (res.ok) {
              alert('Ad request rejected and deleted successfully!');
              this.removeAdRequest(adRequest.id);
            } else {
              alert('Failed to reject ad request');
            }
          } catch (error) {
            console.error('Error rejecting ad request:', error);
            alert('Error rejecting ad request');
          }
        }
      }
    }
    ,
    removeAdRequest(adRequestId) {
      this.adRequests = this.adRequests.filter(ad => ad.id !== adRequestId);
    },
    closeModal() {
      this.selectedAdRequest = null;
      this.modalMode = null;
    },
    updateAdRequest(updatedAdRequest) {
      const index = this.adRequests.findIndex(ad => ad.id === updatedAdRequest.id);
      if (index !== -1) {
        this.$set(this.adRequests, index, updatedAdRequest);
      }
    },
  },
  async mounted() {
    await this.fetchAdRequests();
  },
  components: {
    TableRow,
    AdReqDet,
  },
};

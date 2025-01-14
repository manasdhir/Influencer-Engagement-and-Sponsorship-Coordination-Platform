export default {
    template: `
    <div class="p-4">
        <h1>Influencer Profile 🎤</h1>
        <form @submit.prevent="saveDetails" class="row">
            <div class="col-md-6 mb-3">
                <label for="name" class="form-label">Name</label>
                <input 
                    id="name" 
                    type="text" 
                    class="form-control" 
                    v-model="influencer.name"
                    @input="checkChanges"
                />
            </div>
            <div class="col-md-6 mb-3">
                <label for="category" class="form-label">Category</label>
                <input 
                    id="category" 
                    type="text" 
                    class="form-control" 
                    v-model="influencer.category"
                    @input="checkChanges"
                />
            </div>
            <div class="col-md-6 mb-3">
                <label for="niche" class="form-label">Niche</label>
                <input 
                    id="niche" 
                    type="text" 
                    class="form-control" 
                    v-model="influencer.niche"
                    @input="checkChanges"
                />
            </div>
            <div class="col-md-6 mb-3">
                <label for="reach" class="form-label">Reach</label>
                <input 
                    id="reach" 
                    type="number" 
                    class="form-control" 
                    v-model="influencer.reach"
                    @input="checkChanges"
                />
            </div>
            <div class="col-12 text-end">
                <button 
                    type="submit" 
                    class="btn btn-success me-2" 
                    :disabled="!hasChanges"
                >Save</button>
                <button @click="deleteProfile" class="btn btn-danger">Delete Profile</button>
            </div>
        </form>
    </div>
    `,
    data() {
        return {
            influencer: {},
            originalDetails: {}, 
            hasChanges: false
        };
    },
    methods: {
        async fetchInfluencerDetails() {
            try {
                const res = await fetch(location.origin + `/getinfluencer`, {
                    headers: {
                        'Auth-Token': this.$store.state.auth_token
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.influencer = { ...data };
                    this.originalDetails = { ...data }; // Keep a copy of the original details
                } else {
                    alert('Error fetching influencer details');
                }
            } catch (error) {
                console.error('Network error:', error);
                alert('Error fetching influencer details');
            }
        },
        checkChanges() {
            this.hasChanges = JSON.stringify(this.influencer) !== JSON.stringify(this.originalDetails);
        },
        async saveDetails() {
            try {
                const res = await fetch(location.origin + `/updateinfluencer`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Auth-Token": this.$store.state.auth_token
                    },
                    body: JSON.stringify(this.influencer)
                });
        
                if (res.ok) {
                    const data = await res.json();
                    if (data.message === "Profile updated successfully") {
                        alert('Profile updated successfully!');
                        this.originalDetails = { ...this.influencer }; 
                        this.hasChanges = false;
                    } else {
                        console.warn("Unexpected response format:", data);
                        alert("Profile updated, but received an unexpected response.");
                    }
                } else {
                    const errorData = await res.json();
                    alert(`Failed to update profile: ${errorData.error || "Unknown error"}`);
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Error updating profile');
            }
        }
        ,
        async deleteProfile() {
            const confirmed = confirm("Are you sure you want to delete your profile?");
            if (!confirmed) return;

            try {
                const res = await fetch(location.origin + `/deleteinfluencer`, {
                    method: "DELETE",
                    headers: {
                        "Auth-Token": this.$store.state.auth_token
                    }
                });

                if (res.ok) {
                    this.$store.commit('logout')
                } else {
                    alert('Failed to delete profile');
                }
            } catch (error) {
                console.error('Error deleting profile:', error);
                alert('Error deleting profile');
            }
        }
    },
    async mounted() {
        await this.fetchInfluencerDetails();
    }
};

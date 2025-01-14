export default {
    template: `
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-4">
                <div class="card border-body" style="width: 27rem; margin-top: 10vh;">
                    <div class="card-header text-bg-dark border border-secondary">
                        <p class="fs-3 fw-bold mb-0">Login</p>
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                            <div class="mb-2">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" v-model="Email" class="form-control" id="email" placeholder="Email" required>
                            </div>
                            <div class="mb-2">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" v-model="password" class="form-control" id="password" placeholder="Password" required>
                            </div>
                            <div class="mb-2">
                                <label class="form-label">Role:</label><br>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" v-model="role" id="roleInfluencer" value="influencer" required>
                                    <label class="form-check-label" for="roleInfluencer">Influencer</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" v-model="role" id="roleAdmin" value="admin" required>
                                    <label class="form-check-label" for="roleAdmin">Admin</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" v-model="role" id="roleSponsor" value="sponsor" required>
                                    <label class="form-check-label" for="roleSponsor">Sponsor</label>
                                </div>
                            </div>
                            <button @click="submitlogin" class="btn btn-outline-dark">Login</button>
                        </li>
                        <li class="list-group-item">
                        <span class="nav-text" style="display: flex; align-items: center; gap: 0.5rem;">
                            Don't have an account? 
                            <router-link to="/registerInf" class="nav-link" style="color: blue; text-decoration: underline;">Register</router-link>
                        </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            Email: null,
            password: "",
            role: null,
        };
    },
    methods: {validateInputs() {
        const errors = {};
        if (!this.Email) {
          errors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(this.Email)) {
          errors.email = "Invalid email format.";
        }
        if (!this.password) {
          errors.password = "Password is required.";
        } 
        if (!this.role) {
          errors.name = "Role is required.";
        }
        this.errors = errors;
        if (Object.keys(errors).length > 0) {
          const errorMessages = Object.values(errors).join('\n');
          alert(`Please correct the following errors:\n\n${errorMessages}`);
          return false;
        }
        return true;
      },
        async submitlogin() {
            if (!this.validateInputs()) {
                return;
              }
            const r = await fetch(location.origin + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.Email, password: this.password, role: this.role }),
            });
            if (r.ok) {
                console.log('Logged in');
                const data = await r.json();
                console.log(data);
                localStorage.setItem('user',JSON.stringify(data));
                this.$store.commit('setUser');
                if(this.role=='admin'){
                this.$router.push('/admindashboardsp');
                }
                if(this.role=='sponsor'){
                    this.$router.push('/sponsordash');
                }
                if(this.role=='influencer'){
                    this.$router.push('/influencerprofile');
                }
            } else {
                const e= await r.json();
                alert(`Login failed: ${e.message}`);
            }
        },
    },
};

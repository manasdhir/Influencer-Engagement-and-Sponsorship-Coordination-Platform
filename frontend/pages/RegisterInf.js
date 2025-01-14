export default {
    template: `
      <div class="container-fluid" style="padding-left:17%;padding-right:15%;">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card border-body" style="width: 27rem; margin-top: 2vh;">
              <div class="card-header text-bg-dark border border-secondary">
                <p class="fs-3 fw-bold mb-0">Register as Influencer</p>
              </div>
              <div class="card-body" style="background-color: rgb(207, 206, 206);">
                <div class="mb-2">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    placeholder="Enter your email" 
                    v-model="Email" 
                    required 
                  />
                </div>
                <div class="mb-2">
                  <label for="password" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    placeholder="Enter your password" 
                    v-model="password" 
                    minlength="8" 
                    maxlength="12" 
                    required 
                  />
                </div>
                <div class="mb-2">
                <label for="exampleInputname" class="form-label">Name</label>
                <input type="text" class="form-control" id="exampleInputname" name="name"  v-model="Name"  required>
                </div>
                <div class="mb-2">
                <label for="exampleInput" class="form-label">Category</label>
                <input type="text" class="form-control" id="exampleInput" name="category"  v-model="Category" required>
                </div>
                <div class="mb-2">
                <label for="exampleInputname" class="form-label">Niche</label>
                <input type="text" class="form-control" id="exampleInputcat" name="Niche" v-model="Niche" required>
                </div>
                <div class="mb-2">
                <label for="exampleInputreach" class="form-label">Reach</label>
                <input type="number" class="form-control" id="exampleInputreach" name="reach" v-model="Reach" required>
                </div>
                </div>
                <button 
                  class="btn btn-outline-dark w-100" 
                  @click="submitlogin">
                  Register
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `,
    data() {
      return {
        Email: null,
        password: "",
        role: "influencer",
        Name:null,
        Category:null,
        Niche:null,
        Reach:null,
        errors:{},
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
      } else if (this.password.length < 8 || this.password.length > 12) {
        errors.password = "Password must be 8-12 characters long.";
      }
      if (!this.Name) {
        errors.name = "Name is required.";
      }
      if (!this.Category) {
        errors.category = "Category is required.";
      }
      if (!this.Niche) {
        errors.niche = "Niche is required.";
      }
      if (!this.Reach) {
        errors.reach = "Reach is required.";
      } else if (this.Reach < 0) {
        errors.reach = "Reach cannot be negative.";
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
        const r = await fetch(location.origin + '/registerinf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.Email, password: this.password, role: this.role, name:this.Name, category:this.Category, niche:this.Niche, reach:this.Reach }),
        });
        if (r.ok) {
          alert('Registration Successful,Please Login');
          this.$router.push('/login');
        }
        else{
          const e= await r.json();
          alert(`Registration failed: ${e.message}`);
        }
      },
    },
  };
  
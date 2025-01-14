export default {
    template: `
    <div class="container-fluid" style="margin-left:0vw; margin-right:0vw;">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <router-link to="/" class="navbar-brand">
                    <img src="/static/img4.png" alt="Logo" width="30" height="24" class="d-inline-block align-text-top">
                    IESCP V2
                </router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <router-link to="/" class="nav-link" active-class="active">Home</router-link>
                        </li>
                        <li class="nav-item" v-if="!$store.state.loggedin">
                            <router-link to="/registersp" class="nav-link" active-class="active">Sponsor</router-link>
                        </li>
                        <li class="nav-item" v-if="!$store.state.loggedin">
                            <router-link to="/registerInf" class="nav-link" active-class="active">Influencer</router-link>
                        </li>
                        <li class="nav-item" v-if="!$store.state.loggedin">
                            <router-link to="/login" class="btn btn-outline-primary" active-class="active">Login</router-link>
                        </li>
                        <li class="nav-item" v-if="$store.state.loggedin && $store.state.role=='admin'">
                            <router-link to="/admindashboardsp" class="nav-link" active-class="active">Approve Sponsor</router-link>
                        </li>
                        <li class="nav-item" v-if="$store.state.loggedin && $store.state.role=='sponsor'">
                            <router-link to="/sponsordash" class="nav-link" active-class="active">Campaigns</router-link>
                        </li>
                        <li class="nav-item" v-if="$store.state.loggedin && $store.state.role=='sponsor'">
                            <router-link to="/findinf" class="nav-link" active-class="active">Find Influencers</router-link>
                        </li>
                        <li class="nav-item" v-if="$store.state.loggedin && $store.state.role=='sponsor'">
                        <router-link to="/adrequestssp" class="nav-link" active-class="active">Ad Requests</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedin && $store.state.role=='influencer'">
                        <router-link to="/influencerprofile" class="nav-link" active-class="active">Profile</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedin && $store.state.role=='influencer'">
                        <router-link to="/campaignsinf" class="nav-link" active-class="active">Campaigns</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedin && $store.state.role=='influencer'">
                        <router-link to="/adrequestsinf" class="nav-link" active-class="active">Requests</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedin && $store.state.role=='admin'">
                        <router-link to="/infcheck" class="nav-link" active-class="active">Influencers</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedin && $store.state.role=='admin'">
                        <router-link to="/campaigncheck" class="nav-link" active-class="active">Campaigns</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedin && $store.state.role=='admin'">
                        <router-link to="/stats" class="nav-link" active-class="active">Stats</router-link>
                    </li>
                        <button class="btn btn-outline-danger" v-if="$store.state.loggedin" @click="$store.commit('logout')">Logout</button>
                    </ul>
                </div>
            </div>
        </nav>
    </div>
    `
};

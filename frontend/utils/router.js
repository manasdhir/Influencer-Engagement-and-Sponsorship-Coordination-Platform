import LoginPage from "../pages/LoginPage.js";
import RegisterInf from "../pages/RegisterInf.js";
import Home from "../pages/Home.js";
import SponserInf from "../pages/SponserInf.js";
import store from "./store.js";
import AdminDash from "../pages/AdminDash.js";
import SponsorDash from "../pages/SponsorDash.js";
import FindinfSp from "../pages/FindinfSp.js";
import AdRequestSp from "../pages/AdRequestSp.js";
import InfluencerProfile from "../pages/InfluencerProfile.js";
import CampaignPage from "../pages/CampaignPage.js";
import AdminStats from "../pages/AdminStats.js";
const routes=[
    {path:'/', component: Home },
    {path:'/login', component: LoginPage},
    {path:'/registerInf', component: RegisterInf},
    {path:'/registerSp', component: SponserInf},
    {path:'/admindashboardsp', component: AdminDash, meta: {requiresLogin: true, role:'admin'}},
    {path:'/infcheck', component: FindinfSp, meta: {requiresLogin: true, role:'admin'}},
    {path:'/campaigncheck', component: CampaignPage, meta: {requiresLogin: true, role:'admin'}},
    {path:'/stats', component: AdminStats, meta: {requiresLogin: true, role:'admin'}},
    {path:'/sponsordash', component: SponsorDash, meta: {requiresLogin: true, role:'sponsor'}},
    {path:'/findinf', component: FindinfSp, meta:{requiresLogin: true, role:'sponsor'}},
    {path:'/adrequestssp', component: AdRequestSp, meta:{requiresLogin: true, role:'sponsor'}},
    {path:'/influencerprofile', component: InfluencerProfile , meta:{requiresLogin: true, role:'influencer'}},
    {path:'/campaignsinf', component: CampaignPage , meta:{requiresLogin: true, role:'influencer'}},
    {path:'/adrequestsinf', component: AdRequestSp, meta:{requiresLogin: true, role:'influencer'}}


]

const router= new VueRouter({
    routes
})

router.beforeEach((to, from, next) => {

    if (to.matched.some((record) => record.meta.requiresLogin)){
        if (!store.state.loggedin){
            next({path : '/login'})
        } else if (to.meta.role && to.meta.role != store.state.role){
             alert('Cannot visit with current role')
             next({path : '/'})
        } else {
            next();
        }
    } else {
        next();
    }
})
export default router;
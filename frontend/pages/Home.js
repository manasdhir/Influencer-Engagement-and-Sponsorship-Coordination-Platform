export default{
    template:`
    <div class="container-fluid">
    <section class="first-section text-center" style="background: rgb(10, 0, 39);
            background-size: cover;
            color: rgb(247, 246, 246);
            padding: 100px 100px;
            margin:0;">
    <div class="container">
        <h1>Connect. Collaborate. Create.</h1>
        <p>The ultimate platform to bring Sponsors and Influencers together.</p>
        <router-link to='/register' class="btn btn-primary btn-lg mt-3">Get Started</router-link>
    </div>
</section>

<section class="py-5">
    <div class="container text-center" >
        <div class="row">
            <div class="col-md-8" style="padding: 0;">
                <h2>About IESCP V2</h2>
                <p>IESCP is a platform designed to connect sponsors with influencers to facilitate seamless collaborations. Whether you are a brand looking to promote your product or an influencer seeking new opportunities, IESCP provides the tools you need to succeed.</p>
            </div>
            <div class="col-md-4">
                <img src="static/Designer (3).png" style="height: 20vh; width: 20vh;" alt="About Image">
            </div>
        </div>
    </div>
</section>

<section class="bg-light py-5">
    <div class="container">
        <div class="text-center mb-5">
            <h2>Features</h2>
            <p>Discover the key features of our platform.</p>
        </div>
        <div class="row">
            <div class="col-md-4 text-center">
                <h4>Easy Registration</h4>
                <p>Quick and easy registration for both sponsors and influencers.</p>
            </div>
            <div class="col-md-4 text-center">
                <h4>Campaign Management</h4>
                <p>Create, manage, and track your campaigns effortlessly.</p>
            </div>
            <div class="col-md-4 text-center">
                <h4>Performance Analytics</h4>
                <p>Get detailed analytics to measure your campaign's success.</p>
            </div>
        </div>
    </div>
</section>
</div>
    `
}
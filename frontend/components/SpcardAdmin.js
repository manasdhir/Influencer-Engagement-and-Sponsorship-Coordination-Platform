export default {
    props: [
        'sponsor_id',
        'company_name',
        'industry',
        'status',
        'user'
    ],
    template: `
    <div :class="['card', status === 'Approved' ? 'border-success' : 'border-danger', 'mb-3']" style="width: 100%;margin:0;">
        <div :class="['card-header', status === 'Approved' ? 'text-success' : 'text-danger']">
            {{ company_name }}
        </div>
        <div :class="['card-body', status === 'Approved' ? 'text-success' : 'text-danger']">
            <h5 class="card-title">Industry: {{ industry }}</h5>
            <p class="card-text">Status: {{ status }}</p>
            <hr>
            <p class="card-text">
                Contact Email: {{ user.email }} <br>
                User ID: {{ user.user_id }}
            </p>
            <button 
                class="btn btn-primary"
                :disabled="status === 'Approved'"
                @click="emitApproveStatus"
            >
                {{ status === 'Approved' ? 'Approved' : 'Approve' }}
            </button>
        </div>
    </div>
    `,
    methods: {
        emitApproveStatus() {
            if (this.status !== 'Approved') {
                this.$emit('update-status', { userId: this.user.user_id, newStatus: 'Approved' });
            }
        }
    }
};

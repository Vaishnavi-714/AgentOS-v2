// NEXUS subscription pricing helpers for the tenant registration prototype.
const NexusSubscriptionPricing = {
  SUBSCRIPTION_PLANS: {
    free: {
      id: 'free',
      name: 'Free',
      audience: 'Individuals',
      monthlyPrice: 0,
      yearlyPrice: 0,
      hasTrial: false,
      features: [
        '1 tenant workspace',
        'Basic dashboard access',
        'Limited project visibility',
        'Up to 3 invited users',
        'Community support'
      ]
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      audience: 'Growing Teams',
      monthlyPrice: 500,
      yearlyPrice: 4000,
      hasTrial: true,
      features: [
        'Up to 25 users',
        'Product and delivery dashboards',
        'Project hub access',
        'Role-based access control',
        'Basic workflow tracking',
        'Email support'
      ]
    },
    business: {
      id: 'business',
      name: 'Business',
      audience: 'Teams and Departments',
      monthlyPrice: 850,
      yearlyPrice: 6800,
      hasTrial: true,
      recommended: true,
      features: [
        'Unlimited projects',
        'Up to 100 users',
        'All role-based dashboards',
        'Invite users as Admin or Member',
        'Agent output review',
        'Workflow stage approvals',
        'Audit-ready activity tracking',
        'Priority support'
      ]
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      audience: 'Organizations',
      monthlyPrice: 1200,
      yearlyPrice: 9000,
      hasTrial: true,
      features: [
        'Unlimited users',
        'Multiple tenant workspaces',
        'Advanced governance controls',
        'Custom approval workflows',
        'Dedicated success manager',
        'Enterprise security review',
        'Priority support',
        'Advanced audit-ready tracking'
      ]
    }
  },

  plans: [
    {
      id: 'free',
      name: 'Free',
      audience: 'Individuals',
      description: 'Start exploring NEXUS with basic project visibility.',
      button: 'Get Started',
      monthly: 0,
      yearly: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      hasTrial: false,
      billingText: { monthly: '/ month', yearly: '/ year' },
      features: [
        '1 tenant workspace',
        'Basic dashboard access',
        'Limited project visibility',
        'Up to 3 invited users',
        'Community support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      audience: 'Growing teams',
      description: 'Manage projects, users, and delivery workflows with more control.',
      button: 'Upgrade to Pro',
      monthly: 500,
      yearly: 4000,
      monthlyPrice: 500,
      yearlyPrice: 4000,
      billingText: { monthly: '/ month', yearly: '/ year' },
      trial: true,
      hasTrial: true,
      features: [
        'Up to 25 users',
        'Product and delivery dashboards',
        'Project hub access',
        'Role-based access control',
        'Basic workflow tracking',
        'Email support'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      audience: 'Teams and departments',
      description: 'Advanced collaboration, governance, and automation for delivery teams.',
      button: 'Upgrade to Business',
      badge: 'Recommended',
      monthly: 850,
      yearly: 6800,
      monthlyPrice: 850,
      yearlyPrice: 6800,
      billingText: { monthly: '/ month', yearly: '/ year' },
      trial: true,
      hasTrial: true,
      recommended: true,
      features: [
        'Unlimited projects',
        'Up to 100 users',
        'All role-based dashboards',
        'Invite users as Admin or Member',
        'Agent output review',
        'Workflow stage approvals',
        'Audit-ready activity tracking',
        'Priority support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      audience: 'Organizations',
      description: 'Enterprise-grade control for large organizations and client delivery teams.',
      button: 'Upgrade to Enterprise',
      monthly: 1200,
      yearly: 9000,
      monthlyPrice: 1200,
      yearlyPrice: 9000,
      billingText: { monthly: '/ month', yearly: '/ year' },
      trial: true,
      hasTrial: true,
      features: [
        'Unlimited users',
        'Multiple tenant workspaces',
        'Advanced governance controls',
        'Custom approval workflows',
        'Dedicated success manager',
        'Enterprise security review',
        'Priority support',
        'Advanced audit-ready tracking'
      ]
    }
  ],

  getPlan(planId) {
    return this.plans.find(plan => plan.id === planId) || this.plans.find(plan => plan.id === 'business');
  },

  getPlanPrice(planId, billingCycle) {
    const plan = this.getPlan(planId);
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  },

  formatINR(amount) {
    if (typeof amount !== 'number') return amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  },

  getFirstBillingDate(baseDate = new Date()) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + 30);
    return date;
  },

  firstBillingDate(baseDate = new Date()) {
    return this.getFirstBillingDate(baseDate);
  },

  formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  },

  calculate(planId, billingCycle, trialEnabled = true) {
    const plan = this.getPlan(planId);
    const planPrice = this.getPlanPrice(planId, billingCycle);
    if (plan.id === 'free') {
      return { planPrice: 0, dueToday: 0, renewalAmount: 0, firstBillingDate: null };
    }
    return {
      planPrice,
      dueToday: trialEnabled ? 0 : planPrice,
      renewalAmount: planPrice,
      firstBillingDate: trialEnabled ? this.getFirstBillingDate() : null
    };
  }
};

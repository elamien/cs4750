import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/general/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/general/AboutView.vue'),
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../views/auth/OnboardingView.vue'),
    },
    {
      path: '/home-dashboard',
      name: 'home-dashboard',
      component: () => import('../views/dashboard/HomeDashboardView.vue'),
    },
    // Bands view (available to all users)
    {
      path: '/bands',
      name: 'bands',
      component: () => import('../views/general/BandsView.vue'),
    },
    {
      path: '/bands/:id',
      name: 'band-detail',
      component: () => import('../views/browse/BandDetailView.vue'),
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/general/EventsView.vue'),
    },
    // User account and preferences (signed-in users)
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/account/AccountView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/account/FavoritesView.vue'),
    },

    {
      path: '/fill-in-requests',
      name: 'fill-in-requests',
      component: () => import('../views/general/FillInRequestsView.vue'),
    },
    // General users
    {
      path: '/join-create-band',
      name: 'join-create-band',
      component: () => import('../views/band/JoinCreateBandView.vue'),
    },
    // Band member routes
    {
      path: '/my-band',
      name: 'my-band',
      component: () => import('../views/band/MyBandView.vue'),
    },
    // Band leader routes
    {
      path: '/my-band/info',
      name: 'band-info',
      component: () => import('../views/band/BandInfoView.vue'),
    },
    {
      path: '/my-band/members',
      name: 'band-members',
      component: () => import('../views/band/BandMembersView.vue'),
    },
    {
      path: '/my-band/member-requests',
      name: 'member-requests',
      component: () => import('../views/band/MemberRequestsView.vue'),
    },
    {
      path: '/my-band/create-fill-in',
      name: 'create-fill-in',
      component: () => import('../views/band/CreateFillInView.vue'),
    },
    // Executive/Admin routes
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/admin/AdminUsersView.vue'),
    },
    {
      path: '/admin/bands',
      name: 'admin-bands',
      component: () => import('../views/admin/AdminBandsView.vue'),
    },
    {
      path: '/admin/events',
      name: 'admin-events',
      component: () => import('../views/admin/AdminEventsView.vue'),
    },

  ],
})

export default router

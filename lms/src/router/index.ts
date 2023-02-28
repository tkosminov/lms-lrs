import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: "VDashboard",
      path: "/",
      component: () => import("../views/VDashboard.vue"),
      meta: {
        name: "routers.dashboard",
        icon: "house-door",
        protected: false,
      },
    },
    {
      name: "VUpload",
      path: "/uploads",
      component: () => import("../views/VUpload.vue"),
      meta: {
        name: "routers.upload",
        icon: "house-door",
        protected: false,
      },
    },
    {
      name: "VScormCourse",
      path: "/scorm/:course_id",
      props: true,
      component: () => import("../views/VScormCourse.vue"),
      meta: {
        name: "routers.scorm.course",
        icon: "house-door",
        protected: false,
      },
    },
  ]
})

export default router

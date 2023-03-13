import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const scorm_routes: RouteRecordRaw[] = [
  {
    name: "VScormPass",
    path: "/scorm/pass/:course_id",
    props: true,
    component: () => import("../views/scorm/VScormPass.vue"),
    meta: {
      name: "routers.scorm.course",
      icon: "house-door",
      protected: false,
    },
  },
  {
    name: "VScormLog",
    path: "/scorm/log/:course_id",
    props: true,
    component: () => import("../views/scorm/VScormLog.vue"),
    meta: {
      name: "routers.scorm.course",
      icon: "house-door",
      protected: false,
    },
  },
  {
    name: "VScormUpload",
    path: "/scorm/upload",
    props: true,
    component: () => import("../views/scorm/VScormUpload.vue"),
    meta: {
      name: "routers.scorm.course",
      icon: "house-door",
      protected: false,
    },
  },
]

const xapi_routes: RouteRecordRaw[] = [
  // {
  //   name: "VXApiPass",
  //   path: "/xapi/pass/:course_id",
  //   props: true,
  //   component: () => import("../views/xapi/VXApiPass.vue"),
  //   meta: {
  //     name: "routers.xapi.course",
  //     icon: "house-door",
  //     protected: false,
  //   },
  // },
  // {
  //   name: "VXApiLog",
  //   path: "/xapi/log/:course_id",
  //   props: true,
  //   component: () => import("../views/xapi/VXApiLog.vue"),
  //   meta: {
  //     name: "routers.xapi.course",
  //     icon: "house-door",
  //     protected: false,
  //   },
  // },
  {
    name: "VXApiUpload",
    path: "/xapi/upload",
    props: true,
    component: () => import("../views/xapi/VXApiUpload.vue"),
    meta: {
      name: "routers.xapi.course",
      icon: "house-door",
      protected: false,
    },
  },
]

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
   ...scorm_routes,
   ...xapi_routes,
  ]
})

export default router

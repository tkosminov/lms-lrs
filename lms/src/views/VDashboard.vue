<template>
  <div class="row">
    <div class="col-sm-12 col-md-12 col-lg-6 col-xl-6 p-5">
      <CHr :title="'scorm'" :icon="'bi-plus'" @click-button="toScormUpload" />

      <div class="row justify-content-md-center table-responsive">
        <table class="table table-hover table-sm">
          <thead>
            <tr class="row m-0">
              <th class="col-sm-8 col-md-8 col-lg-8 col-xl-8 d-flex align-items-center uppercase">
                Title
              </th>
              <th class="col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex justify-content-center align-items-end uppercase">
                Pass
              </th>
              <th class="col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex justify-content-center align-items-end uppercase">
                Log
              </th>
            </tr>
          </thead>

          <tbody>
            <tr class="row m-0" v-for="course of scorm_courses" :key="course.id">
              <td class="col-sm-8 col-md-8 col-lg-8 col-xl-8 d-flex align-items-center">
                {{  course.title  }}
              </td>
              <td class="col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex justify-content-center align-items-end">
                <router-link
                  :to="{ name: 'VScormPass', params: { course_id: course.id } }"
                  class="btn btn-outline-dark uppercase"
                >
                  Pass
                </router-link>
              </td>
              <td class="col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex justify-content-center align-items-end">
                <router-link
                  :to="{ name: 'VScormLog', params: { course_id: course.id } }"
                  class="btn btn-outline-dark uppercase"
                >
                  Log
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="col-sm-12 col-md-12 col-lg-6 col-xl-6 p-5">
      <CHr :title="'xapi'" :icon="'bi-plus'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, onBeforeMount } from "vue";
import router from "@/router";
import axios from "axios";

import type { IScormCourse } from '@/types'
import CHr from "@/components/CHr.vue";

const api_endpoint = import.meta.env.VITE_APP_API;

const scorm_courses: Ref<IScormCourse[]> = ref([]);

onBeforeMount(async () => {
  scorm_courses.value = await onLoadScormCourses()
})

async function onLoadScormCourses() {
  const { data: res }: { data: IScormCourse[] } = await axios.get(`${api_endpoint}/scorm/courses`)

  return res;
}

function toScormUpload() {
  router.push({ name: 'VScormUpload' })
}
</script>

<style>
  .uppercase {
    text-transform: uppercase;
  }
</style>

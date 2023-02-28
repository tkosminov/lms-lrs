<template>
  <div class="row justify-content-md-center">
    <ul>
      <li>
        <router-link
          :to="{ name: 'VUpload' }"
        >
          Загрузить курс
        </router-link>
      </li>
    </ul>
  </div>

  <div class="row justify-content-md-center">
    <div class="col-6">
      <h3>SCORM</h3>
      <ul v-if="scorm_courses.length">
        <li v-for="course of scorm_courses" :key="course.id">
          <router-link
            :to="{ name: 'VScormCourse', params: { course_id: course.id } }"
          >
            {{  course.title  }}
          </router-link>
        </li>
      </ul>
    </div>
    <div class="col-6">
      <h3>XApi</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, onBeforeMount } from "vue";
import axios from "axios";

import type { ICourse } from '@/types'

const api_endpoint = import.meta.env.VITE_APP_API;

const scorm_courses: Ref<ICourse[]> = ref([]);

onBeforeMount(async () => {
  scorm_courses.value = await onLoadScormCourses()
})

async function onLoadScormCourses() {
  const { data: res }: { data: ICourse[] } = await axios.get(`${api_endpoint}/scorm/courses`)

  return res;
}
</script>

<style></style>

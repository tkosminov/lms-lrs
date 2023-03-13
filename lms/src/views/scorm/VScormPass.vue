<template>
  <div class="row">
    <div class="col-sm-12 p-5" v-if="scorm_course">
      <CHr :title="scorm_course.title" :icon="''" />

      <div class="row justify-content-md-center">
        <div class="col-sm-12 col-md-4">
          <ul class="list-group">
            <li
              class="list-group-item"
              :class="[item.identifier === scorm_current_item_identifier ? 'active' : '']"
              v-for="item of scorm_course.items"
              :key="item.identifier"
              @click="selectSco(item)"
            >
              {{ item.title }}
            </li>
          </ul>
        </div>
        <div class="col-sm-12 col-md-8">
          <div class="ratio ratio-16x9 border border-secondary">
            <iframe :src="scorm_iframe_href" v-if="scorm_iframe_href"></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, onBeforeMount, defineProps, onBeforeUnmount } from "vue";
import axios from "axios";

import type { IScormCourse, IScormItem } from '@/types'
import CHr from "@/components/CHr.vue";
import { API, API_1484_11 } from '@/scorm.api';

const props = defineProps({
  course_id: { type: String, required: true },
});

const user_id = import.meta.env.VITE_APP_USER_ID
const api_endpoint = import.meta.env.VITE_APP_API;
const course_base_url: string = 'http://localhost:80'

const scorm_course: Ref<IScormCourse | null> = ref(null);
const scorm_current_item_identifier: Ref<string | null> = ref(null);
const scorm_iframe_href: Ref<string | null> = ref(null)

const current_window: Ref<Window & { API?: API, API_1484_11?: API_1484_11 } | null> = ref(window)

onBeforeMount(async () => {
  scorm_course.value = await loadCourse()
})

onBeforeUnmount(() => {
  current_window.value!.API = undefined;
  current_window.value!.API_1484_11 = undefined;
})

async function loadCourse() {
  const { data: res }: { data: IScormCourse } = await axios.get(`${api_endpoint}/scorm/courses/${props.course_id}`)

  return res;
}

function selectSco(item: IScormItem) {
  scorm_current_item_identifier.value = item.identifier;

  if (current_window.value!.API == null) {
    current_window.value!.API = new API(
      '/scorm',
      {
        user_id, course_id: scorm_course.value!.id
      },
      {
        course_identifier: scorm_course.value!.identifier,
        resource_identifier: item.identifier,
      },
      scorm_course.value!.items.map((i) => i.identifier),
    )
  } else {
    current_window.value!.API.values = {};
    current_window.value!.API.scorm_next_resource = null;
    current_window.value!.API.course_data.resource_identifier = item.identifier;
    
    if (!current_window.value!.API.initialized) {
      current_window.value!.API.LMSInitialize('');
    }
  }

  if (current_window.value!.API_1484_11 == null) {
    current_window.value!.API_1484_11 = new API_1484_11(
      '/scorm',
      {
        user_id, course_id: scorm_course.value!.id
      },
      {
        course_identifier: scorm_course.value!.identifier,
        resource_identifier: item.identifier,
      },
      scorm_course.value!.items.map((i) => i.identifier),
    )
  } else {
    current_window.value!.API_1484_11.values = {};
    current_window.value!.API_1484_11.scorm_next_resource = null;
    current_window.value!.API_1484_11.course_data.resource_identifier = item.identifier;

    if (!current_window.value!.API_1484_11.initialized) {
      current_window.value!.API_1484_11.Initialize('');
    }
  }

  scorm_iframe_href.value = `${course_base_url}/uploads/${scorm_course.value!.hash_sum}/${item.href}`
}
</script>

<style></style>

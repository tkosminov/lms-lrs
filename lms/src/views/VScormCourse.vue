<template>
  <div class="row justify-content-md-center">
    <ul>
      <li>
        <router-link
          :to="{ name: 'VDashboard' }"
        >
          Главная
        </router-link>
      </li>
    </ul>
  </div>

  <div class="row justify-content-md-center" v-if="scorm_course">
    <div class="col-3">
      <ul>
        <li v-for="item of scorm_course.items" :key="item.identifier" @click="setSco(item)">
          <p>{{ item.title }} <b>{{ item.identifier === scorm_current_resource ? 'active' : '' }}</b></p>
          <ul v-if="item.items?.length">
            <li v-for="i of item.items" :key="i.identifier" @click="setSco(i)">
              <p>{{ i.title }} <b>{{ i.identifier === scorm_current_resource ? 'active' : '' }}</b></p>

              <ul v-if="i.items?.length">
                <li v-for="ii of i.items" :key="ii.identifier" @click="setSco(ii)">
                  <p>{{ ii.title }} <b>{{ ii.identifier === scorm_current_resource ? 'active' : '' }}</b></p>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="col-9" style="height: 900px;">
      <iframe style="height: 900px; width: 100%;" v-if="scorm_iframe" :src="scorm_iframe"></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, onBeforeMount, defineProps, watch, onBeforeUnmount, type WatchStopHandle } from "vue";
import axios from "axios";

import { API, API_1484_11 } from '@/scorm.helper-2';
import type { ICourse, IItem } from '@/types'

const props = defineProps({
  course_id: { type: String, required: true },
});

const api_endpoint = import.meta.env.VITE_APP_API;
const course_base_url: string = 'http://localhost:80'

const user_id = '6dd214fa-f833-407b-a465-bc991b1f8639'

const scorm_course: Ref<ICourse | null> = ref(null);
const scorm_current_resource: Ref<string | null > = ref(null);
const scorm_course_items: Ref<IItem[]> = ref([]);

const scorm_iframe: Ref<string | null> = ref(null)
const course_window: Ref<Window & { API?: API, API_1484_11?: API_1484_11 } | null> = ref(window)

const unwatchs: WatchStopHandle[] = []

onBeforeMount(async () => {
  scorm_course.value = await onLoadScormCourse()

  for (const i of scorm_course.value.items) {
    scorm_course_items.value.push(...recursiveParseItems(i))
  }
})

async function onLoadScormCourse() {
  const { data: res }: { data: ICourse } = await axios.get(`${api_endpoint}/scorm/courses/${props.course_id}`)

  return res;
}

function recursiveParseItems(item: IItem) {
  const items: IItem[] = [];

  if (item.href) {
    items.push(item)
  }

  if (item.items?.length) {
    for (const i of item.items) {
      items.push(...recursiveParseItems(i))
    }
  }

  return items;
}

async function setSco(item: IItem) {
  if (!item.href?.length) {
    return;
  }

  scorm_current_resource.value = item.identifier;

  const current_api = getCurrentApi()

  if (current_api && current_api.initialized) {
    if (current_api instanceof API) {
      current_api.LMSSetValue('cmi.core.exit', 'suspend');

      const lesson_status = current_api.LMSGetValue('cmi.core.lesson_status');
      if (lesson_status) {
        current_api.LMSSetValue('cmi.core.lesson_status', lesson_status);
      }

      const session_time = current_api.LMSGetValue('cmi.core.session_time');
      if (session_time) {
        current_api.LMSSetValue('cmi.core.session_time', session_time);
      }

      current_api.LMSFinish('');
    } else {
      current_api.SetValue('cmi.exit', 'suspend')

      const session_time = current_api.GetValue('cmi.session_time');
      if (session_time) {
        current_api.SetValue('cmi.session_time', session_time);
      }

      const completion_status = current_api.GetValue('cmi.completion_status');
      if (completion_status) {
        current_api.SetValue('cmi.completion_status', completion_status);
      }

      const success_status = current_api.GetValue('cmi.success_status');
      if (success_status) {
        current_api.SetValue('cmi.success_status', success_status);
      }

      current_api.Terminate('')
    }
  }

  course_window.value!.API = new API(
    '/scorm',
    {
      user_id, course_id: scorm_course.value!.id
    },
    {
      course_identifier: scorm_course.value!.identifier,
      resource_identifier: item.identifier,
    },
    scorm_course_items.value.map((i) => i.identifier),
  )

  course_window.value!.API_1484_11 = new API_1484_11(
    '/scorm',
    {
      user_id, course_id: scorm_course.value!.id
    },
    {
      course_identifier: scorm_course.value!.identifier,
      resource_identifier: item.identifier,
    },
    scorm_course_items.value.map((i) => i.identifier),
  )

  scorm_iframe.value = `${course_base_url}/uploads/${scorm_course.value!.hash_sum}/${item.href}`
}

function getCurrentApi() {
  if (course_window.value!.API?.initialized) {
    return course_window.value!.API;
  }

  if (course_window.value!.API_1484_11?.initialized) {
    return course_window.value!.API_1484_11;
  }

  return null;
}

onBeforeUnmount(() => {
  for (const unwatch of unwatchs) {
    unwatch()
  }
})
</script>

<style></style>

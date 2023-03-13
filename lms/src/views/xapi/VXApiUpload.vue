<template>
  <div class="row">
    <div class="col-sm-12 p-5">
      <CHr :title="'xapi upload'" :icon="''" />

      <div class="row justify-content-md-center">
        <div class="col-6">
          <form @submit="onUploadCourse" autocomplete="off" id="upload-course-form">
            <div class="mb-3">
              <label for="course-file" class="form-label"></label>
              <input
                type="file"
                ref="file_input"
                :state="Boolean(file)"
                @change="onChangeCourse"
                placeholder="choose file..."
                drop-placeholder="drop file..."
                accept="application/zip"
                class="form-control"
                id="course-file"
                aria-describedby="course-file-help"
                :disabled="disable_choise"
              />
              <div id="course-file-help" class="form-text">
                application/zip
              </div>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="disable_upload">
              upload
            </button>
          </form>

          <div class="alert alert-danger mt-3" role="alert" v-if="file && !course_type">
            The uploaded file is not a course
          </div>
        </div>

        <div class="col-6">
          <ul class="list-group" v-if="file">
            <li class="list-group-item">
              <b>File name:</b> {{ file.name }}
            </li>
            <li class="list-group-item">
              <b>File size:</b> {{ (file.size / 1000 / 1000).toFixed(3) }} Mb
            </li>
            <li class="list-group-item">
              <b>Course type</b>: {{ course_type }}
            </li>
            <li class="list-group-item">
              <b>Course manifest</b>: {{ course_manifest }}
            </li>
            <li class="list-group-item">
              <b>Course identifier</b>: {{ course_identifier }}
            </li>
            <li class="list-group-item">
              <b>Course title</b>: {{ course_title }}
            </li>
            <li class="list-group-item">
              <b>Course launch url</b>: {{ course_launch_url }}
            </li>
            <li class="list-group-item">
              <b>Course launch query</b>: <pre>{{ JSON.stringify(course_launch_query, null, 2) }}</pre>
            </li>
            <li class="list-group-item">
              <b>Course launch data</b>: <pre>{{ JSON.stringify(course_launch_data, null, 2) }}</pre>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, watch, onBeforeUnmount } from "vue";
import axios from "axios";
import { loadAsync as asyncUnzipCourse, type JSZipObject } from 'jszip';
import { type Element, xml2js } from 'xml-js'

import router from "@/router";
import CHr from "@/components/CHr.vue";

const file: Ref<File | null> = ref(null);
const file_input: Ref<HTMLInputElement | null> = ref(null);

const disable_choise: Ref<boolean> = ref(false);
const disable_upload: Ref<boolean> = ref(false);

const course_type: Ref<string | null> = ref(null);
const course_manifest: Ref<string | null> = ref(null);
const course_identifier: Ref<string | null | undefined> = ref(null);
const course_title: Ref<string | null | undefined> = ref(null);

const course_launch_url: Ref<string | null | undefined> = ref(null);
const course_launch_query: Ref<Record<string, unknown> | null | undefined> = ref(null);
const course_launch_data: Ref<Record<string, unknown> | null | undefined> = ref(null);

const user_id = import.meta.env.VITE_APP_USER_ID;
const api_endpoint = import.meta.env.VITE_APP_API;

function clearDebuggInfo() {
  course_type.value = null;
  course_manifest.value = null;
  course_identifier.value = null;
  course_title.value = null;
  course_launch_query.value = null;
  course_launch_data.value = null;
  course_launch_url.value = null;
}

function onChangeCourse() {
  if (file_input.value?.files) {
    file.value = file_input.value.files[0];
  } else {
    file.value = null;
  }
}

async function parseXApiCourse() {
  disable_upload.value = true;

  clearDebuggInfo()

  const unziped_course = await asyncUnzipCourse(file.value!)

  let manifest_file: JSZipObject;

  if (unziped_course.files['tincan.xml'] != null) {
    course_type.value = 'tincan';
    course_manifest.value = 'tincan.xml';
    manifest_file = unziped_course.files['tincan.xml'];
  } else if (unziped_course.files['cmi5.xml'] != null) {
    course_type.value = 'cmi5';
    course_manifest.value = 'cmi5.xml';
    manifest_file = unziped_course.files['cmi5.xml'];
  } else {
    return
  }

  const manifest_content = await manifest_file.async('string')
  const manifest = xml2js(manifest_content) as Element;


  if (course_type.value === 'cmi5') {
    const structure_element = manifest.elements!.find(e => e.name === 'courseStructure')
    const au_element = structure_element!.elements!.find(e => e.name === 'au')

    course_identifier.value = au_element!.attributes!['id'] as string;

    au_element!.elements!.forEach((el) => {
      if (el.name === 'title') {
        const langstring = el!.elements!.find(e => e.name === 'langstring')
        course_title.value = langstring!.elements![0].text as string;
      } else if (el.name === 'url') {
        course_launch_url.value = el!.elements![0].text as string;
      }
    })
  } else {
    const structure_element = manifest.elements!.find(e => e.name === 'tincan')
    const activities = structure_element!.elements!.find(e => e.name === 'activities')
    const activity = activities!.elements!.find(e => e.name === 'activity' && e.attributes!['type'] === 'http://adlnet.gov/expapi/activities/course')

    course_identifier.value = activity!.attributes!['id'] as string;

    console.log(activity)

    activity!.elements!.forEach((el) => {
      if (el.name === 'name') {
        course_title.value = el!.elements![0].text as string;
      } else if (el.name === 'launch') {
        course_launch_url.value = el!.elements![0].text as string;
      }
    })
  }

  const actor: Record<string, unknown> = {
    name: user_id,
    account: [{
      homePage: api_endpoint,
      name: user_id,
    }],
    objectType: 'Agent',
  }

  const launch_query: Record<string, unknown> = {
    actor,
    grouping: course_identifier.value,
    registration: user_id,
    endpoint: `${api_endpoint}/xapi`
  }

  if (course_type.value === 'cmi5') {
    launch_query.activityId = course_identifier.value;
    launch_query.fetch = `${api_endpoint}/xapi/auth?request_token=${'request_token'}` // cmi5 authorization
  } else {
    launch_query.activity_id = course_identifier.value;
    launch_query.auth = 'access_token'; // tincan authorization
  }

  course_launch_query.value = launch_query;

  course_launch_data.value = {
    id: course_identifier.value,
    title: course_title.value,
    actor,
    user_id,
    state: {
      state_id: 'LMS.LaunchData',
      json: {
        launchMode: 'Normal',
        contextTemplate: {
          extensions: {
            'https://w3id.org/xapi/cmi5/context/extensions/sessionid': user_id,
          },
          contextActivities: {
            grouping: [{
              id: course_identifier.value,
              objectType: 'Activity',
            }],
            parent: [{
              id: course_identifier.value,
              objectType: 'Activity',
            }],
          },
        },
      },
    }
  }

  disable_upload.value = false;
}

async function onUploadCourse(event: Event) {
  event.preventDefault();

  if (file.value != null) {
    disable_choise.value = true;
    disable_upload.value = true;

    const hash_sum = await upload(file.value);
    await create(hash_sum)

    disable_choise.value = false;
    disable_upload.value = false;
  }
}

async function upload(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data: res }: { data: { hash_sum: string }} = await axios.post(`${api_endpoint}/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } })

  return res.hash_sum;
}

async function create(hash_sum: string) {
  // const body = {
  //   hash_sum,
  //   identifier: course_identifier.value,
  //   title: course_title.value,
  //   items: course_items.value,
  // }

  // const { data: res }: { data: { course_id: string }} = await axios.post(`${api_endpoint}/scorm/create`, body, { headers: { "Content-Type": "application/json" } })

  // if (res.course_id) {
  //   router.push({ name: 'VScormPass', params: { course_id: res.course_id } })
  // }
}

const unwatch = watch(
  () => file.value,
  async (current_file) => {
    if (current_file) {
      await parseXApiCourse()
    }
  }
)

onBeforeUnmount(async () => {
  unwatch();
});
</script>

<style></style>

<template>
  <div class="row">
    <div class="col-sm-12 p-5">
      <CHr :title="'scorm upload'" :icon="''" />

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
              <b>Course sco count</b>: {{ course_items.length }}
            </li>
            <li class="list-group-item">
              <b>Course items</b>: <pre>{{ JSON.stringify(course_items, null, 2) }}</pre>
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
import { loadAsync as asyncUnzipCourse } from 'jszip';
import { type Element, xml2js } from 'xml-js'

import router from "@/router";
import type { IScormItem } from '@/types'
import CHr from "@/components/CHr.vue";

const api_endpoint = import.meta.env.VITE_APP_API;

const file: Ref<File | null> = ref(null);
const file_input: Ref<HTMLInputElement | null> = ref(null);

const disable_choise: Ref<boolean> = ref(false);
const disable_upload: Ref<boolean> = ref(false);

const course_type: Ref<string | null> = ref(null);
const course_manifest: Ref<string | null> = ref(null);
const course_identifier: Ref<string | null | undefined> = ref(null);
const course_title: Ref<string | null | undefined> = ref(null);
const course_items: Ref<IScormItem[]> = ref([]);

function clearDebuggInfo() {
  course_type.value = null;
  course_manifest.value = null;
  course_identifier.value = null;
  course_title.value = null;
  course_items.value = [];
}

function onChangeCourse() {
  if (file_input.value?.files) {
    file.value = file_input.value.files[0];
  } else {
    file.value = null;
  }
}

async function parseScormCourse() {
  disable_upload.value = true;

  clearDebuggInfo()

  const unziped_course = await asyncUnzipCourse(file.value!)
  const manifest_file = unziped_course.files['imsmanifest.xml'];

  if (manifest_file == null) {
    return;
  }

  course_type.value = 'scorm';
  course_manifest.value = 'imsmanifest.xml';

  const manifest_content = await manifest_file.async('string')
  const manifest = xml2js(manifest_content) as Element;
  const manifest_element = manifest.elements!.find(e => e.name === 'manifest')
  const organizations_elements = manifest_element!.elements!.find(e => e.name === 'organizations')

  const organization_default_identifier = organizations_elements!.attributes!.default;
  const organization_element = organizations_elements!.elements!.find(e => e.attributes?.identifier === organization_default_identifier)

  course_identifier.value = `${organization_element!.attributes!.identifier}`;

  const organization_title = organization_element!.elements!.find(e => e.name === 'title')
  course_title.value = `${organization_title!.elements!.find(e => e.type === 'text')!.text}`

  const resources_elements = manifest_element!.elements!.find(e => e.name === 'resources')

  organization_element!.elements!.forEach((el) => {
    if (el.name === 'item') {
      recursiveParseScormItems(el, resources_elements!);
    }
  })

  disable_upload.value = false;
}

function recursiveParseScormItems(item: Element, resources_elements: Element) {
  const resource_identifier = item.attributes!.identifierref

  if (resource_identifier) {
    const item_title = item.elements!.find(e => e.name === 'title')

    const sequencing = item!.elements!.find(e => e.name === 'imsss:sequencing')
    const objectives = sequencing?.elements?.find(e => e.name === 'imsss:objectives')
    const objective = objectives?.elements?.filter((e) => e.name === 'imsss:objective')
    const objective_ids = objective?.map((e) => `${e.attributes!.objectiveID}`) || []

    const resource = resources_elements.elements!.find(e => e.name === 'resource' && e.attributes!.identifier === resource_identifier)

    let href = `${resource!.attributes!.href}`

    if (item.attributes!.parameters) {
      href += item.attributes!.parameters
    }

    const parsed_item: Partial<IScormItem> = {
      identifier: item.attributes!.identifier! as string,
      title: `${item_title!.elements!.find(e => e.type === 'text')!.text}`,
      type: `${resource!.attributes!.type}`,
      href,
      objective_ids,
    }

    course_items.value.push(parsed_item as IScormItem)
  }

  item.elements!.forEach((el) => {
    if (el.name === 'item') {
      recursiveParseScormItems(el, resources_elements!);
    }
  })
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
  const body = {
    hash_sum,
    identifier: course_identifier.value,
    title: course_title.value,
    items: course_items.value,
  }

  const { data: res }: { data: { course_id: string }} = await axios.post(`${api_endpoint}/scorm/create`, body, { headers: { "Content-Type": "application/json" } })

  if (res.course_id) {
    router.push({ name: 'VScormPass', params: { course_id: res.course_id } })
  }
}

const unwatch = watch(
  () => file.value,
  async (current_file) => {
    if (current_file) {
      await parseScormCourse()
    }
  }
)

onBeforeUnmount(async () => {
  unwatch();
});
</script>

<style></style>

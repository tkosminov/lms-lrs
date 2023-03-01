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
            placeholder="Выберите или перенесите файл..."
            drop-placeholder="Перенесите файл..."
            accept="application/zip"
            class="form-control"
            id="course-file"
            aria-describedby="course-file-help"
            :disabled="disable_upload"
          />
          <div id="course-file-help" class="form-text">
            application/zip
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="disable_upload">
          Загрузить
        </button>
      </form>
    </div>
    <div class="col-6">
      <div class="mb-3" v-if="file">
        Название файла: <b>{{ file.name }}</b> <br />
        Размер файла: <b>{{ (file.size / 1000 / 1000).toFixed(1) }} Мб</b> <br />
        type: <b>{{ course_type }}</b> <br />
        manifest: <b>{{ course_manifest }}</b> <br />
        identifier: <b>{{ course_identifier }}</b> <br />
        title: <b>{{ course_title }}</b> <br />
        sco_count: <b>{{ sco_count }}</b> <br />
        items: <pre>{{ JSON.stringify(course_items, null, 2) }}</pre> <br />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, watch, onBeforeUnmount } from "vue";
import { type JSZipObject, loadAsync as asyncUnzipCourse } from 'jszip';
import { type Element, xml2js } from 'xml-js'
import axios from "axios";
import type { IItem } from '@/types'

const api_endpoint = import.meta.env.VITE_APP_API;

const file: Ref<File | null> = ref(null);
const file_input: Ref<HTMLInputElement | null> = ref(null);

const course_type: Ref<string | null> = ref(null);
const course_manifest: Ref<string | null> = ref(null);
const course_identifier: Ref<string | null | undefined> = ref(null);
const course_title: Ref<string | null | undefined> = ref(null);
const sco_count: Ref<number> = ref(0);
const course_items: Ref<IItem[]> = ref([]);

const disable_upload: Ref<boolean> = ref(false);

async function onUploadCourse(event: Event) {
  event.preventDefault();

  if (file.value) {
    const hash_sum = await upload(file.value);

    if (course_type.value === 'scorm') {
      await createScorm(hash_sum)
    }
  }
}

async function upload(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data: res }: { data: { hash_sum: string }} = await axios.post(`${api_endpoint}/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } })

  return res.hash_sum;
}

async function createScorm(hash_sum: string) {
  const body = {
    hash_sum,
    identifier: course_identifier.value,
    title: course_title.value,
    items: course_items.value,
  }

  const { data: res }: { data: { hash_sum: string }} = await axios.post(`${api_endpoint}/scorm/create`, body, { headers: { "Content-Type": "application/json" } })
}

async function onChangeCourse() {
  if (file_input.value?.files) {
    file.value = file_input.value.files[0];
  } else {
    file.value = null;
  }
}

async function parseCourseFile() {
  disable_upload.value = true

  course_type.value = null;
  course_manifest.value = null;
  course_identifier.value = null;
  course_title.value = null;
  sco_count.value = 0;
  course_items.value = [];

  const unziped_course = await unzipCourse();

  const files_list = Object.keys(unziped_course.files);

  if (files_list.findIndex((f) => f === 'tincan.xml') !== -1) {
    course_type.value = 'tincan'
    course_manifest.value = 'tincan.xml'

    await parseXApiManifest(unziped_course.files[course_manifest.value])
  } else if (files_list.findIndex((f) => f === 'cmi5.xml') !== -1) {
    course_type.value = 'cmi5'
    course_manifest.value = 'cmi5.xml'

    await parseXApiManifest(unziped_course.files[course_manifest.value])
  } else if (files_list.findIndex((f) => f === 'imsmanifest.xml') !== -1) {
    course_type.value = 'scorm'
    course_manifest.value = 'imsmanifest.xml'

    await parseScormManifest(unziped_course.files[course_manifest.value])
  }

  disable_upload.value = false
}

async function unzipCourse() {
  return await asyncUnzipCourse(file.value!)
}

async function parseScormManifest(manifest_file: JSZipObject) {
  const manifest_content = await manifest_file.async('string')

  const manifest = xml2js(manifest_content) as Element;

  const manifest_element = manifest.elements?.find(e => e.name === 'manifest')

  if (manifest_element) {
    const organizations_elements = manifest_element.elements?.find(e => e.name === 'organizations')

    if (organizations_elements) {
      const default_identifier = organizations_elements.attributes?.default;
      let organization: Element | undefined;

      if (organizations_elements.elements?.length) {
        if (organizations_elements.elements.length === 1) {
          organization = organizations_elements.elements[0];
        } else {
          organization = organizations_elements.elements.find(e => e.attributes?.identifier === default_identifier)
        }
      }

      if (organization) {
        course_identifier.value = `${organization.attributes?.identifier}`;

        const organization_title = organization.elements?.find(e => e.name === 'title')

        if (organization_title) {
          course_title.value = `${organization_title.elements?.find(e => e.type === 'text')?.text}`
        }

        const resources_elements = manifest_element.elements?.find(e => e.name === 'resources')

        course_items.value = organization.elements?.filter(e => e.name === 'item')?.map(i => recursiveParseScrotmItems(i, resources_elements!)) || []
      }
    }
  }
}

function recursiveParseScrotmItems(item: Element, resources_elements: Element) {
  const item_title = item.elements?.find(e => e.name === 'title')

  const parsed_item: IItem = {
    identifier: item.attributes!.identifier! as string,
    identifierref: item.attributes!.identifierref as string,
    title: `${item_title?.elements?.find(e => e.type === 'text')?.text}`,
  }

  const sequencing = item?.elements?.find(e => e.name === 'imsss:sequencing')
  const objectives = sequencing?.elements?.find(e => e.name === 'imsss:objectives')
  const objective = objectives?.elements?.filter((e) => e.name === 'imsss:objective')

  if (objective?.length) {
    parsed_item.objective_ids = objective.map((e) => `${e.attributes?.objectiveID}`)
  }

  if (resources_elements && parsed_item.identifierref) {
    const resource = resources_elements.elements?.find(e => e.name === 'resource' && e.attributes?.identifier === parsed_item.identifierref)

    if (resource) {
      sco_count.value += 1;

      parsed_item.type = `${resource.attributes?.type}`;
      parsed_item.href = `${resource.attributes?.href}`;

      if (item.attributes?.parameters) {
        parsed_item.href += item.attributes?.parameters
      }
    }
  }

  const items = item.elements?.filter(e => e.name === 'item')

  if (items?.length) {
    parsed_item.items = items.map((i) => recursiveParseScrotmItems(i, resources_elements)) || [];
  }

  return parsed_item
}

async function parseXApiManifest(manifest_file: JSZipObject) {
  const manifest_content = await manifest_file.async('string')
}

const unwatch = watch(
  () => file.value,
  async (current_file) => {
    if (current_file) {
      await parseCourseFile()
    }
  }
)

onBeforeUnmount(async () => {
  unwatch();
});
</script>

<style></style>

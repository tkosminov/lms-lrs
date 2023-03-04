<template>
  <CNavigation />

  <div class="container-fluid">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import CNavigation from "@/components/CNavigation.vue";
</script>

<style scoped></style>

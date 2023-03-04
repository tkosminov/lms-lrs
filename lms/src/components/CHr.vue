<template>
  <div class="row justify-content-md-center mb-2">
    <div class="headline mt-2">
      <div class="headline-left" :class="[props.color]"></div>
      <div class="headline-center" :class="[props.color]">
        <template v-if="props.to">
          <router-link :to="{ name: props.to }" class="headline-center-title">
            {{ props.title }}
          </router-link>
        </template>
        <template v-else>
          <span class="headline-center-title">{{ props.title }}</span>
        </template>
      </div>
      <div class="headline-right" :class="[props.color]" @click="clickButton">
        <i class="bi" :class="props.icon"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  icon: { type: String, required: false, default: "bi-caret-right-fill" },
  color: { type: String, required: false, default: "dark" },
  title: { type: String, required: true },
  to: { type: String, required: false, default: null },
});

const emit = defineEmits(["click-button"]);

function clickButton() {
  emit("click-button");
}
</script>

<style lang="scss">
.headline {
  height: 30px;
  padding: 0;

  &-left,
  &-center,
  &-right {
    display: inline-block;
    height: 100%;

    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    font-weight: 600;
    font-size: 20px;
  }

  &-left {
    width: 5px;
  }

  &-center {
    width: calc(100% - 35px);
    text-align: left;
    padding-left: 10px;
    text-transform: uppercase;

    &-title {
      cursor: pointer;
      color: inherit;

      &:active,
      &:visited,
      &:focus {
        color: inherit;
      }
    }
  }

  &-right {
    width: 30px;
    text-align: center;
    cursor: pointer;
  }

  &-left {
    &.dark {
      background-color: rgba(52, 58, 64, 1);
    }

    &.red {
      background-color: rgba(220, 53, 69, 1);
    }

    &.green {
      background-color: rgba(40, 167, 69, 1);
    }

    &.blue {
      background-color: rgba(0, 123, 255, 1);
    }

    &.yellow {
      background-color: rgba(255, 193, 7, 1);
    }

    &.orange {
      background-color: rgba(253, 126, 20, 1);
    }

    &.pink {
      background-color: rgba(232, 62, 140, 1);
    }

    &.indigo {
      background-color: rgba(102, 16, 242, 1);
    }
  }

  &-center {
    &.dark {
      background-color: rgba(52, 58, 64, 0.25);
      color: rgba(52, 58, 64, 0.75);
    }

    &.red {
      background-color: rgba(220, 53, 69, 0.25);
      color: rgba(220, 53, 69, 0.75);
    }

    &.green {
      background-color: rgba(40, 167, 69, 0.25);
      color: rgba(40, 167, 69, 0.75);
    }

    &.blue {
      background-color: rgba(0, 123, 255, 0.25);
      color: rgba(0, 123, 255, 0.75);
    }

    &.yellow {
      background-color: rgba(255, 193, 7, 0.25);
      color: rgba(255, 193, 7, 0.75);
    }

    &.orange {
      background-color: rgba(253, 126, 20, 0.25);
      color: rgba(253, 126, 20, 0.75);
    }

    &.pink {
      background-color: rgba(232, 62, 140, 0.25);
      color: rgba(232, 62, 140, 0.75);
    }

    &.indigo {
      background-color: rgba(102, 16, 242, 0.25);
      color: rgba(102, 16, 242, 0.75);
    }
  }

  &-right {
    &.dark {
      background-color: rgba(52, 58, 64, 0.25);
      color: rgba(52, 58, 64, 1);
    }

    &.red {
      background-color: rgba(220, 53, 69, 0.25);
      color: rgba(220, 53, 69, 1);
    }

    &.green {
      background-color: rgba(40, 167, 69, 0.25);
      color: rgba(40, 167, 69, 1);
    }

    &.blue {
      background-color: rgba(0, 123, 255, 0.25);
      color: rgba(0, 123, 255, 1);
    }

    &.yellow {
      background-color: rgba(255, 193, 7, 0.25);
      color: rgba(255, 193, 7, 1);
    }

    &.orange {
      background-color: rgba(253, 126, 20, 0.25);
      color: rgba(253, 126, 20, 1);
    }

    &.pink {
      background-color: rgba(232, 62, 140, 0.25);
      color: rgba(232, 62, 140, 1);
    }

    &.indigo {
      background-color: rgba(102, 16, 242, 0.25);
      color: rgba(102, 16, 242, 1);
    }
  }
}
</style>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{ msg: string }>();

const count = ref(0);
</script>

<template>
  <h1>short the web with nostr</h1>
  <form class="mt-5">
    <div class="mb-3">
        <div class="row g-2">
            <div class="col-10">
                <input class="form-control form-control-lg" type="text" placeholder="Shorten your link" aria-label="Shorten your link">
            </div>
            <div class="col-2">
                <button type="button" class="btn btn-primary btn-lg">Shorten</button>
            </div>
        </div>
    </div>
  </form>

</template>

<style scoped>

</style>

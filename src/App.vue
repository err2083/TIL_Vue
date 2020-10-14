<template>
  <div id="app">
    <Navigate></Navigate>
    <router-view></router-view>
  </div>
</template>

<script>
import Navigate from '@/components/Navigate.vue';
export default {
  name: 'App',
  components: {
    Navigate,
  }
}
</script>

<style lang="scss">
@import '@/assets/scss/style.scss';

</style>

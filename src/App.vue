<template>
  <div id="app">
    <a href="#" class="js-colorlib-nav-toggle colorlib-nav-toggle"><i></i></a>
    <SideVar></SideVar>
    <router-view></router-view>
  </div>
</template>

<script>
import SideVar from '@/components/SideBar.vue';

export default {
  name: 'App',
  components: {
    SideVar,
  }
}
</script>

<style lang="scss">
@import '@/assets/scss/style.scss';

</style>

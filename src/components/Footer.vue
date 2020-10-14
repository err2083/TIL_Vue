<template>
  <div class="colorlib-footer">
    <h1 id="colorlib-logo" class="mb-5">
      <router-link to="/" style="background-image: url(../assets/강슬기/강슬기2.jpg);">Andrea <span>Moore</span></router-link>
    </h1>
    <p class="pfooter">
      Copyright &copy;
      {{fullYear}}
      All rights reserved | This template is made with
      <i class="icon-heart" aria-hidden="true"></i> by
      <a href="https://colorlib.com" target="_blank">Colorlib</a>
    </p>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    fullYear() {
      return new Date().getFullYear();
    },
  }
};
</script>

<style>
.test {
  background-image: url("/assets/강슬기/강슬기2.jpg");
}
</style>


// <img :src="require(`@/assets/강슬기/강슬기3.jpg`)" />
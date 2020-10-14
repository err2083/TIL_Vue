<template>
  <div>
    <a href="#" class="js-colorlib-nav-toggle colorlib-nav-toggle"><i></i></a>
    <aside id="colorlib-aside" role="complementary" class="js-fullheight">
      <nav id="colorlib-main-menu" role="navigation">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/fashion">Fashion</router-link></li>
          <li><router-link to="/travel">Travel</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
          <li><router-link to="/index">index</router-link></li>
        </ul>
      </nav>
      <Footer></Footer>
    </aside>
  </div>
</template>

<script>
import Footer from "@/components/Footer.vue";

export default {
    components: {
        Footer,
    },
};
</script>

<style lang="scss">
</style>
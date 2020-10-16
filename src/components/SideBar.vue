<template>
  <aside id="colorlib-aside" role="complementary">
      <Navi></Navi>
      <Footer></Footer>
  </aside>
</template>

<script>
import Navi from '@/components/Navi.vue';
import Footer from '@/components/Footer.vue';

export default {
    name: 'SideBar',
    components: {
        Navi,
        Footer,
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    },
    methods: {
        handleResize() {
            this.$el.style.height = window.innerHeight + 'px';
        }
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    }
}
</script>

<style>

</style>
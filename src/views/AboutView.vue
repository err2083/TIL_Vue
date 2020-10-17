<template>
  <div id="colorlib-main">
    <section
      class="ftco-about img ftco-section ftco-no-pt ftco-no-pb"
      id="about-section"
    >
      <div class="container-fluid px-0">
        <div class="row d-flex">
          <div class="col-md-6 d-flex">
            <div
              class="img d-flex align-self-stretch align-items-center about-background-image"
              v-bind:style="styleObj"
            ></div>
          </div>
          <div class="col-md-6 d-flex align-items-center">
            <div class="text px-4 pt-5 pt-md-0 px-md-4 pr-md-5">
              <h2 class="mb-4">
                레드벨벳 <span>강슬기</span> 를 좋아하는 개발자 입니다.
              </h2>
              <p>
                여기에는 멀 적으면 좋을까..
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },
  methods: {
    handleResize() {
      this.styleObj.height = window.innerHeight + 'px';
    },
  },
  data() {
    return {
      styleObj: {
        height: 0,
      },
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<style lang='scss'>
.about-background-image {
  background-image: url("../assets/강슬기/강슬기85.jpg");
}
</style>
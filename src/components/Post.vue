<template>
  <router-link v-bind:to="`/post/${fileName}`">
    <div class="blog-entry d-md-flex">
      <a
        href="#"
        class="img img-2"
        :style="{ backgroundImage: 'url(' + imgUrl + ')' }"
      ></a>
      <div class="text text-2 pl-md-4">
        <h3 class="mb-2">
          {{ title }}
        </h3>
        <div class="meta-wrap">
          <p class="meta">
            <span><i class="icon-calendar mr-2"></i>...</span>
            <span
              ><a href="#"
                ><i class="icon-folder-o mr-2"></i>{{ category }}</a
              ></span
            >
            <span><i class="icon-comment2 mr-2"></i>...</span>
          </p>
        </div>
        <p class="mb-4">...</p>
        <p>
          <a href="#" class="btn-custom"
            >Read More <span class="ion-ios-arrow-forward"></span
          ></a>
        </p>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: "Post",
  props: ["mdFile"],
  data() {
    return {
      imgUrl: "",
      category: "",
      title: "",
    };
  },
  mounted() {
    this.setImageUrl();
    this.setFileInfo();
  },
  methods: {
    getRandom(max, min) {
      return Math.floor(Math.random() * (max - min)) + min;
    },
    getFileExtend(number) {
      if (number >= 64 && number <= 67) {
        return "png";
      }
      return "jpg";
    },
    setImageUrl() {
      const random = this.getRandom(3, 88);
      const extend = this.getFileExtend(random);
      this.imgUrl = require(`@/assets/강슬기/강슬기${random}.${extend}`);
    },
    setFileInfo() {
      const strSplit = this.mdFile.split("/");
      this.category = strSplit[1];
      this.title = strSplit[2].split(".")[0];
    },
  },
  computed: {
    fileName() {
      return this.category + "-" + this.title;
    },
  },
};
</script>

<style>
</style>
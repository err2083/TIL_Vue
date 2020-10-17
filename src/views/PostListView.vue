<template>
  <div id="colorlib-main">
    <section class="ftco-section">
      <div class="container">
        <div class="row px-md-4">
          <div
            class="col-md-12"
            v-for="(mdFile, index) in mdFileList"
            :key="index"
          >
            <Post :mdFile="mdFile"></Post>
          </div>
        </div>
      </div>
    </section>
  </div>
  <!-- END COLORLIB-MAIN -->
</template>

<script>
import Post from "@/components/Post.vue";

export default {
  name: "PostListView",
  data() {
    return {
      mdFileList: [],
    };
  },
  components: {
    Post,
  },
  mounted() {
    this.setMdFileList();
  },
  methods: {
    setMdFileList() {
      const illustrations = require.context(
        "@/assets/documents",
        true,
        /^.*\.md$/
      );
      this.mdFileList = illustrations.keys();
    },
  },
};
</script>

<style>
</style>
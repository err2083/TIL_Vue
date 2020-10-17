<template>
  <div id="colorlib-main">
    <section class="ftco-section ftco-no-pt ftco-no-pb">
      <div class="container">
        <div class="row d-flex">
          <div class="col-lg-8 px-md-5 py-5">
            <div class="row pt-md-4">
              <VueShowdown :markdown="fileContent" class="markdown-body" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "PostDetailView",
  data() {
    return {
      fileContent: "",
    };
  },
  mounted() {
    this.compiledMarkdown();
  },
  methods: {
    compiledMarkdown() {
      const strSplit = this.$route.params.path.split("-");
      const filePath = require(`@/assets/documents/${strSplit[0]}/${strSplit[1]}.md`);

      this.$http.get(filePath).then(
        (response) => {
          this.fileContent = response.body;
        },
        () => {
          this.fileContent = "An error ocurred";
        }
      );
    },
  },
};
</script>

<style src="github-markdown-css">

.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
</style>
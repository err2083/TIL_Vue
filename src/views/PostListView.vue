<template>
  <div id="colorlib-main">
    <section class="ftco-section">
      <div class="container">
        <div class="row px-md-4">
            <Post></Post>
        </div>
        <div class="row">
          <div class="col text-center text-md-left">
            <div class="block-27">
              <ul>
                <li><a href="#">&lt;</a></li>
                <li class="active"><span>1</span></li>
                <li><a href="#">2</a></li>
                <li><a href="#">3</a></li>
                <li><a href="#">4</a></li>
                <li><a href="#">5</a></li>
                <li><a href="#">&gt;</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <!-- END COLORLIB-MAIN -->
</template>

<script>
import Post from '@/components/Post.vue';

export default {
    components: {
        Post,
    }
};
</script>

<style>
</style>
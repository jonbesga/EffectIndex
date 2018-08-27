<template>
  <div class="featuredArticles">
    <div class="featuredArticleListContainer">

      <div class="featuredArticleCategory">
        <h4> Visual Effects </h4>
        <nuxt-link 
          v-for="(effect, index) in visualEffects"
          :to="`/effects/${effect.url}`"
          :key="effect._id">
          {{ effect.name }}{{ (index &lt; (visualEffects.length - 1)) ? ' &sdot; ' : '' }}
        </nuxt-link>
      </div>

      <div class="featuredArticleCategory">
        <h4> Cognitive Effects </h4>
        <nuxt-link 
          v-for="(effect, index) in cognitiveEffects"
          :to="`/effects/${effect.url}`"
          :key="effect._id">
          {{ effect.name }}{{ (index &lt; (cognitiveEffects.length - 1)) ? ' &sdot; ' : '' }}
        </nuxt-link>
      </div>

      <div class="featuredArticleCategory">
        <h4> Miscellaneous Effects </h4>
        <nuxt-link 
          v-for="(effect, index) in miscellaneousEffects"
          :to="`/effects/${effect.url}`"
          :key="effect._id">
          {{ effect.name }}{{ (index &lt; (miscellaneousEffects.length - 1)) ? ' &sdot; ' : '' }}
        </nuxt-link>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  computed: {
    effects() { return this.$store.state.effects; },

    featuredEffects() {
      return this.effects.filter((effect) => effect.featured);
    },

    visualEffects() {
      return this.featuredEffects.filter((effect) => effect.tags.includes('visual'));
    },

    cognitiveEffects() {
      return this.featuredEffects.filter((effect) => effect.tags.includes('cognitive'));
    },

    miscellaneousEffects() {
      return this.featuredEffects.filter((effect) => effect.tags.includes('miscellaneous'));
    }



  }
};
</script>

<style scoped>

  .featuredArticleListContainer {
    font-size: 12pt;
  }

  .featuredArticleCategory {
    border-bottom: 1px solid #DDD;
    margin: 0;
    padding: 12px;
  }

  .featuredArticles h4 {
    font-family: 'Titillium Web';
    text-transform: none;
    font-size: 13pt;
    letter-spacing: 1px;
    line-height: 1em;
    text-transform: uppercase;
    margin-bottom: 0.25em;
    margin-top: 0;
  }

  .featuredArticles {
    flex: 1;
  }
</style>
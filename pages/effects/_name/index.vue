<template>
  <div class="pageContent">
    <article v-show="effect.name">
      <Icon
        :filename="icon"
        class="categoryIcon"
      />
      <div v-show="hasSection('description_raw')">
        <h1> 
          {{ effect.name }}       
          <client-only>
            <nuxt-link
              v-if="$auth.loggedIn"
              :to="'/admin/effects/' + effect.url"
              append
            >
              <Icon
                filename="edit.svg"
                style="display: inline-block; margin-left: 10px; height: 20px; width: 20px;"
                color="#27635d"
              />
            </nuxt-link>
          </client-only>
        </h1>
        <formatted-document :document="effect.description_formatted" />
      </div>

      <div
        v-if="hasSection('replications')"
        class="effect__gallery"
      >
        <hr>
        <h3>Replication Gallery</h3>
        <light-box
          :image-set="effect.replications"
          :order="effect.gallery_order"
          base="/img/gallery/"
        />
      </div>

      <div
        v-if="hasSection('audio_replications')"
      >
        <hr>
        <h3 style="margin-bottom: 2em;">
          Audio Replications
        </h3>
        <audio-player
          v-for="(replication, index) in effect.audio_replications"
          :key="index"
          :src="`/audio/${replication.resource}`"
          :title="replication.title"
          :artist="replication.artist"
        />
      </div>

      <div v-if="hasSection('analysis_raw')">
        <hr>
        <h3>Analysis</h3>
        <formatted-document :document="effect.analysis_formatted" />
      </div>

      <div 
        v-if="hasSection('style_variations_raw')"
      >
        <hr>
        <h3 id="variations">
          Style Variations
        </h3>
        <formatted-document :document="effect.style_variations_formatted" />
      </div>

      <div v-if="hasSection('personal_commentary_raw')">
        <hr>
        <h3>Personal Commentary</h3>
        <formatted-document :document="effect.personal_commentary_formatted" />
      </div>

      <div v-if="hasSection('see_also') || hasSection('external_links')">
        <hr>
        <div v-if="hasSection('see_also')">
          <h3> See Also </h3>
          <ul>
            <li
              v-for="(link, index) in effect.see_also"
              :key="index"
            >
              <nuxt-link
                :to="link.location"
              >
                {{ link.title }}
              </nuxt-link>
            </li>
          </ul>
        </div>

        <div v-if="hasSection('external_links')">
          <h3> External Links </h3>
          <ul>
            <li
              v-for="(link, index) in effect.external_links"
              :key="index"
            >
              <ext-link :href="link.url">
                {{ link.title }}
              </ext-link>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="hasSection('citations')">
        <hr>
        <h3> References </h3>
        <citation-list :citations="effect.citations" />
      </div>

      <div v-if="hasSection('tags')">
        <hr>
        <h3> Tags </h3>
        <tag
          v-for="tag in effect.tags"
          :key="tag"
          :value="tag"
        />
      </div>

      <div v-if="hasSection('contributors')">
        <hr>
        <h3> Contributors </h3>
        <p> The following people contributed to the content of this article: </p>
        <span
          v-for="contributor in effect.contributors"
          :key="contributor"
          class="contributor"
        >
          <nuxt-link :to="'/profiles/' + contributor">{{ contributor }}</nuxt-link>
        </span>
      </div>
    </article>
    <div v-if="!effect.name">
      <h1> Effect Not Found </h1>
    </div>
  </div>
</template>

<script>
import FormattedDocument from "@/components/effects/FormattedDocument";
import CitationList from "@/components/effects/CitationList";
import LightBox from "@/components/gallery/LightBox";
import ExtLink from "@/components/ExtLink";
import Tag from "@/components/effects/Tag";
import AudioPlayer from "@/components/replications/audio/AudioPlayer";
import Icon from '@/components/Icon';

export default {
  name: 'Effect',
  components: {
    FormattedDocument,
    CitationList,
    LightBox,
    ExtLink,
    Tag,
    AudioPlayer,
    Icon
  },
  computed: {
    icon() {
      let tags = this.effect["tags"];

      let icons = {
        cognitive: "user",
        visual: "eye",
        auditory: "volume-up",
        tactile: "hand-paper",
        disconnective: "chain",
        multisensory: "cogs",
        uncomfortable: "frown",
        physical: "heart-rate",
        gustatory: "utensils",
        olfactory: "utensils",
      };

      if (Array.isArray(tags)) {
        for (let tag in icons) {
          if (tags.indexOf(tag) > -1) return icons[tag] + '.svg';
        }
      }

      return "user.svg";
    }
  },
  scrollToTop: true,
  async asyncData({ store, params, error }) {
    let { effect } = await store.dispatch("getEffect", params.name);
    if (!effect) error({ statusCode: 404, message: "Effect not found." });
    return { effect };
  },
  mounted() {
    let s = this.$route.query.s;
    if (s) {
      setTimeout(() => this.$scrollTo('#' + s), 750);
    }
  },
  methods: {
    hasSection(name) {
      if (name in this.effect) {
        if (Array.isArray(this.effect[name])) {
          if (this.effect[name].length > 0) return true;
        } else if (typeof this.effect[name] === "string") {
          if (this.effect[name].length > 0) return true;
        }
      }
      return false;
    }
  },
  head() {
    return {
      title: this.effect.name,
      meta: [
        { name: 'description', hid: 'description', content: this.effect.summary_raw },
        { name: 'og:title', hid: 'og:title', content: `Effect Index - ${this.effect.name}` },
        { name: 'og:description', hid: 'og:description', content: this.effect.summary_raw },
        { name: 'og:image', hid: 'og:image', content: this.effect.social_media_image },
        { name: 'twitter:title', hid: 'twitter:title', content: `Effect Index - ${this.effect.name}` },
        { name: 'twitter:description', hid: 'twitter:description', content: this.effect.summary_raw },
        { name: 'twitter:image', hid: 'twitter:image', content: this.effect.social_media_image },
      ]
    };
  }
};
</script>

<style>
.tagList {
  list-style: none;
}

hr {
  clear: both;
}

.contributor::after {
  content: ", ";
}

.contributor:last-of-type::after {
  content: "";
}
</style>
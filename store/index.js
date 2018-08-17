import Vuex from "vuex";
import navigation from "./navigation.json";
import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";

const createStore = () => {
  return new Vuex.Store({
    state: {
      navbar_pullout: false,
      modal: {
        active: false,
        type: "",
        resource: ""
      },
      replications: [],
      effects: [],
      navigation,
      gallery: {
        selected_effect_id: "",
        replications: [],
        replicated_effects: []
      },
      blogPosts: [],
      profiles: [],
      reports: [],
      admin: {
        userlist: [],
        invitations: []
      }
    },
    mutations,
    actions,
    getters
  });
};

export default createStore;

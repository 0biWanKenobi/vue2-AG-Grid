import pathify, { make } from 'vuex-pathify'
import Vue from 'vue'
import Vuex from 'vuex'

import table from './table'

Vue.use(Vuex)

const state = {
  foo: 'fie',
}

export default new Vuex.Store({
  plugins: [pathify.plugin],
  state,
  mutations: make.mutations(state),
  actions: {},
  modules: {
    table,
  },
})

import { make } from 'vuex-pathify'
import store from './index'

const state = {
  shouldPrettyPrint: false,
  columnDefs: [
    { headerName: 'Make', field: 'make', sortable: true },
    {
      headerName: 'Model',
      children: [{ field: 'name' }, { field: 'spec' }],
    },
    { headerName: 'Price', field: 'price' },
  ],
}

export default {
  namespaced: true,
  state,
  mutations: {
    ...make.mutations(state),
    DELETE_COLUMN(state, colId) {
      const deletedIndex = state.columnDefs.findIndex((c) => c.field == colId)
      state.columnDefs.splice(deletedIndex, 1)
    },
    DELETE_GROUP(state, groupId){
      const deletedIndex = state.columnDefs.findIndex((c) => c.groupId == groupId)
      state.columnDefs.splice(deletedIndex, 1)
    },
    DELETE_CHILD_COLUMN(_, { parent, colId }) {
      const parentDef = parent.getColGroupDef()
      const children = parentDef.children
      const deletedIndex = children.findIndex((c) => c.field == colId)
      children.splice(deletedIndex, 1)
      state.columnDefs = store.copy('table/columnDefs')
      // TO DO: find a way to handle the case when we delete the last children,
      // for example by allowing to delete the parent directly and disallowing to delete
      // the last children
    },
  },
  actions: {
    ...make.actions(state),
    deleteChildColumn() {},
  },
}

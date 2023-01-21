import { make } from 'vuex-pathify'
import store from './index'

import { mapHeaderSet } from '../components/colDefMapper'

const state = {
  shouldPrettyPrint: false,
  gridApi: null,
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
    SET_GRID_API(state, api) {
      state.gridApi = api
    },
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
    RENAME_COLUMN(state, {newName, colId}) {
      const col = state.gridApi.getColumnDef(colId)
      col.headerName = newName;
      // sync defs in gridApi and in component, prevent issues
      // when deleting renamed headers
      state.columnDefs = mapHeaderSet(state.gridApi.getColumnDefs())
    }
  },
  actions: {
    ...make.actions(state),
    deleteChildColumn() {},
  },
}

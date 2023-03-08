import { make } from 'vuex-pathify'
import store from './index'

import { mapHeaderSet, mapFullColGroupDefToLean } from '../components/colDefMapper'

const state = {
  shouldPrettyPrint: false,
  gridApi: null,
  colApi: null,
  columnDefs: [],
}

export default {
  namespaced: true,
  state,
  mutations: {
    ...make.mutations(state),
    SET_APIS(state, { gridApi, colApi }) {
      state.gridApi = gridApi
      state.colApi = colApi
    },
    SET_COLUMNS(state, { columns }) {
      state.columnDefs = columns
    },
    DELETE_COLUMN(state, colId) {
      const deletedIndex = state.columnDefs.findIndex((c) => c.field == colId)
      state.columnDefs.splice(deletedIndex, 1)
    },
    DELETE_GROUP(state, groupId) {
      const colDefs = state.gridApi.getColumnDefs()
      const deletedIndex = colDefs.findIndex((c) => c.groupId == groupId)
      colDefs.splice(deletedIndex, 1)
      state.columnDefs = mapHeaderSet(colDefs)
    },
    DELETE_CHILD_GROUP(state, groupId) {
      const groupParent = state.colApi.getColumnGroup(groupId).getParent()
      const childIndex = groupParent.children.findIndex((c) => c.groupId == groupId)
      groupParent.getColGroupDef().children.splice(childIndex, 1)
      console.log(groupParent, childIndex)

      let root = groupParent
      while (root.getParent() != null) {
        root = root.getParent()
      }
      const rootId = root.groupId
      root = mapFullColGroupDefToLean(root.getColGroupDef())
      const rootIndex = state.gridApi.getColumnDefs().findIndex((c) => c.groupId == rootId)
      state.columnDefs.splice(rootIndex, 1, root)
    },
    DELETE_CHILD_COLUMN(state, { parent, colId }) {
      const parentDef = parent.getColGroupDef()
      const children = parentDef.children
      const deletedIndex = children.findIndex((c) => c.field == colId)
      children.splice(deletedIndex, 1)
      state.columnDefs = store.copy('table/columnDefs')
      // TO DO: find a way to handle the case when we delete the last children,
      // for example by allowing to delete the parent directly and disallowing to delete
      // the last children
    },
    RENAME_COLUMN(state, { newName, colId }) {
      const col = state.gridApi.getColumnDef(colId)
      col.headerName = newName
      // sync defs in gridApi and in component, prevent issues
      // when deleting renamed headers
      state.columnDefs = mapHeaderSet(state.gridApi.getColumnDefs())
    },
    RENAME_GROUP(state, { newName, group }) {
      console.log('renaming group')
      const groupDef = group.getColGroupDef()
      groupDef.headerName = newName
      state.columnDefs = mapHeaderSet(state.gridApi.getColumnDefs())
    },
    SET_GROUP(state, { name, column }) {
      let columnDefs = mapHeaderSet(state.gridApi.getColumnDefs())
      const colDef = column.getColDef()
      const colIndex = columnDefs.findIndex((c) => c.field == column.colId)

      const parentDef = {
        headerName: name,
        children: [
          {
            headerName: colDef.headerName,
            field: colDef.field,
            sortable: colDef.sortable,
          },
        ],
      }

      columnDefs.splice(colIndex, 1, parentDef)
      state.columnDefs = columnDefs
      // wait and re-sync, so that "getHeaderGroups" is triggered
      // again with updated values
      setTimeout(() => state.gridApi.refreshHeader(), 500)
    },
    ADD_COLUMN(state, { name, colId }) {
      const startIndex = state.columnDefs.findIndex((c) => c.field == colId)

      state.columnDefs.splice(startIndex + 1, 0, {
        headerName: name,
        field: name.replaceAll(' ', '_').toLowerCase(),
      })
    },
    PUSH_COLUMN(state, { name }) {
      state.columnDefs.splice(state.columnDefs.length, 0, {
        headerName: name,
        field: name.replaceAll(' ', '_').toLowerCase(),
      })
    },
    ADD_CHILD_COLUMN(state, { parent, name, colId }) {
      const children = parent.getColGroupDef().children
      const currIndex = children.findIndex((c) => c.field == colId)
      const newCol = {
        headerName: name,
        field: name.replaceAll(' ', '_').toLowerCase(),
      }
      children.splice(currIndex + 1, 0, newCol)
      state.gridApi.setColumnDefs(state.columnDefs)
    },
    ADD_TO_GROUP(state, { groupId, column }) {
      const groupDef = state.colApi.getColumnGroup(groupId).getColGroupDef()
      const colDef = column.getColDef()
      groupDef.children.splice(0, 0, {
        headerName: colDef.headerName,
        field: colDef.field,
        sortable: !!colDef.sortable,
      })

      state.gridApi.setColumnDefs(state.columnDefs)
      this.commit('table/DELETE_COLUMN', column.colId)
      state.gridApi.refreshHeader()
    },
    ADD_GROUP_TO_GROUP(state, { destGroupId, group }) {
      // add group to group
      const destGroupDef = state.colApi.getColumnGroup(destGroupId).getColGroupDef()
      destGroupDef.children.splice(0, 0, { ...group.getColGroupDef() })

      state.gridApi.setColumnDefs(state.columnDefs)
      if (group.getParent()) this.commit('table/DELETE_CHILD_GROUP', group.groupId)
      else this.commit('table/DELETE_GROUP', group.groupId)
      state.gridApi.refreshHeader()
    },
  },
  actions: {
    ...make.actions(state),
    deleteChildColumn() {},
  },
}

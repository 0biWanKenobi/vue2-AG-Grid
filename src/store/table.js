import { make } from 'vuex-pathify'
import store from './index'

import { mapHeaderSet, mapFullColGroupDefToLean } from '../components/colDefMapper'
import { v4 as randomUUID } from 'uuid'

const state = {
  gridApi: null,
  colApi: null,
  columnDefs: [],
  syncInProgress: false,
}

const deriveColIdFrom = (name) => {
  return name.replaceAll(' ', '_').toLowerCase()
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
    SYNC_COLUMNS(state) {
      if (state.syncInProgress) {
        state.syncInProgress = false
        return
      }
      state.syncInProgress = true
      state.columnDefs = mapHeaderSet(state.gridApi.getColumnDefs())
      state.gridApi.refreshHeader()
    },
    DELETE_COLUMN(state, colId) {
      const deletedIndex = state.columnDefs.findIndex((c) => c.colId == colId)
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
      const children = groupParent.getColGroupDef().children
      const childIndex = children.findIndex((c) => c.groupId == groupId)
      children.splice(childIndex, 1)

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
      const deletedIndex = children.findIndex((c) => c.colId == colId)
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
    TOGGLE_SORTABLE(state, { colId }) {
      const col = state.gridApi.getColumnDef(colId)
      col.sortable = col.sortable == false ? true : false
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
      const colIndex = columnDefs.findIndex((c) => c.colId == column.colId)

      const parentDef = {
        headerName: name,
        groupId: randomUUID(),
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
      // setTimeout(() => state.gridApi.refreshHeader(), 500)
    },
    ADD_COLUMN(state, { name, colId }) {
      const startIndex = state.columnDefs.findIndex((c) => c.colId == colId)
      const newColId = deriveColIdFrom(name)

      state.columnDefs.splice(startIndex + 1, 0, {
        headerName: name,
        field: newColId,
        colId: newColId,
      })
    },
    PUSH_COLUMN(state, { name }) {
      const colId = deriveColIdFrom(name)
      state.columnDefs.splice(state.columnDefs.length, 0, {
        headerName: name,
        field: colId,
        colId,
      })
    },
    ADD_CHILD_COLUMN(state, { parent, name, colId }) {
      const children = parent.getColGroupDef().children
      const newColId = deriveColIdFrom(name)
      const currIndex = children.findIndex((c) => c.colId == colId)
      const newCol = {
        headerName: name,
        field: newColId,
        colId: newColId,
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
        colId: colDef.colId,
      })

      state.gridApi.setColumnDefs(state.columnDefs)
      this.commit('table/DELETE_COLUMN', column.colId)
    },
    ADD_GROUP_TO_GROUP(state, { destGroupId, group }) {
      // add group to group
      const destGroupDef = state.colApi.getColumnGroup(destGroupId).getColGroupDef()
      destGroupDef.children.splice(0, 0, { ...group.getColGroupDef(), groupId: randomUUID() })

      state.gridApi.setColumnDefs(state.columnDefs)
      if (group.getParent()) this.commit('table/DELETE_CHILD_GROUP', group.groupId)
      else this.commit('table/DELETE_GROUP', group.groupId)
    },
    SET_GROUP_PARENT(state, { name, group }) {
      const groupIndex = state.columnDefs.findIndex((c) => c.groupId == group.groupId)

      let groupDef = group.getColGroupDef()

      state.columnDefs.splice(groupIndex, 1, {
        headerName: name,
        groupId: randomUUID(),
        children: [
          {
            headerName: groupDef.headerName,
            groupId: randomUUID(),
            children: [...groupDef.children],
          },
        ],
      })
    },
  },
  actions: {
    ...make.actions(state),
    deleteChildColumn() {},
  },
}

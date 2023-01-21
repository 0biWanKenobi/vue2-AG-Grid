<template>
  <v-container>
    <v-app-bar class="mb-4">
      <v-btn outlined class="mr-2">New table</v-btn>
      <v-btn outlined class="mr-2">Add Column</v-btn>
      <v-btn outlined class="mr-2">Advanced Editor</v-btn>
    </v-app-bar>
    <ag-grid-vue
      class="ag-theme-alpine custom-theme"
      style="width: 100%; height: 300px"
      @grid-ready="onGridReady"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :defaultColGroupDef="defaultColGroupDef"
      :rowData="rowData"
    >
    </ag-grid-vue>
    <json-editor class="my-4" v-model="headerJsonDef"></json-editor>
    <v-btn @click="setColDefs()" class="mr-2">Set Headers</v-btn>
    <v-btn @click="prettyPrint()">Pretty Print</v-btn>
  </v-container>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue'
import { sync, commit } from 'vuex-pathify'
import JSON5 from 'json5'

import CustomHeader from './header/Header.vue'
import CustomHeaderGroup from './header/HeaderGroup.vue'
import JsonEditor from './JsonEditor.vue'
import { mapHeaderSet } from './colDefMapper'

export default {
  data() {
    return {
      defaultColDef: null,
      defaultColGroupDef: null,
      gridApi: null,
      colApi: null,
      rowData: null,
      headerJsonDef: '',
    }
  },
  computed: {
    shouldPrettyPrint: sync('table/shouldPrettyPrint'),
    columnDefs: sync('table/columnDefs'),
  },
  components: {
    AgGridVue,
    agColumnHeader: CustomHeader,
    CustomHeaderGroup,
    JsonEditor,
  },
  beforeMount() {
    this.defaultColGroupDef = {
      headerGroupComponent: 'CustomHeaderGroup',
      headerGroupComponentParams: {
        onRename: (params) => commit('table/RENAME_GROUP', params),
        onAddParent: this.addGrandParent,
        onDelete: ({ groupId }) => {
          commit('table/DELETE_GROUP', groupId)
        },
      },
    }
    this.defaultColDef = {
      flex: 1,
      editable: true,
      filter: true,
      headerComponentParams: {
        enableMenu: true,
        getHeaderGroups: this.getHeaderGroups,
        onAddToGroup: this.addColumnToGroup,
        onDeleteHeader: (params) => {
          const { column } = params
          const isChild = this.isChildColumn(column)
          if (isChild) {
            commit('table/DELETE_CHILD_COLUMN', { parent: column.parent, colId: column.colId })
          } else commit('table/DELETE_COLUMN', column.colId)
        },
        onRenameHeader: ({ value, column }) => {
          commit('table/RENAME_COLUMN', { newName: value, colId: column.colId })
        },
        onAddParentHeader: (params) => commit('table/SET_GROUP', params),
        onAddHeader: ({ name, column }) => {
          const isChild = this.isChildColumn(column)
          if (isChild) {
            this.addChildColumn(column.parent, column.colId, name)
          } else this.addColumn(column.colId, name)
        },
      },
    }

    this.rowData = [
      { make: 'Toyota', name: 'Celica', spec: 'GT', price: 35000 },
      { make: 'Ford', name: 'Mondeo', spec: 'Coupe', price: 32000 },
      { make: 'Porsche', name: 'Boxter', spec: '4S', price: 72000 },
    ]
  },
  methods: {
    setColDefs() {
      this.gridApi.setColumnDefs(JSON5.parse(this.headerJsonDef))
    },
    prettyPrint() {
      this.shouldPrettyPrint = true
    },
    isChildColumn(column) {
      const parent = column.getParent()
      return parent && !!column.parent.getColGroupDef().children
    },
    getHeaderGroups() {
      return this.colApi
        ?.getAllDisplayedColumnGroups()
        ?.filter((cg) => cg.getColGroupDef && cg.getColGroupDef().children)
        .map((cg) => ({ groupId: cg.groupId, name: cg.getColGroupDef().headerName }))
    },
    addGrandParent({ name, group }) {
      let groupDef = group.getColGroupDef()
      const children = [
        {
          headerName: groupDef.headerName,
          children: [...groupDef.children],
        },
      ]

      groupDef.children.length && groupDef.children.splice(0, groupDef.children.length)
      Object.keys(groupDef).forEach((key) => key != 'children' && delete groupDef[key])
      groupDef.children.splice(0, 0, ...children)
      this.gridApi.setColumnDefs(this.columnDefs)
      groupDef = this.colApi.getColumnGroup(group.groupId).getColGroupDef()
      this.$set(groupDef, 'headerName', name)
      // need full reassignment
      this.columnDefs = mapHeaderSet(this.gridApi.getColumnDefs())
    },
    addColumnToGroup({ groupId, column }) {
      const groupDef = this.colApi.getColumnGroup(groupId).getColGroupDef()
      groupDef.children.splice(0, 0, { ...column.getColDef() })

      this.gridApi.setColumnDefs(this.columnDefs)
      commit('table/DELETE_COLUMN', column.colId)
      this.gridApi.refreshHeader()
      // this.gridApi.setColumnDefs(this.columnDefs)
    },
    addColumn(colId, name) {
      const startIndex = this.columnDefs.findIndex((c) => c.field == colId)

      this.columnDefs.splice(startIndex + 1, 0, {
        headerName: name,
        field: name.replaceAll(' ', '_').toLowerCase(),
      })
    },
    deleteChildColumn(parent, colId) {
      const children = parent.getColGroupDef().children
      const deletedIndex = children.findIndex((c) => c.field == colId)
      children.splice(deletedIndex, 1)
      this.gridApi.setColumnDefs(this.columnDefs)
      if (children.length == 0) {
        this.columnDefs = mapHeaderSet(this.gridApi.getColumnDefs())
      }
      this.gridApi.sizeColumnsToFit()
    },
    addChildColumn(parent, colId, name) {
      const children = parent.getColGroupDef().children
      const currIndex = children.findIndex((c) => c.field == colId)
      const newCol = {
        headerName: name,
        field: name.replaceAll(' ', '_').toLowerCase(),
      }
      children.splice(currIndex + 1, 0, newCol)
      this.gridApi.setColumnDefs(this.columnDefs)
    },
    onGridReady(params) {
      this.gridApi = params.api
      commit('table/SET_GRID_API', params.api)
      this.colApi = params.columnApi
    },
  },
}
</script>
<style lang="scss">
@import './table.scss';
</style>

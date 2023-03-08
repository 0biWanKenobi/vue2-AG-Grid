<template>
  <v-container>
    <new-col-dialog v-model="newColDialogOpen" @save="pushColumn($event)"></new-col-dialog>
    <new-table-dialog v-model="newTableDialogOpen" @save="createTable($event)"></new-table-dialog>
    <v-app-bar class="mb-4">
      <v-btn outlined class="mr-2" @click="newTableDialogOpen = true">New table</v-btn>
      <v-btn outlined class="mr-2" @click="() => (newColDialogOpen = true)">Add Column</v-btn>
      <v-btn outlined class="mr-2" @click="showEditor = !showEditor">Advanced Editor</v-btn>
      <v-file-input
        label="Upload CSV"
        accept=".csv"
        @change="onFileChange($event)"
        :loading="loadingCsv"
      ></v-file-input>
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
    <div v-if="showEditor">
      <json-editor class="my-4" v-model="headerJsonDef"></json-editor>
      <v-btn @click="setColDefs()" class="mr-2">Set Headers</v-btn>
      <v-btn @click="prettyPrint()">Pretty Print</v-btn>
    </div>
  </v-container>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue'
import { sync, commit } from 'vuex-pathify'
import JSON5 from 'json5'
import Papa from 'papaparse'

import CustomHeader from './header/Header.vue'
import CustomHeaderGroup from './header/HeaderGroup.vue'
import NewColDialog from './header/NewColDialog.vue'
import NewTableDialog from './NewTableDialog.vue'
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
      showEditor: false,
      newColDialogOpen: false,
      newTableDialogOpen: false,
      loadingCsv: false,
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
    NewColDialog,
    NewTableDialog,
  },
  beforeMount() {
    this.defaultColGroupDef = {
      headerGroupComponent: 'CustomHeaderGroup',
      headerGroupComponentParams: {
        onRename: (params) => commit('table/RENAME_GROUP', params),
        onAddParent: this.addGrandParent,
        onDelete: ({ groupId }) => {
          const groupParent = this.colApi.getColumnGroup(groupId).getParent()
          if (groupParent) commit('table/DELETE_CHILD_GROUP', groupId)
          else commit('table/DELETE_GROUP', groupId)
        },
        onAddToGroup: (params) => commit('table/ADD_GROUP_TO_GROUP', params),
        getHeaderGroups: this.getHeaderGroups,
      },
    }
    this.defaultColDef = {
      flex: 1,
      editable: true,
      filter: true,
      headerComponentParams: {
        enableMenu: true,
        getHeaderGroups: this.getHeaderGroups,
        onAddToGroup: ({ groupId, column }) => commit('table/ADD_TO_GROUP', { groupId, column }),
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
            commit('table/ADD_CHILD_COLUMN', { parent: column.parent, colId: column.colId, name })
          } else commit('table/ADD_COLUMN', { colId: column.colId, name })
        },
      },
    }

    this.rowData = []
  },
  methods: {
    onFileChange(file) {
      if (!file) return
      this.loadingCsv = 'primary'
      Papa.parse(file, {
        complete: (results) => {
          this.rowData = this.convertToRowData(results.data)
          this.loadingCsv = false
        },
        error(error) {
          console.log(error)
          this.loadingCsv = false
        },
        header: true,
        skipEmptyLines: true,
        worker: Papa.WORKERS_SUPPORTED,
      })
    },
    convertToRowData(data) {
      return data.map((row) => {
        const obj = {}
        Object.keys(row).forEach((key) => {
          const lkey = key.trim().replaceAll(' ', '_').toLowerCase()
          obj[lkey] = row[key].trim()
        })
        return obj
      })
    },
    createTable(headerNames) {
      console.log(headerNames)
    },
    setColDefs() {
      this.columnDefs = JSON5.parse(this.headerJsonDef)
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
    pushColumn(colName) {
      commit('table/PUSH_COLUMN', { name: colName })
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
    onGridReady(params) {
      this.gridApi = params.api
      this.colApi = params.columnApi
      commit('table/SET_APIS', { gridApi: params.api, colApi: params.columnApi })
    },
  },
}
</script>
<style lang="scss">
@import './table.scss';
</style>

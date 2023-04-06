<template>
  <v-container>
    <new-col-dialog v-model="newColDialogOpen" @save="pushColumn($event)"></new-col-dialog>
    <new-table-dialog v-model="newTableDialogOpen"></new-table-dialog>
    <v-app-bar class="mb-4">
      <v-btn outlined class="mr-2" @click="newTableDialogOpen = true">New table</v-btn>
      <v-btn outlined class="mr-2" @click="() => (newColDialogOpen = true)">Add Column</v-btn>
      <v-btn outlined class="mr-2" @click="showEditor = !showEditor">Advanced Editor</v-btn>
      <v-file-input
        v-if="showCsvUpload"
        label="Upload table data"
        accept=".csv"
        @change="onFileChange($event)"
        :loading="loadingCsv"
      ></v-file-input>
    </v-app-bar>
    <ag-grid-vue
      class="ag-theme-alpine custom-theme"
      style="width: 100%; height: 300px"
      @grid-ready="onGridReady"
      @component-state-changed="onGridChanged()"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :defaultColGroupDef="defaultColGroupDef"
      :rowData="rowData"
    >
    </ag-grid-vue>
    <div v-if="showEditor">
      <json-editor class="my-4" v-model="headerJsonDef"></json-editor>
      <v-btn @click="setColDefs()" class="mr-2">Set Headers</v-btn>
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
    columnDefs: sync('table/columnDefs'),
    showCsvUpload() {
      return this.columnDefs?.length > 0
    },
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
        getHeaderGroups: this.getHeaderGroups,
        isChildColumn: this.isChildColumn,
      },
    }
    this.defaultColDef = {
      flex: 1,
      editable: true,
      filter: true,
      headerComponentParams: {
        enableMenu: true,
        getHeaderGroups: this.getHeaderGroups,
        isChildColumn: this.isChildColumn,
      },
    }

    this.rowData = []
  },
  methods: {
    onGridChanged() {
      commit('table/SYNC_COLUMNS')
    },
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
      commit('table/SET_COLUMNS', { columns: JSON5.parse(this.headerJsonDef) })
    },
    isChildColumn(column) {
      const parent = column.getParent()
      if (!parent) return false
      if (parent.getColGroupDef().children) return true
      return this.isChildColumn(parent)
    },
    getHeaderGroups(callerGroupId = null) {
      return this.colApi
        ?.getAllDisplayedColumnGroups()
        ?.filter((cg) => {
          const grDef = cg.getColGroupDef?.()
          if (!grDef) return false
          return !!grDef.children && (!callerGroupId || grDef.groupId != callerGroupId)
        })
        .map((cg) => ({ groupId: cg.groupId, name: cg.getColGroupDef().headerName }))
    },
    pushColumn(colName) {
      commit('table/PUSH_COLUMN', { name: colName })
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

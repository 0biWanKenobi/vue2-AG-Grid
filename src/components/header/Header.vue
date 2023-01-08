<template>
  <v-hover v-slot="{ hover }">
    <div class="ag-cell-label-container" role="presentation">
      <new-col-dialog
        v-model="newColDialogOpen"
        @save="addingParent ? onNewParent($event) : onNewColumn($event)"
      ></new-col-dialog>
      <v-btn v-if="hover" ref="menuButton" class="ma-2 customHeaderMenuButton" text icon @click="onMenuClicked($event)">
        <v-icon small>mdi-filter-menu-outline</v-icon>
      </v-btn>
      <div ref="eLabel" class="ag-header-cell-label" role="presentation">
        <header-menu
          :params="params"
          @editingEnabled="onEditingEnabled"
          @addNew="newColDialogOpen = true"
          @addParent="addingParent = newColDialogOpen = true"
        ></header-menu>
        <v-text-field
          v-if="editingLabel"
          label="Header label"
          v-model="tempValue"
          @keydown.stop
          @keyup.stop.enter="onSaveLabel()"
        ></v-text-field>
        <span v-else role="columnheader" @click="onSortRequested($event)">{{ params.displayName }}</span>
        <div v-if="params.enableSorting && showDescSort">
          <v-icon small>mdi-arrow-down</v-icon>
        </div>
        <div v-if="params.enableSorting && showAscSort">
          <v-icon small>mdi-arrow-up</v-icon>
        </div>
      </div>
    </div>
  </v-hover>
</template>

<script>
import NewColDialog from './NewColDialog.vue'
import HeaderMenu from './HeaderMenu.vue'
export default {
  components: {
    newColDialog: NewColDialog,
    HeaderMenu,
  },
  data() {
    return {
      showAscSort: false,
      showDescSort: false,
      editingLabel: false,
      addingParent: false,
      newColDialogOpen: false,
      tempValue: '',
    }
  },
  mounted() {
    this.params.column.addEventListener('sortChanged', this.onSortChanged)
    this.onSortChanged()
  },
  methods: {
    onMenuClicked() {
      this.params.showColumnMenu(this.$refs.menuButton.$el)
    },
    onEditingEnabled() {
      this.editingLabel = true
      this.tempValue = this.params.displayName
    },
    onSaveLabel() {
      this.params.onRenameHeader({ value: this.tempValue, column: this.params.column })
      this.editingLabel = false
    },
    onNewParent(newParentName) {
      this.params.onAddParentHeader({ name: newParentName, column: this.params.column })
    },
    onNewColumn(newColName) {
      this.params.onAddHeader({ name: newColName, column: this.params.column })
    },
    onSortChanged() {
      if (this.params.column.isSortAscending()) {
        this.showAscSort = true
        this.showDescSort = false
      } else if (this.params.column.isSortDescending()) {
        this.showDescSort = true
        this.showAscSort = false
      } else {
        this.showDescSort = false
        this.showAscSort = false
      }
    },

    onSortRequested(event) {
      let order = ''
      if (this.params.column.isSortAscending()) order = 'desc'
      else if (this.params.column.isSortDescending()) order = ''
      else order = 'asc'

      console.log('order is "' + order + '"')

      this.params.setSort(order, event.shiftKey)
    },
  },
}
</script>
<style>
.list_item {
  cursor: pointer;
}
.customHeaderMenuButton {
  float: left;
  margin: 0 0 0 3px;
}
</style>

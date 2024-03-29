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
        <header-menu :items="items" :subMenus="subMenus"></header-menu>
        <v-text-field
          v-if="editingLabel"
          label="Header label"
          v-model="tempValue"
          @keydown.stop
          @keyup.stop.enter="onSaveLabel()"
        ></v-text-field>
        <span
          :class="{ 'cursor-pointer': colDef.sortable != false }"
          v-else
          role="columnheader"
          @click="onSortRequested($event)"
          >{{ params.displayName }}</span
        >
        <div v-if="sort == 'desc'">
          <v-icon small>mdi-arrow-down</v-icon>
        </div>
        <div v-if="sort == 'asc'">
          <v-icon small>mdi-arrow-up</v-icon>
        </div>
      </div>
    </div>
  </v-hover>
</template>

<script>
import NewColDialog from './NewColDialog.vue'
import HeaderMenu from './HeaderMenu.vue'
import { commit } from 'vuex-pathify'

export default {
  components: {
    newColDialog: NewColDialog,
    HeaderMenu,
  },
  data() {
    return {
      editingLabel: false,
      addingParent: false,
      newColDialogOpen: false,
      tempValue: '',
      sort: '',
      baseItems: [
        { title: 'Rename', action: this.onEditingEnabled },
        {
          title: 'Delete',
          action: this.onDelete,
        },
        {
          title: 'Add new',
          action: () => (this.newColDialogOpen = true),
        },
        {
          title: 'Add parent',
          action: () => (this.addingParent = this.newColDialogOpen = true),
        },
      ],
    }
  },
  computed: {
    parentInfo() {
      return this.params.column.getParent()?.getColGroupDef() ?? {}
    },
    colDef() {
      return this.params.column.getColDef()
    },
    siblingsCount() {
      return this.parentInfo.children?.length ?? 0
    },
    hasParent() {
      return this.params.isChildColumn(this.params.column)
    },
    hasNoParent() {
      return !this.hasParent
    },
    showAddToGroup() {
      return this.hasNoParent && this.headerGroups.length
    },
    canSelfDelete() {
      return this.siblingsCount > 1 || this.hasNoParent
    },
    headerGroups() {
      if (this.hasParent) return []
      return this.params.getHeaderGroups()
    },
    items() {
      let returnedItems = this.baseItems
      if (!this.canSelfDelete) returnedItems = returnedItems.filter((i) => i.title != 'Delete')
      if (this.hasParent) returnedItems = returnedItems.filter((i) => i.title != 'Add parent')
      return returnedItems
    },
    baseSubMenus() {
      return [
        {
          title: 'Properties',
          options: [
            {
              name: ` ${this.colDef.sortable == false ? 'Enable' : 'Disable'} Sortable`,
              action: () => commit('table/TOGGLE_SORTABLE', { colId: this.params.column.getColId() }),
            },
          ],
          action: (option) => option.action(),
        },
      ]
    },
    subMenus() {
      const returnedSubMenus = this.baseSubMenus
      if (this.showAddToGroup) {
        const addToGroupOpt = {
          title: 'Add to Group',
          options: this.headerGroups,
          action: (group) => this.onAddToParent({ groupId: group.groupId }),
        }
        returnedSubMenus.splice(0, 0, addToGroupOpt)
      }
      return returnedSubMenus
    },
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
      commit('table/RENAME_COLUMN', { newName: this.tempValue, colId: this.params.column.getColId() })
      this.editingLabel = false
    },
    onNewParent(newParentName) {
      commit('table/SET_GROUP', { name: newParentName, column: this.params.column })
    },
    onDelete() {
      const isChild = this.params.isChildColumn(this.params.column)
      if (isChild) {
        commit('table/DELETE_CHILD_COLUMN', { parent: this.params.column.parent, colId: this.params.column.getColId() })
      } else commit('table/DELETE_COLUMN', this.params.column.getColId())
    },
    onAddToParent({ groupId }) {
      commit('table/ADD_TO_GROUP', { groupId, column: this.params.column })
    },
    onNewColumn(newColName) {
      const isChild = this.params.isChildColumn(this.params.column)
      if (isChild) {
        commit('table/ADD_CHILD_COLUMN', {
          parent: this.params.column.parent,
          colId: this.params.column.getColId(),
          name: newColName,
        })
      } else commit('table/ADD_COLUMN', { colId: this.params.column.getColId(), name: newColName })
    },
    onSortRequested(event) {
      if (this.colDef.sortable == false) {
        console.log('sorting disabled')
        return
      }

      if (this.params.column.isSortAscending()) this.sort = 'desc'
      else if (this.params.column.isSortDescending()) this.sort = ''
      else this.sort = 'asc'

      console.log('order is "' + this.sort + '"')

      this.params.setSort(this.sort, event.shiftKey)
    },
    // refresh(params) {
    //   console.log(params)
    //   return true
    // },
  },
}
</script>
<style>
.list_item,
.cursor-pointer {
  cursor: pointer;
}
.customHeaderMenuButton {
  float: left;
  margin: 0 0 0 3px;
}
</style>

<template>
  <div class="ag-header-group-cell-label">
    <new-parent-dialog v-model="addingParent" @save="onAddParent($event)"></new-parent-dialog>
    <header-menu v-if="shouldShowMenu" :items="items" :subMenus="subMenus"></header-menu>
    <div v-if="editingLabel">
      <v-text-field v-model="tempValue" @keydown.stop @keyup.stop.enter="onSaveLabel()"></v-text-field>
    </div>
    <div v-else>{{ params.displayName }}</div>
  </div>
</template>

<script>
import { commit } from 'vuex-pathify'
import NewParentDialog from './NewColDialog.vue'
import HeaderMenu from './HeaderMenu.vue'

export default {
  components: {
    NewParentDialog,
    HeaderMenu,
  },
  data: function () {
    return {
      groupExpanded: false,
      editingLabel: false,
      addingParent: false,
      tempValue: '',
      baseItems: [
        { title: 'Rename', action: this.onEditingEnabled },
        {
          title: 'Delete',
          action: this.onDelete,
        },
        { title: 'Add Parent', action: this.openParentDialog },
      ],
      addToGroupMenuOpen: false,
    }
  },
  computed: {
    shouldShowMenu() {
      return (this.params.displayName ?? '') != ''
    },
    parentInfo() {
      return this.params.columnGroup.getParent()?.getColGroupDef() ?? {}
    },
    siblings() {
      return this.parentInfo.children ?? []
    },
    groupId() {
      return this.params.columnGroup.groupId
    },
    hasParent() {
      return this.params.isChildColumn(this.params.columnGroup)
    },
    hasNoParent() {
      return !this.hasParent
    },
    canSelfDelete() {
      return this.siblings.length > 1 || this.hasNoParent
    },
    headerGroups() {
      if (this.hasParent) return []
      return this.params.getHeaderGroups(this.groupId)
    },
    items() {
      let returnedItems = this.baseItems
      if (!this.canSelfDelete) returnedItems = returnedItems.filter((i) => i.title != 'Delete')
      if (this.hasParent) returnedItems = returnedItems.filter((i) => i.title != 'Add Parent')
      return returnedItems
    },
    subMenus() {
      if (!this.headerGroups.length) return []
      return [
        {
          title: 'Add to Group',
          options: this.headerGroups,
          action: this.onAddToGroup,
        },
      ]
    },
  },
  mounted() {
    this.params.columnGroup
      .getProvidedColumnGroup()
      .addEventListener('expandedChanged', this.syncExpandButtons.bind(this))
    this.syncExpandButtons()
  },
  methods: {
    expandOrCollapse() {
      let currentState = this.params.columnGroup.getProvidedColumnGroup().isExpanded()
      this.params.setExpanded(!currentState)
    },
    syncExpandButtons() {
      this.groupExpanded = this.params.columnGroup.getProvidedColumnGroup().isExpanded()
    },
    onSaveLabel() {
      this.editingLabel = false
      commit('table/RENAME_GROUP', { group: this.params.columnGroup, newName: this.tempValue })
      this.tempValue = ''
    },
    onEditingEnabled() {
      this.editingLabel = true
      this.tempValue = this.params.displayName
    },
    openParentDialog() {
      this.addingParent = true
    },
    onAddParent(parentName) {
      commit('table/SET_GROUP_PARENT', { group: this.params.columnGroup, name: parentName })
      this.addingParent = false
    },
    onDelete() {
      const groupParent = this.params.columnGroup.getParent()
      if (groupParent) commit('table/DELETE_CHILD_GROUP', this.params.columnGroup.groupId)
      else commit('table/DELETE_GROUP', this.params.columnGroup.groupId)
    },
    onAddToGroup({ groupId }) {
      commit('table/ADD_GROUP_TO_GROUP', { destGroupId: groupId, group: this.params.columnGroup })
    },
  },
}
</script>

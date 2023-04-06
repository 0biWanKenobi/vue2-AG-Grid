<template>
  <div class="ag-header-group-cell-label">
    <new-parent-dialog v-model="addingParent" @save="onAddParent($event)"></new-parent-dialog>
    <v-menu v-if="shouldShowMenu" bottom left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item class="list_item" v-for="(item, i) in items" :key="i">
          <v-list-item-title @click="item.action()">{{ item.title }}</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="this.headerGroups.length" no-action class="list_item">
          <v-list-item-title @click.stop="addToGroupMenuOpen = !addToGroupMenuOpen">Add to Group</v-list-item-title>
          <v-menu v-model="addToGroupMenuOpen" :close-on-content-click="false" offset-x>
            <template v-slot:activator="{ props }">
              <v-list-item-action v-bind="props">
                <v-icon>
                  {{ addToGroupMenuOpen ? 'mdi-menu-down' : 'mdi-menu-right' }}
                </v-icon>
              </v-list-item-action>
            </template>
            <v-card>
              <v-list dense>
                <v-list-item class="list_item" v-for="(item, j) in headerGroups" :key="`listitem-${j}`">
                  <v-list-item-content>
                    <v-list-item-title @click="onAddToGroup(item.groupId)">
                      {{ item.name }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </v-list-item>
      </v-list>
    </v-menu>
    <div v-if="editingLabel">
      <v-text-field v-model="tempValue" @keydown.stop @keyup.stop.enter="onSaveLabel()"></v-text-field>
    </div>
    <div v-else>{{ params.displayName }}</div>
  </div>
</template>

<script>
import { commit } from 'vuex-pathify'
import NewParentDialog from './NewColDialog.vue'

export default {
  components: {
    NewParentDialog,
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
    onAddToGroup(groupId) {
      commit('table/ADD_GROUP_TO_GROUP', { destGroupId: groupId, group: this.params.columnGroup })
    },
  },
}
</script>

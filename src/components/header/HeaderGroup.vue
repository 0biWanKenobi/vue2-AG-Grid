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


      <v-list-group no-action @click.stop :value="false">
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>Add to Group</v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-item class="list_item" v-for="(item, i) in params.getHeaderGroups()" :key="i">
          <v-list-item-content>
            <v-list-item-title @click="params.onAddToGroup({ destGroupId: item.groupId, group: params.columnGroup })">
              {{ item.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>

      </v-list>
    </v-menu>
    <div v-if="editingLabel">
      <v-text-field v-model="tempValue" @keydown.stop @keyup.stop.enter="onSaveLabel()"></v-text-field>
    </div>
    <div v-else>{{ params.displayName }}</div>
  </div>
</template>

<script>
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
      items: [
        { title: 'Rename', action: this.onEditingEnabled },
        {
          title: 'Delete',
          action: () => {
            this.params.onDelete({ groupId: this.params.columnGroup.groupId })
          },
        },
        { title: 'Add Parent', action: this.openParentDialog },
      ],
    }
  },
  computed: {
    shouldShowMenu() {
      return (this.params.displayName ?? '') != ''
    },
  },
  beforeMount() {},
  mounted() {
    this.params.columnGroup
      .getProvidedColumnGroup()
      .addEventListener('expandedChanged', this.syncExpandButtons.bind(this))
    this.syncExpandButtons()

    const parent = this.params.columnGroup.parent
    if (!parent || parent.getColGroupDef().children?.length > 1) return
    this.items = this.items.filter((i) => i.title != 'Delete')
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
      this.params.onRename({ group: this.params.columnGroup, newName: this.tempValue })
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
      this.params.onAddParent({ group: this.params.columnGroup, name: parentName })
      this.addingParent = false
    },
    onAddToGroup() {

    }
  },
}
</script>

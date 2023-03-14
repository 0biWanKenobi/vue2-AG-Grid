<template>
  <v-menu bottom left>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item class="list_item" v-for="(item, i) in items" :key="i">
        <v-list-item-title @click="item.action()">{{ item.title }}</v-list-item-title>
      </v-list-item>

      <v-list-item v-if="showAddToGroup" no-action class="list_item">
        <v-list-item-title @click.stop="openSubmenu">Add to Group</v-list-item-title>
        <v-menu v-model="submenuOpen" :close-on-content-click="false" offset-x>
          <template v-slot:activator="{ props }">
            <v-list-item-action v-bind="props">
              <v-icon>
                {{ submenuOpen ? 'mdi-menu-down' : 'mdi-menu-right' }}
              </v-icon>
            </v-list-item-action>
          </template>
          <v-card>
            <v-list dense>
              <v-list-item class="list_item" v-for="(group, j) in params.getHeaderGroups()" :key="j">
                <v-list-item-content>
                  <v-list-item-title @click="$emit('addToGroup', { groupId: group.groupId })">
                    {{ group.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script>
export default {
  props: ['params'],
  data() {
    return {
      submenuOpen: false,
      baseItems: [
        { title: 'Rename', action: () => this.$emit('editingEnabled') },
        {
          title: 'Delete',
          action: () => this.$emit('delete'),
        },
        {
          title: 'Add new',
          action: () => this.$emit('addNew'),
        },
        {
          title: 'Add parent',
          action: () => this.$emit('addParent'),
        },
      ],
    }
  },
  computed: {
    parentInfo() {
      return this.params.column.getParent()?.getColGroupDef() ?? {}
    },
    siblings() {
      return this.parentInfo.children ?? []
    },
    hasParent() {
      return this.params.isChildColumn(this.params.column)
    },
    hasNoParent() {
      return !this.hasParent
    },
    showAddToGroup() {
      return this.hasNoParent && this.params.getHeaderGroups().length
    },
    canSelfDelete() {
      return this.siblings.length > 1 || this.hasNoParent
    },
    items() {
      let returnedItems = this.baseItems
      if (!this.canSelfDelete) returnedItems = returnedItems.filter((i) => i.title != 'Delete')
      if (this.hasParent) returnedItems = returnedItems.filter((i) => i.title != 'Add parent')
      return returnedItems
    },
  },
  methods: {
    openSubmenu() {
      this.submenuOpen = true
    },
  },
}
</script>

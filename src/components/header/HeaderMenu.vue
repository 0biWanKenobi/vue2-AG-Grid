<template>
  <v-menu bottom left>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list flat>
      <v-list-item class="list_item" v-for="(item, i) in items" :key="i">
        <v-list-item-title @click="item.action()">{{ item.title }}</v-list-item-title>
      </v-list-item>

      <v-menu v-for="(subMenu, k) in subMenus" :close-on-content-click="false" offset-x :key="`submenu-${k}`">
        <template v-slot:activator="{ value, on }">
          <v-list-item v-on="on" no-action class="list_item">
            <v-list-item-title>{{ subMenu.title }}</v-list-item-title>
            <v-list-item-action>
              <v-icon>
                {{ value ? 'mdi-menu-down' : 'mdi-menu-right' }}
              </v-icon>
            </v-list-item-action>
          </v-list-item>
        </template>
        <v-card>
          <v-list dense>
            <v-list-item class="list_item" v-for="(option, j) in subMenu.options" :key="`listitem-${j}`">
              <v-list-item-content>
                <v-list-item-title @click="subMenu.action(option)">
                  {{ option.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-list>
  </v-menu>
</template>
<script>
export default {
  props: ['params'],
  data() {
    return {
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
      baseSubMenus: [
        {
          title: 'Add to Group',
          options: this.params.getHeaderGroups(),
          action: (group) => this.$emit('addToGroup', { groupId: group.groupId }),
        },
        {
          title: 'Properties',
          options: [
            {
              name: 'Sortable',
            },
          ],
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
    subMenus() {
      let returnedSubMenus = this.baseSubMenus
      if (!this.showAddToGroup) returnedSubMenus = returnedSubMenus.filter((i) => i.title != 'Add to Group')
      return returnedSubMenus
    },
  },
}
</script>

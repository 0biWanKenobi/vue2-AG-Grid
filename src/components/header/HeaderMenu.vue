<template>
  <v-menu bottom left v-model="menuOpen">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item class="list_item" v-for="(item, i) in items" :key="i">
        <v-list-item-title @click="item.action()">{{ item.title }}</v-list-item-title>
      </v-list-item>

      <template v-for="(subMenu, k) in subMenus">
        <v-list-item v-if="subMenu.showOption" no-action class="list_item" :key="`submenu-${k}`">
          <v-list-item-title @click.stop="subMenu.action()">{{ subMenu.title }}</v-list-item-title>
          <v-menu v-model="subMenu.open" :close-on-content-click="false" offset-x>
            <template v-slot:activator="{ props }">
              <v-list-item-action v-bind="props">
                <v-icon>
                  {{ subMenu.open ? 'mdi-menu-down' : 'mdi-menu-right' }}
                </v-icon>
              </v-list-item-action>
            </template>
            <v-card>
              <v-list dense>
                <v-list-item class="list_item" v-for="(option, j) in subMenu.options" :key="`listitem-${j}`">
                  <v-list-item-content>
                    <v-list-item-title @click="subMenu.itemAction(option)">
                      {{ option.name }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>
<script>
export default {
  props: ['params'],
  data() {
    return {
      menuOpen: false,
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
      subMenuOpen: {
        addToGroup: false,
        properties: false,
      },
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
      const { addToGroup: addToGroupOpen, properties: propertiesOpen } = this.subMenuOpen
      return [
        {
          title: 'Add to Group',
          showOption: this.showAddToGroup,
          open: addToGroupOpen,
          options: this.params.getHeaderGroups(),
          action: () => {
            this.subMenuOpen.addToGroup = !this.subMenuOpen.addToGroup
          },
          itemAction: (group) => this.$emit('addToGroup', { groupId: group.groupId }),
        },
        {
          title: 'Properties',
          showOption: true,
          open: propertiesOpen,
          options: [
            {
              name: 'Sortable',
            },
          ],
          action: () => {
            this.subMenuOpen.properties = !this.subMenuOpen.properties
          },
        },
      ]
    },
  },
  watch: {
    menuOpen(isOpen) {
      if (isOpen) return
      this.subMenuOpen = {
        addToGroup: false,
        properties: false,
      }
    },
  },
}
</script>

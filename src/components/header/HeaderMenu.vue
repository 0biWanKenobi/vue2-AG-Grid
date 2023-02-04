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
      <v-list-group no-action @click.stop :value="false">
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>Add to Group</v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-item class="list_item" v-for="(item, i) in params.getHeaderGroups()" :key="i">
          <v-list-item-content>
            <v-list-item-title @click="params.onAddToGroup({ groupId: item.groupId, column: params.column })">
              {{ item.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-menu>
</template>
<script>
export default {
  props: ['params'],
  data() {
    return {
      items: [
        { title: 'Rename', action: () => this.$emit('editingEnabled') },
        {
          title: 'Delete',
          action: () => {
            this.params.onDeleteHeader({ column: this.params.column })
          },
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
      siblings: null,
    }
  },
  methods: {
    updateMenu(params) {
      const parentInfo = params.column.getParent()?.getColGroupDef()
      if (parentInfo?.headerName) {
        this.items.splice(3, 1)
      }

      if (!parentInfo?.children) {
        this.siblings = []
        return
      }
      this.siblings = parentInfo.children
    },
  },
  mounted() {
    this.updateMenu(this.params)
  },
  watch: {
    siblings(children) {
      if (children.length > 1) return
      this.items = this.items.filter((i) => i.title != 'Delete')
    },
    params(newParams) {
      this.updateMenu(newParams)
    },
  },
}
</script>

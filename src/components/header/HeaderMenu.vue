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
      <v-list-group no-action @click.stop :value="false" v-if="hasNoParent">
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>Add to Group</v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-item class="list_item" v-for="(item, i) in params.getHeaderGroups()" :key="i">
          <v-list-item-content>
            <v-list-item-title @click="$emit('addToGroup', { groupId: item.groupId })">
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
  methods: {},
}
</script>

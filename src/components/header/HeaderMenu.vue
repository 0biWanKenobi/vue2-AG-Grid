<template>
  <v-menu bottom left>
    <template #activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list flat>
      <v-list-item class="list_item" v-for="(item, i) in items" :key="i">
        <v-list-item-title @click="item.action()">{{ item.title }}</v-list-item-title>
      </v-list-item>

      <v-menu v-for="(subMenu, k) in subMenus" :close-on-content-click="false" offset-x :key="`submenu-${k}`">
        <template #activator="{ value, on }">
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
  props: ['items', 'subMenus'],
}
</script>

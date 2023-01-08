<template>
  <v-app>
    <Table />
  </v-app>
</template>

<script>
import Table from './components/Table.vue'

export default {
  components: {
    Table,
  },
}
</script>

<style lang="scss">
@import '~ag-grid-community/styles/ag-grid.css';
@import '~ag-grid-community/styles/ag-theme-alpine.css';
</style>

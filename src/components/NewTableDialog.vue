<template>
  <v-dialog v-model="dialog" width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">New Table Options</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field label="Columns*" v-model.number="columnCount" required type="number"></v-text-field>
              <v-text-field
                v-for="(col, i) of columnCount"
                :key="i"
                :label="`Header ${i + 1} text`"
                v-model="columnDefinitions[i]"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <small>*indicates required field</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="onClose()"> Close </v-btn>
        <v-btn color="blue darken-1" text @click="onSave()"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/**
 *  draggable tree package: https://hetree.phphe.com/v2/guide
 *
 */
export default {
  props: {
    open: Boolean,
  },
  model: {
    prop: 'open',
  },
  data() {
    return {
      columnCount: 1,
      columnDefinitions: [''],
    }
  },
  computed: {
    dialog: {
      get() {
        return this.open
      },
      set(v) {
        this.$emit('input', v)
      },
    },

  },
  methods: {
    defineColumn(index, name) {},
    onClose() {
      this.dialog = false
    },
    onSave() {
      this.$emit('save', this.columnDefinitions)
    }
  },
}
</script>

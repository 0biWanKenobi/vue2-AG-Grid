<template>
  <v-dialog v-model="dialog" width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">New Column</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field label="Label*" v-model="label" required></v-text-field>
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
export default {
  props: {
    open: Boolean,
  },
  model: {
    prop: 'open',
  },
  data() {
    return {
      dialog: false,
      label: '',
    }
  },
  methods: {
    onSave() {
      this.$emit('save', this.label)
      this.onClose()
    },
    onClose() {
      if (!this.dialog) return
      this.dialog = false
      this.label = ''
      this.$emit('input', this.dialog)
    },
  },
  watch: {
    open(isOpen) {
      this.dialog = isOpen
    },
    dialog(isOpen, wasOpen) {
      if (!isOpen && wasOpen) {
        this.$emit('input', isOpen)
      }
    },
  },
}
</script>

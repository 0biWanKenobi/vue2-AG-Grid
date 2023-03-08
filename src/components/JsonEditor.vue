<template>
  <codemirror
    v-model="currText"
    @input="onCmCodeChange"
    @ready="onCmReady"
    @focus="clearCmPlaceholder"
    @blur="setCmPlaceholder"
    :options="cmOptions"
  ></codemirror>
</template>

<script>
import { get } from 'vuex-pathify'
import { codemirror } from 'vue-codemirror'
// import base style
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/display/placeholder.js'
import { js as beautifyJs } from 'js-beautify'

const beautifyJsOpts = {
  wrap_line_length: 80,
}

export default {
  components: {
    codemirror,
  },
  props: {
    text: String,
  },
  model: {
    prop: 'text',
  },
  data() {
    return {
      cmPlaceholder: `Header definition in JSON format
        Es.:
        [
          { headerName: 'Make', field: 'make', sortable: true },
          {
            headerName: 'Model',
            children: [{ field: 'name' }, { field: 'spec' }],
          },
          { headerName: 'Price', field: 'price' },
        ]`,
      cmOptions: {
        mode: {
          name: 'javascript',
          json: true,
        },
        theme: 'monokai',
        placeholder: '',
      },
      cmInstance: null,
    }
  },
  computed: {
    columnDefs: get('table/columnDefs'),
    currText: {
      get() {
        return beautifyJs(JSON.stringify(this.columnDefs), beautifyJsOpts)
      },
      set(v) {
        this.$emit('input', v)
      },
    },
  },
  methods: {
    onCmCodeChange(newCode) {
      this.$emit('input', newCode)
    },
    onCmReady(cm) {
      this.setCmPlaceholder()
      this.cmInstance = cm
    },
    setCmPlaceholder() {
      this.$set(this.cmOptions, 'placeholder', this.cmPlaceholder)
    },
    clearCmPlaceholder() {
      this.$set(this.cmOptions, 'placeholder', '')
    },
  },
}
</script>

<style lang="scss">
.CodeMirror {
  border: 1px solid silver;
  pre.CodeMirror-placeholder {
    color: #999;
  }
}
.CodeMirror-empty {
  outline: 1px solid #c22;
  &.CodeMirror-focused {
    outline: none;
  }
}
</style>

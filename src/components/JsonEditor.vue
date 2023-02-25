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
import { sync, get } from 'vuex-pathify'
import { codemirror } from 'vue-codemirror'
// import base style
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/display/placeholder.js'
import { js as beautfyJs } from 'js-beautify'

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
    shouldPrettyPrint: sync('table/shouldPrettyPrint'),
    columnDefs: get('table/columnDefs'),
    currText: {
      get() {
        return JSON.stringify(this.columnDefs)
      },
      set(v) {
        this.$emit('input', v)
      },
    },
  },
  created() {
    this.prettyPrint()
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
    prettyPrint() {
      if (!this.currText) return
      this.currText = beautfyJs(this.currText, beautifyJsOpts)
      this.shouldPrettyPrint = false
    },
  },
  watch: {
    shouldPrettyPrint(isRequested) {
      if (!isRequested) return
      this.prettyPrint()
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

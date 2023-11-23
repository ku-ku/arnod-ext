<template>
    <v-text-field class="jet-input jet-input-string" 
                  v-bind:class="{required: required}"
                  v-show="visible"
                  :type="type || 'text'"
                  :disabled="disabled"
                  :rules="rules"
                  :label="label"
                  v-model="str">
    </v-text-field>
</template>
<script>
import { JetInputBase } from "./JetInputBase";

export default {
    name: 'JetInputString',
    extends: JetInputBase,
    data(){
        return {
        };
    },
    computed: {
        str: {
            get(){
                return this.modelValue;
            },
            set(val){
                this.$emit('update:modelValue', val);
            }
        }
    }
}
</script>
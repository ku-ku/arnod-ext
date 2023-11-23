<template>
    <v-file-input v-if="has('empty')||has('file')"
                class="jet-input jet-input-blob"
                v-model="blob"
                accept="image/*, .pdf, .doc, .xls"
                :label="label"
                density="compact"
                :name="name"
                :disabled="disabled"
                clearable
                show-size
                variant="underlined"
                v-show="visible"
                :prepend-icon="icon()"
                v-on:click:prepend.stop.prevent="preview">
    </v-file-input>
    <v-btn v-else 
           class="jet-input jet-input-blob"
           type='button'
           variant='outlined'
           :download="name"
           :href="href">
        <template v-slot:prepend>
            <v-icon>{{ icon() }}</v-icon>
        </template>
        <template v-slot:append>
            <v-btn size="x-small"
                   variant="text"
                   icon="mdi-close"
                   v-on:click.stop.prevent="$emit('clear')">
            </v-btn>
        </template>
        {{ title }}
    </v-btn>
</template>
<script>
import { computed } from "vue";
import { JetInputBase } from './JetInputBase';
import { humanReadableFileSize } from "vuetify/lib/util/index.mjs";

const EMPTY_FILE = {
  id: null,
  name: null,
  mimeType: null,
  size: null,
  value: null
};

export default {
    name: 'JetInputBlob',
    extends: JetInputBase,
    props: {
        /** 
         * EMPTY_FILE structure | File - object (non-array)
         */
        modelValue: {   
            type: Object
        }
    },
    emits: ['update:modelValue', 'clear'],
    setup(props, { emit }){
        return {
            blob: computed({
                        get: () => {
                            return (!!props.modelValue) ? [props.modelValue] : null;
                        },
                        set: value => {
                            console.log('file', value);
                            if (value?.length > 0){
                                emit('update:modelValue', value[0]);
                            } else {
                                emit('update:modelValue', null);
                            }
                        }
            })
        };
    },
    computed: {
        title(){
            if (this.modelValue){
                return `${ this.modelValue.name } (${ humanReadableFileSize(this.modelValue.size) })`;
            }
            return '';
        },
        name(){
            if (!!this.modelValue){
                let ext = '', 
                    type = this.modelValue.type;
                if ( /(jpe?g)+/.test(type) ){
                    ext = ".jpg";
                } else if ( /(gif)+/.test(type) ){
                    ext = ".gif";
                } else if ( /(png)+/.test(type) ){
                    ext = ".png";
                } else if ( /(excel)+/.test(type) ){
                    ext = ".xls";
                } else if ( /(msword)+/.test(type) ){
                    ext = ".doc";
                } else if ( /(text\/plain)+/.test(type) ){
                    ext = ".txt";
                } else if ( /(pdf)+/.test(type) ){
                    ext = ".pdf";
                }
                return this.modelValue.name + ext;
            }
            return '';
        },
        href(){
            return (!!this.modelValue) ? `/static/model/view/${ this.modelValue.id }` : '';
        }
    },
    methods: {
        has(q){
            switch(q){
                case 'empty':
                    return !this.modelValue;
                case 'file':
                    return this.modelValue instanceof File;
            }
            return false;
        },
        icon(){
            return 'mdi-paperclip'; //TODO: by type
        },
        preview() {
            if ( this.modelValue ) {
                window.open(URL.createObjectURL(this.modelValue));
            }
        }
    }
};
</script>
<style lang="scss">
    .jet-input-blob {
        & .v-input{
            &__prepend{
                margin-inline-end: unset;
            }
        }
        & .v-field{
            &__input{
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
</style>
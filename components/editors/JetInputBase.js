import { empty } from "../../utils";

/**
 * 
 * @type JetInputBase for extending other`s editors
 */
export const JetInputBase = {
    props: {
        type: {
            type: String,
            required: true,
            default: 'unknown'
        },
        label: {
          type: String,
          default: ''
        },
        placeholder: {
          type: String,
          default: ''
        },
        maxLength: {
          type: Number,
          default: 0
        },
        disabled: {
          type: Boolean,
          default: false
        },
        required: {
          type: Boolean,
          default: false
        },
        multiline: {
          type: Boolean,
          default: false
        },
        uri: {
          type: String,
          default: null
        },
        filter: {
          type: String,
          default: null
        },
        editorUri: {
          type: String,
          default: null
        },
        noactions: {
            type: Boolean,
            default: false
        },
        visible: {
            type: Boolean,
            default: true
        },
        modelValue: {   
            type: [String, Boolean, Number, Date, Object]
        }
    },
    emits: ['update:modelValue'],
    computed: {
        name(){
            return this.$attrs.hasOwnProperty('name') 
                   ? this.$attrs.name
                   : (!!this.$vnode) 
                        ? this.$vnode.data.model.expression 
                        : 'unknown';
        },
        rules(){
            let res = [];
            if ( this.required ){
                res.push(val => !empty(val) || "Это поле должно быть заполнено");
            }
            return res;
        }
    },
    methods: {
        change(newVal){}
    }
};  //JetInputBase

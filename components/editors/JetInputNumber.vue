<template>
    <v-text-field class="jet-input jet-input-num"
                  v-bind:class="{required: required}"
                  density="compact"
                  :readonly="disabled"
                  v-show="visible"
                  :label="label"
                  :rules="rules"
                  v-model="num">
    </v-text-field>
</template>
<script>
import { empty } from "../../utils";
import { JetInputBase } from './JetInputBase';
import {Maskito} from '@maskito/core';
import {maskitoNumberOptionsGenerator} from '@maskito/kit';

const _RE_NUM = /[^\d|^\.]/g;

export default {
    name: 'JetInputNumber',
    extends: JetInputBase,
    components: {
        //JetInputBtn
    },
    data() {
        return {
            valid: true,
            maskedInput: null
        };
    },
    computed: {
        num: {
            get(){
                return this.modelValue;
            },
            set(val){
                let n = (typeof val !=="undefined") ? Number( ("" + val).replace(_RE_NUM, '') ) : Number.NaN;
                if ( Number.isNaN( n ) ){
                    n = undefined;
                }
                this.valid = this.required ? (typeof n !== "undefined") : true;
                this.$emit('update:modelValue', val);
            }
        },
        rules(){
            let res = [];
            if ( this.required ){
                res.push(val => !( (val===undefined) || (val===null) || Number.isNaN(val) ) || "Необходимо заполнить");
            }
            return res;
        }
    },
    mounted(){
        this.$nextTick(()=>{
            let opts = {
                        decimalSeparator: '.',
                        thousandSeparator: false,
                        precision: 0
                },
                node = this.$el.querySelector("input");
                
            switch ( this.type ){
                case "currency":
                    opts.precision = 2;
                    break;
                case "float":
                case "number":
                    opts.precision = 4;
                    break;
            }
            this.maskedInput = new Maskito(node, maskitoNumberOptionsGenerator(opts));
        });
    },
    beforeDestroy(){
        if (this.maskedInput){
            this.maskedInput.destroy();
        }
    },
    methods: {
        clear(){
            this.value = undefined;
        },
        change(val){
            this.value = val;
        }
    },  //methods
    watch: {
        modelValue: {
            immediate: true, 
            handler(val) {
                if ( typeof val?.target !== "undefined" ){
                    return;
                }
                if ( ("0" != val) && empty(val) ){
                    this.num = undefined;
                } else {
                    this.num = val;
                }
            }   //handler
        }
    }
};
</script>
<style lang="scss" scoped>
    .jet-input-num{
        max-width: 16rem;
    }
</style>
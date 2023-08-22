<template>
    <v-text-field :label="label"
                  variant="underlined"
                  ref="input"
                  :error="!valid"
                  :readonly="disabled"
                  :name="name"
                  :rules="rules"
                  v-model="text"
                  validate-on="blur"
                  :clearable="!disabled"
                  v-show="visible"
                  v-bind:class="{timed: timed, required: required}">
        <template v-slot:append>
            <v-menu :close-on-content-click="false"
                    close-delay="350"
                    v-model="menu"
                    min-width="320">
                <template v-slot:activator="{ props }">
                    <v-btn icon="mdi-calendar" 
                           size="x-small"
                           v-bind="props"
                           flat>
                    </v-btn>
                    <!--TODO: by picker fixed [v-bind="props"]-->
                </template>
                <v-date-picker v-model="picker"
                               :header="label"
                               :title="label"
                               :readonly="disabled"
                               :multiple="false"
                               show-adjacent-months
                               input-mode="calendar"
                               color="primary"
                               show-current
                               scrollable
                               hide-actions>
                    <template v-slot:header></template>
                </v-date-picker>
            </v-menu>
        </template>
    </v-text-field>
</template>
<script>
import { ref, unref, computed, watch } from "vue";
import { JetInputBase } from './JetInputBase';
import {Maskito} from '@maskito/core';
import {maskitoDateOptionsGenerator, maskitoDateTimeOptionsGenerator} from '@maskito/kit';

import { empty } from "../../utils";

export default {
    name: "JetInputDate",
    extends: JetInputBase,
    props: {
        modelValue: {   
            type: [Date, String]
        }
    },
    setup(props, { emit }){
        const date = toRef(props, 'modelValue'),
              valid = ref(true),
              _s    = ref(null),
              timed = /(time)+$/i.test(props.type),
              format= timed ? "DD.MM.YYYY, HH:mm" : "DD.MM.YYYY";
              
        const _retest = timed ? /^(\d{2}\.\d{2}\.\d{4})+\,?\s(\d{2}:\d{2})+$/ : /^(\d{2}\.\d{2}\.\d{4})+/;
        
        watch(date, ()=>{
            if (date.value){
                _s.value = $moment(date.value).format(format);
                if (typeof date.value === "string"){
                    date.value = $moment(date.value).toDate();
                }
            }
        });
        
        const text = computed({
                        get(){
                            if (date.value){
                                const m = $moment(date.value);
                                return m.isValid() ? m.format(format) : _s.value;
                            }
                            return _s.value;
                        },
                        set(val){
                            console.log('Dt set text', val);
                            _s.value = val?.value ? val.value : val;
                            const _empty = empty(_s.value);
                            if ( _empty ){
                                emit('update:modelValue', null);
                                return;
                            }
                            
                            const m = _retest.test(_s.value) ? $moment(_s.value, format) : $moment.invalid();
                            valid.value = m.isValid();
                            if ( valid.value ){
                                emit('update:modelValue', m.toDate() );
                            }
                        }
        });
        
        return {
            date,
            timed,
            valid,
            format,
            text
        };
        
    },
    data(){
        return {
            menu: false,
            maskedInput: null
        };
    },
    mounted(){
        this.$nextTick(()=>{
            const generator = (this.timed)
                    ? maskitoDateTimeOptionsGenerator({
                        dateMode: 'dd.mm.yyyy',
                        timeMode: 'HH:MM',
                        dateSeparator: '.',
                        timeSeparator: ':'
                    }) 
                    : maskitoDateOptionsGenerator({
                        mode: 'dd.mm.yyyy',
                        separator: '.'
                    }),
            node = this.$el.querySelector("input");
            this.maskedInput = new Maskito(node, generator);
        });
    },
    beforeDestroy(){
        if (this.maskedInput){
            this.maskedInput.destroy();
        }
    },
    computed: {
        rules(){
            const res = [
                val => (!!val) && $moment(val, this.format).isValid() || `Введите корректную дату ${ this.format.toLowerCase() }`
            ];
            if ( this.required ){
                res.push(val => !empty(val) || "Это поле должно быть заполнено");
            }
            return res;
        },
        /**
         * for picker date
         */
        picker: {
            get(){
                return [ this.date ?? new Date() ];
            },
            set(val){
                if (typeof val === "undefined"){ //bug
                    return;
                }
                var val = (val) && Array.isArray(val) && (val.length > 0) ? val[0] : val;
                this.$emit('update:modelValue', val);
                this.$nextTick(()=>{ this.menu = false; });
            }
        }
    },
    methods: {
        reset(){
            this.text = null;
            this.valid = true;
        },
        resetValidation(){
            this.$refs["input"].resetValidation();
        },
        change(newVal){
            console.log('changing', newVal);
            const m = $moment(newVal);
            this.text = m.isValid() ? m.format(this.format) : null;
        }
    }
};
</script>
<style lang="scss" scoped>
    .v-text-field{
        max-width: 12rem;
        &.timed{
            max-width: 16rem;
        }
    }
</style>

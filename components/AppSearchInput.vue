<template>
    <v-form v-on:submit.stop.prevent="search"
            class="h-search"
            action="#">
        <v-text-field density="compact"
                      :hint="hint"
                      :loading="loading"
                      clearable
                      clear-icon="mdi-close"
                      color="primary"
                      placeholder="поиск"
                      v-model="s"
                      v-on:update:modelValue="search">
        </v-text-field>
        <v-btn size="small"
               type="submit"
               flat
               rounded="0"
               :icon="icon">
        </v-btn>
    </v-form>
</template>
<script>
let hTimer = false;

export default {
    name: 'AppSearchInput',
    props: {
        hint: {
            type: String,
            required: false
        },
        icon: {
            type: String,
            required: false,
            default: 'mdi-magnify'
        },
        loading: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    emits: ["search"],
    data(){
        return {
            s: null
        };
    },
    methods: {
        set(q, v){
            switch(q){
                case "value":
                    this.s = v;
                    this.$emit("search", v);
                    break;
            }
        },
        search(e){
            let s = (e)&&((typeof e === 'string' || e instanceof String)) ? e : this.s;
            if (hTimer){
                clearTimeout(hTimer);
            }
            if ( (e?.type)&&("submit"===e.type) ){
                this.$emit("search", s);
            } else {
                hTimer = setTimeout(()=>{ this.$emit("search", s); }, 2700);
            }
        }
    }
}
</script>
<style lang="scss">
    .h-search{
        min-width: 12rem;
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        margin: 0 1rem;
        flex-wrap: nowrap;
        justify-content: flex-start;
        &:has(input:focus){
            min-width: 18rem !important;
        }
        & .v-field {
            &__clearable {
                align-items: center;
                & .v-icon.v-icon--size-default {
                    font-size: 0.85rem !important;
                }
            }
            &__input{
                & input {
                    transition: min-width 0.33s ease;
                    min-width: 10rem !important;
                    &:focus{
                        min-width: 16rem !important;
                    }
                }
            }
        }
    }
</style>
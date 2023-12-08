<template>
    <teleport to="body">
        <v-snackbar v-model="hasSnackbar"
                    class="jet-app-snackbar"
                    dark
                    multi-line
                    :color="args.color"
                    :timeout="args.timeout">
                <div class="text-right">
                    <v-btn size="x-small"
                           append-icon="mdi-close"
                           class="ml-auto jet-app-snackbar__close"
                           v-on:click.stop.prevent="hasSnackbar = false"
                           variant="text"
                           text="закрыть">
                    </v-btn>
                </div>    
                <div v-html="args.text"></div>
                <div class="jet-app-snackbar__btn"
                     v-if="args.click">
                    <v-btn size="small"
                           :color="args.color"
                           v-on:click.stop.prevent="args.show = false; args.click(true);"
                           v-html="args.click_title || 'OK'">
                    </v-btn>
                </div>
        </v-snackbar>
    </teleport>
</template>
<script>
import { ref } from "vue";

const _MSG_DEFS = {
    color: "transparent",
    timeout: 6000,
    text: null,
    click: undefined,
    show: false,
    click_title: undefined
};


export const appMsgArgs = ref({ ..._MSG_DEFS });

export default {
    name: 'AppMsg',
    computed: {
        args() {
            return appMsgArgs.value;
        },
        hasSnackbar: {
            get(){ 
                return !!this.args.show;
            },
            set(val){
                if (!val){
                    if (this.args.click){
                        this.args.click(false);
                    }
                    appMsgArgs.value = { ..._MSG_DEFS };
                } 
            }
        }
    }
};
</script>    
<style lang="scss">
    .jet-app-snackbar{
        & .v-snack__wrapper{
            max-width: calc(100% - 42px) !important;
            & .v-snack__content{
                font-size: 0.85rem;
                line-height: 1.125;
            }
        }
        &__btn {
            padding: 0.5rem 0;
            margin-top: 1rem;
            text-align: right;
        }
        & .v-btn.jet-app-snackbar__close{
            margin-top: -16px;
            margin-right: -16px;
/*            
            top: -14px;
            right: -12px;
            color: #f2f2f2;
            background: #f2f2f2;
            border: 1px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.18);
            z-index: 999999;
*/            
        }
    }
</style>

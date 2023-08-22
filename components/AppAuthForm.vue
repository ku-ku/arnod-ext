<template>
    <v-container class="jet-auth__conte"
                 v-bind:class="{'success': has('user'), 'error': has('error')}">
        <v-row class="fill-height" 
               justify="center" align="center">
            <v-col cols="11" md="6">
                <v-form v-on:submit.stop.prevent="onauth"
                        fast-fail
                        ref="form">
                    <v-card class="elevation-3 pa-3">
                        <v-card-title>
                            <div class="form-icon">
                                <v-icon>
                                    {{ has('user') ? 'mdi-account': has('error') ? 'mdi-account-cancel' : 'mdi-account-lock'}}
                                </v-icon>
                            </div>
                            <div class="form-title">
                                {{ names.name }}
                                <div class="text-caption">
                                    {{ user.name || "пожалуйста авторизуйтесь" }}
                                </div>
                            </div>
                        </v-card-title>
                        <v-card-text>
                            <v-text-field
                                label="Телефон"
                                clearable
                                v-model="user.tel"
                                name="tel"
                                type="tel"
                                autofocus
                                :rules="[rules.empty]"
                                required
                                autocapitalize="off"
                                autocomplete="on"
                                validate-on="blur"
                                v-on:update:modelValue="ontel">
                                <template v-slot:prepend-inner>
                                    <v-icon>mdi-cellphone</v-icon>(+7)
                                </template>
                            </v-text-field>
                            <v-expand-transition>
                                <v-text-field
                                    label="Код"
                                    type="password"
                                    :rules="[rules.empty]"
                                    name="code"
                                    v-show="has('id')"
                                    v-model="user.code"
                                    autocomplete="current-password"
                                    prepend-inner-icon="mdi-asterisk">
                                </v-text-field>
                            </v-expand-transition>
                            <v-alert color="warning" 
                                     dark 
                                     class="my-5" 
                                     icon="mdi-alert"
                                     v-if="has('error')">
                                <div v-html="error"></div>
                            </v-alert>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn variant="flat"
                                   prepend-icon="mdi-chevron-left"
                                   color="transparent"
                                   size="small"
                                   v-on:click="$emit('back')">
                            </v-btn>
                            <v-btn type="submit" 
                                   width="12rem"
                                   :loading="pending.value"
                                   :color="has('user') ? 'primary' : 'amber-darken-4'"
                                   variant="elevated">
                                <template v-if="has('subject')">
                                    <v-icon>mdi-check-circle-outline</v-icon>&nbsp;ok
                                </template>
                                <template v-else>войти</template>
                            </v-btn>
                        </v-card-actions>
                        <v-footer>
                            <v-spacer />
                            {{ names.server }}
                        </v-footer>
                    </v-card>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import { ref } from "vue";
import { empty } from "../utils";
import * as profile from "../composables/profile";
import { settings, save as saveSettings } from "../composables/settings";

const USER_DEFS = {
    id: null,
    name: undefined,  //user title
    _tel:  undefined,
    code: undefined
};

const rules = {
    empty: val => !empty(val) || "Необходимо заполнить"
};

export default {
    name: "AppAuthForm",
    async setup(props, { emit }){
        let pending = ref(true);
        const user = ref({...USER_DEFS});
        
        setTimeout(async ()=>{
            let ok = false;
            
            if ( !ok && (settings.local?.user) ){
                user.value.name = settings.local.user.name;
                user.value.tel  = settings.local.user.tel;
                if (!empty(user.value.tel)){
                    $jet.isHydrating = false;
                    refreshNuxtData("user-id");
                }
            }
            
        }, 666);

        const {data, error} = useAsyncData('user-id', ()=>{
            return new Promise((resolve, reject)=>{
                if ( user.value.id > 0){
                    resolve(user.value.id);
                    return;
                }
                if ( empty(user.value.tel) || (user.value.tel?.length < 10) ){
                    resolve(-1);
                    return;
                }
                pending.value = true;
                let tel = /^(\+?7|8)+/.test(user.value.tel) ? user.value.tel : '+7' + user.value.tel;
                profile.checktel(tel).then( res =>{
                    pending.value = false;
                    if ( res.success ){
                        user.value.id = res.result.user_id;
                        resolve(user.value.id);
                    } else {
                        throw {message: res.error};
                    }
                }).catch(e => {
                    pending.value = false;
                    reject(e);
                });
            });
        });
        
        return {
            user,
            pending,
            error
        };
    },
    emits: ['auth', 'error'],
    data(){
        return {
            rules
        };
    },
    mounted(){
        setTimeout(()=>{
            $(`.jet-auth__conte input[name=${this.has('id') ? 'code': 'tel' }]`).focus();
        }, 1000);
    },
    computed: {
        names(){
            return settings.names;  //TODO:
        },
        subject(){
            return profile.subject;
        }
    },
    methods: {
        has( q ) {
            switch(q){
                case 'id':
                    return (this.user.id || 0) > 0; 
                case 'subject':
                    return !empty(this.subject?.token);
                case 'user':
                    return !empty(this.user.id); 
                case 'error':
                    return !empty(this.error); 
            }
            return false;
        },  //has
        async ontel(){
            if ( this.user.tel?.length < 10 ){
                return;
            } 
            this.error = null;
            this.user.id = -1;
            try {
                $jet.isHydrating = false;
                await refreshNuxtData("user-id");
            } catch(e){
                console.log('ERR (ontel)', e);
                if ( 
                        /(not)+\s(def)+/.test(e.message)
                     || /(no)+\s(resul)+/gi.test(e.message)
                   ){
                    this.error = `пользователь ${ this.user.tel } не найден`;
                } else {
                    this.error = e.message || e;
                }
            } finally {
                this.pending = false;
            }
        },
        async onauth(e){
            this.error = null;
            this.pending = true;
            try {
                const { valid } = await this.$refs["form"].validate();
                if (!valid){
                    throw {message: 'Введите Ваши данные для авторизации'};
                }
                const res = await profile.auth(this.user);
                if (res){
                    if ( res.error?.value ){
                        throw res.error.value;
                    }
                    this.user.id = res.id; 
                    this.user.name = res.name; 
                    saveSettings({user: {tel: this.user.tel, name: res.name}});
                } else {
                    throw  {message: 'Неизвестная ошибка авторизации - попробуйте еще раз'};
                }

            } catch(e) {
                console.log('ERR (auth)', e);
                this.error = e.message;
                if ( /(no)+\s(res)+/gi.test(e.message) ){
                    this.error = `Неверное имя пользователя <b>"${this.user.u}"</b> или пароль.<br />Доступ запрещен`;
                } 
            } finally {
                if (this.error){
                    this.$emit('error', this.error);
                } else {
                    this.$emit('auth');
                }
            }
            return false;
        }   //onauth
    }
};
</script>
<style lang="scss">
    .jet-auth{
        &__conte{
            & .v-row{
                min-height: calc(100vh - 56px);
                align-content: center;
                align-items: center;
                justify-content: center;
            }
            & .v-card {
                background-color:#fff8e1;
                &-title{
                    text-transform: uppercase;
                    font-weight: 300;
                    font-size: 1.125rem;
                    display: flex;
                    word-break: break-word;
                    white-space: normal;
                    line-height: 1.25;
                    align-content: center;
                    align-items: center;
                    justify-content: center;
                    padding-bottom: 3rem;
                    & .v-icon{
                        color: #ffa000;
                        border-color: #ffa000;
                        line-height: 1 !important;
                        margin-right: 1rem;
                        border-radius: 500px;
                        padding: 0.25rem;
                        color: #999;
                        border: 1px solid #ccc;
                        width: 3rem;
                        text-align: center;
                        height: 3rem;
                    }
                }
                &-text{
                    & .v-field{
                        &__prepend-inner{
                            font-size: 0.75rem;
                            align-content: center;
                            align-items: center;
                        }
                    }
                    & .v-input{
                        & .v-icon{
                            color: #999;
                            margin-right: 0.5rem;
                            font-size: 0.75rem;
                            align-self: center;
                        }
                    }
                }
                & .v-card-actions{
                    align-items: center;
                    justify-content: center;
                    & .v-btn{
                        margin-bottom: 1rem;
                    }
                }
                & .v-alert{
                    line-height: 1.125;
                }
            }   /* .v-card */
            &.error{
                & .v-card{
                    background-color:#ffecb3;
                    &-title{
                        & .v-icon{
                            color: #d84315; /*deep-orange-darken-3*/
                            border-color: #d84315;
                        }
                    }
                }
            }   /* .error */
            & .v-footer{
                font-size: 0.7rem;
                background: transparent;
            }   /* .v-footer */
        }       /* __conte */
    }           /* .jet-auth */
    
</style>



/**
 * Ext for app-level component
 * Globals:
 * 1. vuetify adding
 * 2. jQuery  adding
 * 3. moment  adding
 */
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader';
import { VDatePicker } from 'vuetify/labs/VDatePicker';
import { VDataTable } from 'vuetify/labs/VDataTable';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { settings, read as settingsRead } from "./composables/settings.js";
import { profile } from "./composables/profile.js";
import { en, ru } from 'vuetify/locale';
import { VuetifyDateAdapter } from 'vuetify/labs/date/adapters/vuetify';
import { appMsgArgs } from "./components/AppMsg.vue";
import moment from "moment";
moment.locale("ru");
moment.prototype.fromSql = s => {
    return (!!s) ? moment(s, s.length < 11 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss') : null;
};

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

import jQuery from 'jquery';
window.jQuery = jQuery;
window["$"] = jQuery;
window["$moment"] = moment;


import { api } from "./http";

/**
 * @params {nuxtApp} app - nuxt context
 */
export default async function( app ){

    /**
     * Vuetify init
     */
    const vuetify = createVuetify({
        ssr: false,
        locale: {
            locale: 'ru',
            fallback: 'en',
            messages: { ru, en }
        },
        date: {
            adapter: VuetifyDateAdapter
        },
        components: {
                    ...components, 
                    VSkeletonLoader,
                    VDatePicker,
                    VDataTable
        },
        directives,
        defaults: {
            VTextField: { variant: "underlined" },
            VCombobox: { variant: "underlined" },
            VAutocomplete: { variant: "underlined" },
            VTextarea: { variant: "underlined" },
        },
        options: { customProperties: true },
        theme: {
            defaultTheme: 'light',
            themes: {
                dark: {
                    colors: {
                    }                    
                },
                light: {
                    colors: {
                        primary: "#4caf50"  /*green*/
                    }
                }
            }
        },
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
                mdi
            }      
        }
    });
    
    if ( typeof app.vueApp !== "undefined" ){
        app.vueApp.use(vuetify);
    } else {
        console.warn("Vue-app is undefined!");
    }
    
    /**
     * Messages by snackbar
     * @param {Object} args {text, color, timeout, click} - see components\JetMsg.vue
     * 
     */
    app.msg = args => {
        let msg = Object.assign({
            color: "primary",
            timeout: 6000
        }, args);
        msg.show = (
                        (typeof msg.text !== "undefined") 
                     && !/^$/.test(msg.text)
                    ) ? (new Date()).getTime() : false;
            appMsgArgs.value = msg;
    };
    
    /**
     * Messages in footer
     * @param {String | Object} hint message or empty
     */
    app.hint = s => {
        let node = document.querySelector(".v-footer .jet-hint"),
            _s = (s) ? ((typeof s === 'string') || (s instanceof String)) ? s : s.hint : '';
        if (node){
            node.innerHTML = _s;
            if (s.timeout){
                setTimeout(()=>{
                    node.innerHTML = "";
                }, s.timeout);
            }
        }
    };
    
    const config = useRuntimeConfig();
    
    /**
     * Networking
    app.rpc = rpc;
    */
    app.api = api;
    
    /**
     * Worker for local DB read/write 
     * b/e rpc pooling
     */
    const worker = new Worker(new URL('./ws.js', import.meta.url), {type: 'module'} );
    worker.addEventListener("message", e => {
        console.log('message(worker)', e);
        const { type } = e.data;
        switch (type){
            case "lost":
                app.msg({ text: "Потеряна связь с сервером - попробуйте обновить страницу", color: "black", timeout: 20000 });
                break;
            case "location":
                if (typeof app.ontelemetry !== "undefined"){
                    app.ontelemetry(e.data);
                }
                break;
            case "read":
                settings.local = e.data.settings;
                console.log("readed settings", e.data);
                if (typeof app.onsettings !== "undefined"){
                    app.onsettings();
                }
                break;
        }
    });
    app.worker = worker;
    worker.postMessage({ type:"init", env: JSON.stringify(config.public) });
    setTimeout(()=>{
        worker.postMessage({ type:"read", name: "settings" });
    }, 300);
    
    app.onuser = ()=>{
        if (
                (profile.subject)
             && (profile.token)
           ){
                const tokens = {
                    "X-Service-Token": config.public._X_SERV_TOKEN,
                    "X-Auth-Token": profile.token
                };
                worker.postMessage({ type:"tokens", tokens });
           }
    };
    
};
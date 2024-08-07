import { empty } from "./utils";
import { profile } from "./composables/profile";

/**
 * public API calling
 * @param {Object|String} opts = {url, ...}
 * @returns {Promise}
 */
export function api(opts){
    const config = useRuntimeConfig();
    const {public: urls} = config;
    var url, opts = opts || {};
    if (
            (typeof opts === "string")||(opts instanceof String)
        ) {
        url = opts;
        opts = undefined;
    } else {
        if ( /(telemetry)+/.test(opts.method || 'xxx$xxx') ){
            url = urls.telemetry;
            opts = {
                method: "POST",
                body: opts
            };
        } else {
            url = `${ urls.api }${ opts.url }`;
            delete opts.url;
        }
    }
    
    if ( !opts.headers ){
        opts.headers = {};
    }
    
    opts.headers["X-Service-Token"] = urls._X_SERV_TOKEN;
    
    if ( !empty(profile.token) ){
        opts.headers["X-Auth-Token"] = profile.token;
        if (opts.jsonrpc){
            opts.headers["X-User-Token"] = profile.token;
        }
    }
    
    opts.onResponseError = e => {
        api.$errm = e.response?._data?.error;
    };
    api.$errm = undefined;
    
    if ( /(this)+/.test(url) ){
        url = url.replace(/(this)+/, window.location.hostname);
        /* rm port for local ip */
        if ( /(\:\/\/192\.)+/.test(url) ){
            url = url.replace(/(:\d{2,5})+/g, '');
        }
    }
    
    return $fetch(url, opts);
}   //api


import { reactive, computed  } from "vue";
import { empty } from "../utils";
import { settings, save as saveSettings } from "./settings";
import { api } from "../http";


const _STUB_RE = /^(catfish)$/i;

export const profile = reactive({
    subject: null,
    tenant: computed( ()=>{ return profile.subject?.tenant; } ),
    token: computed( ()=>profile.subject?.token ),
    hasrole: name => {
        const re = new RegExp(`^(${ name })+`, 'gi');
        let res = false;
        if (profile.subject?.roles){
            profile.subject.roles.forEach( r => {
                if ( re.test(r.title) ){
                    res = true;
                }
            });
        }
        return res;
    },
    isauth: computed( ()=> profile.subject?.roles?.length > 0 )
});

/**
 * Pre-auth by QR-code hash (payload) or token (from Settings)
 * @param(String): mark - hash for getting token
 */
export const preauth = async () => {
        return new Promise(async (resolve, reject) => {
            
            let at = null;  //token
            
            if (settings.local?.token){
                at = settings.local.token;
            }
            
            if ( !at ){
                reject({message: 'No access'});
            } else {
                try {
                    const res = await api({
                        url: '/mobile/driver/auth/self',
                        headers: {
                            "X-Auth-Token": at
                        }
                    });
                    console.log('try it', res);
                    
                    if (res.success) {
                        const data = res.result;
                        const subject = {
                            id: data.id,
                            phone: data.phone,
                            token: at,
                            name: data.full_name,
                            tenant: data.organization,
                            roles: data.roles
                        };
                        profile.subject = subject;
                        const app = useNuxtApp();
                        if (app.onuser){
                            app.onuser();
                        }
                        resolve(subject);
                    } else {
                        throw r.error;
                    }
                } catch(e) {
                    console.log('ERR (preauth)', e);
                    reject(e);
                }
            }
    }); 
    
};  //preauth

export const checktel = async tel => {
    const res = await api({
                    url: '/mobile/driver/auth/login/phone',
                    method: 'POST',
                    body: {
                            phone: tel
                    }
                });
    if ( res.success ){
        let s = (profile.subject?.id!==res.result.user_id) 
                    ? {id: res.result.user_id} 
                    : profile.subject || {id: res.result.user_id};
        profile.subject = s;
    }
    return res;
}


export const auth = async user => {
    return new Promise(async (resolve, reject) => {
        let res;
        try {
            await logout();
            
            if (/^\S+@\S+$/.test(user.tel) ){  //by login/passw
                res = await api({
                    url: '/auth/login/email',
                    method: 'POST',
                    body: {
                            email: user.tel,    //гы
                            password: user.code
                    }
                });
            } else {                                //by tel/code
                res = await api({
                    url: '/mobile/driver/auth/confirm/code',
                    method: 'POST',
                    body: {
                            code: user.code,
                            user_id: user.id
                    }
                });
            }

            if (!res.success){
                throw res.error;
            }

            let data = res.result;
            if ( data ) {
                user.token = data.token
                res = await api({
                    url: '/mobile/driver/auth/self',
                    headers: {
                        "X-Auth-Token": user.token
                    }
                });
                
                if (res.success){
                    data = res.result;
                    user.name  = data.full_name;
                    user.tenant= data.organization;
                    user.roles = data.roles;
                } else {
                    throw res.error;
                }
                
                profile.subject = user;
                
                if ( 
                        (user.token)
                     && !_STUB_RE.test(user.name)
                   ){
                    saveSettings({token: user.token});
                }
                
                const app = useNuxtApp();
                if (app.onuser){
                    app.onuser();
                }
                
                resolve(user);
            } else {
                throw { message: 'Неизвестная ошибка, авторизация не выполнена' };
            }
        } catch(e){
            profile.subject = null;
            reject(e);
        }
    });
};

export const logout = async () => {
    try {
        saveSettings({token: {access: "bad"}}); //clean saved auth-token
    }catch(e){
        console.log('ERR(logout)', e);
    } finally{
        document.cookie =  "PHPSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        profile.subject = null;
    }
};  //logout

export const get = q => {
    switch(q){
        case "has-subject":
            if (profile.subject?.token){
                return !(_STUB_RE.test(profile.subject.name));
            }
            return false;
        case "subject":
            return get("has-subject") ? profile.subject : null;
        case "tenant":
            return get("has-subject") ? profile.tenant : null;
        case "title":
            return profile.tenant?.title || '';
        case "roles":
            return profile.subject?.roles || {};
    }
    
    return false;
};
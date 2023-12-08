const __DEFINES__ = {};
import '/@vite/env';

/**
 * Web-worker for:
 * 1. BE-test connection, TODO: move base worker
 * 2. Data-caching by indexedDB 
 * 
 */
const _IDB_NAME = "arnod";
      
let dbPromise = null;
/**
 * ENV-context
 * @type type
 */
let env = null;

/** 
 * BroadcastChannel - communication (see init)
 * @type BroadcastChannel
 */
let bc  = null;

/**
 * Session token`s for pooling
 * {X-Auth-Token, X-Service-Token}
 * @type Object
 */
let toks = null;

const on_bc_message = e => {
    console.log('worker(channel)', JSON.stringify(e));
    switch (e.data.type) {
        case "init":
            if ( (typeof e.data.env === "string")||(e.data.env instanceof String) ){
                eval(`env = ${ e.data.env }`);
            } else {
                env = e.data.env;
            }
            bc = new BroadcastChannel(env.channel);
            bc.addEventListener("message", on_bc_message);
            idbOpen();
            break;
        case "tokens":
            toks = e.data.tokens;
            env.hTimer = setInterval(_ping, 5*60*1000);
            break;
        case "read":
            idbRead(e.data);
            break;
        case "save":
            idbSave(e.data);
            break;
    }
};  //on_bc_message

/** 
 * Basic-message communucition (for init)
 * @type type
 */
self.addEventListener('message', on_bc_message); 

/**
 * Test communication
 * @returns {undefined}
 */
const _ping = ()=>{
    if ( !env || !toks ){
        return;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const url = `${ env.api }${env.selfUrl || '/mobile/driver/auth/self'}`;
    
    fetch(url, {
        signal: controller.signal,
        headers: toks
    }).then( res => {
        clearTimeout(timeoutId);
        if (!res.ok) {
            throw new Error("Network response was not OK");
        }
    }).catch( error => {
        console.log('ERR (self)', error);
        postMessage({
            type: "lost",
            error
        });
    });
};

const idbOpen = ()=>{
    let db = null;
    dbPromise = new Promise( (resolve, reject)=>{
        if (typeof indexedDB === "undefined"){
            reject({error: "No indexedDB available"});
        } else if ( db ){
            resolve(db);
        } else {
            const req = indexedDB.open(_IDB_NAME, 2);
            req.onsuccess = e => {
                db = req.result;
                resolve(db);
            };
            req.onerror = e => {
                console.log('ERR (db)', e);
                reject({error:"ERR: can`t IDB open"});
            };
            req.onupgradeneeded = e => {
                db = e.target.result;
                db.createObjectStore("info");
                resolve(db);
            };    
        }
    });
};  //idbRead

const idbRead = async ( { name } )=>{
    try {
        if (!dbPromise) {
            throw { message: `no database ${_IDB_NAME} available for reading "${ name }"` };
        }
        const db = await dbPromise;

        const obs = db.transaction("info").objectStore("info");
        const res = obs.get(name);

        res.onsuccess = e => {
            const o = {success: true, type: "read"};
            o[name] = e.target.result;
            postMessage( o );
            bc.postMessage( o );
        };
        res.onerror = e => {
            console.log(`ERR on read "${name}"`, res, e);
        };
    } catch(e){
        console.log(`ERR on read "${name}"`, e);
    }
};  //readData

const idbSave = async data => {
    try {
        if (!dbPromise) {
            throw { message: `no database ${_IDB_NAME} available for saving data` };
        }
        const db = await dbPromise;
        const obs = db.transaction("info", "readwrite").objectStore("info");
        try {
            obs.delete(data.name);
        }catch(e){}
        
        const res = obs.add(data.data, data.name);
        res.onerror = e => {
            console.log('(ERR) (worker-saving):', e);
        };
    } catch(err){
        console.log('(ERR) (worker-saving):', err);
    }
    
};  //idbSave
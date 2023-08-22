import { reactive, computed, toRaw } from 'vue';

/**
 * Local settings: {
 *  at: last-modified
 *  tokens: access/refresh
 * }
 * @type Object
 */
export const settings = reactive({
    local: null,
    at: computed(()=>{
        return settings.local?.at;
    }),
    names: computed(()=>{
        return {
            description: ''
        };
    })
});

/**
 * 
 * @type BroadcastChannel
 */
let channel = null;

/**
 * Reading local settings by worker
 * @returns {read}
 */
export const read = () => {
    const {public: config} = useRuntimeConfig();
    var channel = $jet.worker;
    if (!channel){
        channel = new BroadcastChannel(config.channel);
        channel.addEventListener("message", e => {
            const { type } = e.data;
            if ("read"===type) {
                if (e.data.settings){
                    settings.local = e.data.settings;
                }
            }
        });
    }
    channel.postMessage({type:"read", name: "settings"});
};  //read

export const save = data => {
    var channel = $jet.worker;
    if (channel) {
        if (!settings.local){
            settings.local = {};
        }
        if (data){
            Object.keys(data).forEach( k => {
                settings.local[k] = data[k];
            });
        }
        
        let _data = toRaw(settings.local);
        _data.at = new Date();
        channel.postMessage({type:"save", name: "settings", data: _data});
    }
};  //save
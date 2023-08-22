import { reactive, computed } from "vue";
import { empty } from "../utils";

let hTimer = null;

const _watch = clbk => {
    
    const _by_ip = ()=>{
        $.ajax({
            url: 'http://api.sypexgeo.net/json/',
            crossDomain: true
        }).then( res => {
            if (
                    (empty(res.error))
                 && (res.city)
               ){
                geo.coords = {
                    latitude: res.city.lat,
                    longitude: res.city.lon,
                    timestamp: res.timestamp,
                    fine: false
                };
                clbk(geo.coords);
            }
        }).catch(e =>{
            geo.coords = {
                timestamp: 0,
                error: e
            };
        });
    };
    
    navigator.geolocation.getCurrentPosition(location => {
            geo.coords = location.coords;
            geo.coords.timestamp = location.timestamp;
            geo.coords.fine = true;
            clbk(geo.coords);
        }, err => {
            console.log('ERR (geolocation)', err);
            _by_ip();
        },
        {maximumAge: 180000, timeout: 5000, enableHighAccuracy: false}
    );
};  //_watch

export const geo = reactive({
    coords: {
        timestamp: 0
    },
    watch(clbk){
        if (!hTimer){
            hTimer = setInterval(()=>{
                _watch(clbk);
            }, 300*1000);
        }
        _watch(clbk);
    }
});

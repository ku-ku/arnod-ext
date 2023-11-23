import { reactive, computed } from "vue";
import { empty } from "../utils";
import * as olSphere from 'ol/sphere';

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
    },
    async current(){
        return new Promise((resolve, reject)=>{
            _watch( e => {
                if (e.error){
                    reject(e.error);
                } else {
                    resolve(e);
                }
            });
        });
    },
    async addr(ll){
        return new Promise( (resolve, reject) => {
            if ( 
                    (!!ll)
                 && (Number(ll.latitude) != 0)
                 && (Number(ll.longitude) != 0)
               ){
                $.getJSON(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${ ll.latitude }&lon=${ ll.longitude }&zoom=18&addressdetails=1`)
                        .then(res => {
                            resolve(res);
                        })
                        .catch(e => {
                            reject(e);
                        });
            } else {
                reject({message: 'no-coords'});
            }
        });
    },   //addr
    /**
     * @param {Object} ll1 - coords at {lat,lon}
     * @param {Object|undefined} ll2 - coords to {lat,lon} (undefined - using current)
     */
    distance(ll1, ll2){
        var ll2 = !!ll2 ? ll2 : geo.coords;
        /**shorting*/
        if (ll1.latitude){
            ll1.lat = ll1.latitude;
            ll1.lon = ll1.longitude;
        }
        /**shorting*/
        if (ll2.latitude){
            ll2.lat = ll2.latitude;
            ll2.lon = ll2.longitude;
        }
        return olSphere.getDistance([ll1.lon, ll1.lat], [ll2.lon, ll2.lat]);
    }   //distance
});

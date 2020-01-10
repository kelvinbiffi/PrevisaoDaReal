/**
 * Handle the API calls and show the whether info
 */
class PrevisaoDaReal {
    /**
     * Contructor function
     */
    constructor () {
        this.getIPFromCF();
        this.city;
        this.whether;
    }

    /**
     * Get data from remote url
     * 
     * @param {String} url Remote URL
     * 
     * @return {Promise}
     */
    getData(url) {
        return fetch(url)
        .then(x => x.json())
        .catch(error => {
            console.warn('An error ocurred in your fetch request: ' + error);
        });
    }
    

    /**
     * Tries to get data from local storage before calling external API.
     *
     * @param {String} key Remote URL
     * @param {Integer} ttl Cache time-to-live in minutes
     * 
     * @return {JSON}
     */
    getDataFromCache(key, ttl) {
        let expiresKey = `${key}_expires`;
        let expires = localStorage.getItem(expiresKey);
        let now = (new Date()).getTime();

        if (expires !== null) {
            if (expires > now) {
                let data = localStorage.getItem(key);

                if (data !== null) {
                    try {
                        data = JSON.parse(data);
                        return Promise.resolve(data);
                    } catch (e) {
                        console.warn('Local cache data is corrupted:', key);
                    }
                }
            } else {
                console.warn('Local cache data is expired:', key);
            }
        } else {
            console.warn('Data does not exist in local cache:', key);
        }

        expires = (new Date(now + (1000 * 60 * ttl))).getTime();

        return this.getData(key).then(data => {
            if (typeof data !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(data));
                localStorage.setItem(expiresKey, expires);
            } else {
                console.warn('Remote data is corrupted:', key);
            }
            return data
        });
    }

    /**
     * Get IP and City Information
     */
    async getIPFromCF () {
        const cityInfo = await this.getDataFromCache('http://www.geoplugin.net/json.gp', 60);
        this.getWhetherByIP(cityInfo);
    }

    /**
     * Get whether information
     * 
     * @param {JSON} cityInfo 
     */
    async getWhetherByIP (cityInfo) {
        const URL = `http://api.openweathermap.org/data/2.5/weather?lat=${cityInfo.geoplugin_latitude}&lon=${cityInfo.geoplugin_longitude}&APPID=3d9543d41cc5c347c206faa9de23d798`;
        const whetherInfo = await this.getDataFromCache(URL, 5);
        this.city = cityInfo;
        this.whether = whetherInfo;
        console.log(this);
    }

}

new PrevisaoDaReal();
/**
 * Handle the API calls and show the whether info
 */
class PrevisaoDaReal {
    /**
     * Contructor function
     */
    constructor () {
        this.getIPFromCF();
        this.cache = {
            body:  document.querySelector('body'),
            spinnerContent: document.querySelector('.spinner-content'),
            mainContent:  document.querySelector('main .content'),
            sensacao: document.querySelector('.whether-info .sensacao'),
            temperatura: document.querySelector('.whether-info .temperatura'),
            humidade: document.querySelector('.whether-info .humidade'),
            daReal: document.querySelector('.whether-info .da-real'),
        }
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
        const cityInfo = await this.getDataFromCache('https://ipapi.co/json/', 60);
        this.getWhetherByIP(cityInfo);
    }

    /**
     * Get whether information
     * 
     * @param {JSON} cityInfo 
     */
    async getWhetherByIP (cityInfo) {
        const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${cityInfo.latitude}&lon=${cityInfo.longitude}&APPID=3d9543d41cc5c347c206faa9de23d798&units=metric`;
        const whetherInfo = await this.getDataFromCache(URL, 5);
        this.getTerms(cityInfo, whetherInfo);
    }

    /**
     * Get avatar for the whether
     * 
     * @param {JSON} city 
     * @param {JSON} whether 
     */
    async getTerms (city, whether) {
        console.log(city,whether);
        const terms = await this.getDataFromCache('js/previsao.json', 1);
        console.log(terms);

        this.cache.sensacao.textContent = `Sensação térmica: ${whether.main.feels_like} °C`;
        this.cache.temperatura.textContent = `Mínima: ${whether.main.temp_min} °C, Máxima: ${whether.main.temp_max} °C`;
        this.cache.humidade.textContent = `Umidade ${whether.main.humidity}%`;

        let avatar, frase;
        if (whether.main.feels_like < 12) {
            avatar = terms.avatar.frio;
            frase = terms.frase.frio;
        } else if (whether.main.feels_like >= 12 && whether.main.feels_like < 22) {
            avatar = terms.avatar.fresco;
            frase = terms.frase.fresco;
        } else {
            avatar = terms.avatar.calor;
            frase = terms.frase.calor;
        }

        this.cache.daReal.textContent = '"'+frase[Math.floor(Math.random()*frase.length)]+'"';
        avatar = avatar[Math.floor(Math.random()*avatar.length)];
        const img = document.createElement('img');
        img.src = avatar.image;
        this.cache.body.style.backgroundColor = avatar.color;
        this.cache.mainContent.insertAdjacentElement('afterBegin', img);

        setTimeout(() => {
            this.cache.body.classList.add('show');
        }, 2000);
    }

    showInfoScreen () {

    }

}

new PrevisaoDaReal();
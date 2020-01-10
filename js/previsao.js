/**
 * Handle the API calls and show the whether info
 */
class PrevisaoDaReal {
    constructor () {
        this.getIPFromCF();
    }

    /**
     * Get IP and City Information
     */
    getIPFromCF () {
        // Check if IP is Already Got
        let IP = localStorage.getItem('IP');
        if (IP) {
            this.getWhetherByIP(JSON.parse(IP));
        } else {
            fetch('http://www.geoplugin.net/json.gp').then(function(response) {
                if(response.status == 200) {
                    const reader = response.body.getReader();
                    return new ReadableStream({
                        start(controller) {
                            return pump();
                            function pump() {
                            return reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                controller.enqueue(value);
                                return pump();
                            });
                            }
                        }
                    })
                } else if(res.status == 400) {
                    console.log(JSON.stringify(response.body.json()));
                }
            })
            .then(stream => new Response(stream))
            .then(response => response.blob())
            .then(blob => blob.text())
            .then(text => {
                localStorage.setItem('IP', text);
                this.getWhetherByIP(JSON.parse(text));
            })
            .catch(err => console.error(err));
        }
    }

    getWhetherByIP (cityInfo) {
        console.log(cityInfo);
    }

}

new PrevisaoDaReal();
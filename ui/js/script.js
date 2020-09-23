import { TouchUi } from './touchui.js';
import { SpeechUi } from './speechui.js';


class InteractionLogic {
    constructor() {                
        this.speechUi = new SpeechUi();
        this.touchUi = new TouchUi();
        let $this = this;

        // Connect UI/DOM events
        $("#voice-command-button").on("click", function() {
            $this.speechUi.toggle();
            $this.touchUi.setVoiceCommandButtonState($this.speechUi.state);
        });

        // Connect speech UI events
        this.speechUi.events.register("weatherInfo", function() { $this.getWeatherInfo() });        
        this.speechUi.events.register("currentTimeInfo", function() { $this.getCurrentTimeInfo() });        
        this.speechUi.events.register("etaInfo", function() { $this.getEtaInfo() });               
        this.speechUi.events.register("speechStart", function() { $this.touchUi.setVoiceCommandButtonState(2) }) // 2: listening
        this.speechUi.events.register("speechEnd", function() { $this.touchUi.setVoiceCommandButtonState(1) }) // 1: enabled        
        
        // We assume entertainment page is the default page
        TouchUi.stateEntertainmentMain();
        this.getMediaMetadata();
    }

    getMediaMetadata() {
        let url = "http://127.0.0.1:5000/media/metadata"
        let $this = this;
    
        $.get(url, {})
        .done(function(data) {
            let metadata = data["metadata"];
            $this.touchUi.buildEntertainmentMediaGrid(metadata);
        })
        .fail(function() {
            console.error("Failed retrieving media metadata");
        });
    }

    getWeatherInfo() {
        let apiKey = "63a9442563c740beb09111235202109";
        let url = "http://api.weatherapi.com/v1/current.json?key=" + apiKey + "&q=Stuttgart";
        let $this = this;
        
        $.get(url, {})
        .done(function(data) {
            let condition = data["current"]["condition"]["text"];
            let temperature = data["current"]["temp_c"];        
            $this.speechUi.speakWeatherInfo("Stuttgart", condition, temperature);
        })
        .fail(function() {
            console.error("Failed retrieving weather info");
        });        
    }

    getCurrentTimeInfo() {
        let now = new Date();
        let time = now.getHours() + ":" + now.getMinutes();        
        this.speechUi.speakCurrentTimeInfo(time);
    }

    getEtaInfo() {
        let url = "http://127.0.0.1:5000/positioning/eta";
        let $this = this;

        $.get(url, {})
        .done(function(data) {
            let etaMinutes = data["eta"];
            $this.speechUi.speakEtaInfo(etaMinutes);
        })
        .fail(function() {
            console.error("Failed retrieving ETA");
        });
    }    
}


$(document).ready(function() {
    let logic = new InteractionLogic();
});
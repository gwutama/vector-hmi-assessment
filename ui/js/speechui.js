var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;


class SpeechEvents {
    constructor() {
        this.events = {};
    }

    register(eventName, callback) {
        if (this.events[eventName] === undefined) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(callback);
    }

    trigger(eventName) {
        if (this.events[eventName] === undefined) {
            return;
        }

        console.log("triggering speech ui event", eventName);

        let callbacks = this.events[eventName];

        for (let i = 0; i < callbacks.length; i++) {
            callbacks[i]();
        }
    }
}


export class SpeechUi {
    constructor() {        
        this.events = new SpeechEvents();
        this.state = 0; // 0: disabled, 1: enabled, 2: listening

        // Initialize speech API
        this.recognition = new SpeechRecognition(); 

        this.commands = ["how's the weather", "what time is it", "what's the ETA"];
        let grammar = "#JSGF V1.0; grammar phrase; public <phrase> = " + this.commands.join(" | ") + ";";    

        let speechRecognitionList = new SpeechGrammarList();    
        speechRecognitionList.addFromString(grammar, 1);
        this.recognition.grammars = speechRecognitionList;
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
    }

    enable() {
        console.log("Voice command enabled");
        let $this = this;
        this.speak(""); // chrome needs user activation for speech synthesizer. Enable is activated by clicking the "voice command button"
    
        this.recognition.start(); 
        
        this.recognition.onresult = function(event) {
            let speechResult = event.results[0][0].transcript;
            console.log("Speech received: " + speechResult);
    
            // An incredibly dumb AI
            if (speechResult === $this.commands[0]) {
                $this.events.trigger("weatherInfo");
            } 
            else if (speechResult === $this.commands[1]) {
                $this.events.trigger("currentTimeInfo");
            }
            else if (speechResult === $this.commands[2]) {
                $this.events.trigger("etaInfo");                
            }
        }
    
        this.recognition.onspeechstart = function() {
            $this.state = 2;
            $this.events.trigger("speechStart");            
        }
    
        this.recognition.onspeechend = function() {
            $this.state == 1;
            $this.events.trigger("speechEnd");            
            $this.recognition.stop();        
    
            // Restart speech recognition
            $this.recognition = new SpeechRecognition();
            $this.enable();
        }
    }
    
    disable() {    
        console.log("Voice command disabled");    
        this.recognition.stop();
    }

    toggle() {
        if (this.state == 0) {            
            this.state = 1;
            this.enable();
        }
        else {
            this.state = 0;
            this.disable();
        }
    }    
        
    speakWeatherInfo(city, condition, temperature) {
        this.speak("Current weather in " + city + " is " + condition + " with " + temperature + " degrees celcius");        
    }
    
    speakCurrentTimeInfo(time) {
        this.speak("It is now " + time);    
    }
    
    speakEtaInfo(etaMinutes) {
        this.speak("Current ETA is " + etaMinutes + " minutes until destination");
    }

    speak(text) {
        let utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);    
    }    
}

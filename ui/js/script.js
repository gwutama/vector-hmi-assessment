var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var isVoiceCommandActive = false;
var recognition = new SpeechRecognition();

function enableVoiceCommand() {
    console.log("Voice command enabled");
    speak(""); // chrome needs user activation for speech synthesizer

    // Initialization    
    const WEATHER_PHRASE = "how's the weather";
    const TIME_PHRASE = "what time is it";
    const ETA_PHRASE = "what's the ETA";
    const COMMANDS = [WEATHER_PHRASE, TIME_PHRASE, ETA_PHRASE];
    const GRAMMAR = "#JSGF V1.0; grammar phrase; public <phrase> = " + COMMANDS.join(" | ") + ";";    

    let speechRecognitionList = new SpeechGrammarList();    
    speechRecognitionList.addFromString(GRAMMAR, 1);
    recognition.grammars = speechRecognitionList;
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    // Start recognition
    recognition.start(); 
    
    recognition.onresult = function(event) {
    
        // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
        // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
        // It has a getter so it can be accessed like an array
        // The first [0] returns the SpeechRecognitionResult at position 0.
        // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
        // These also have getters so they can be accessed like arrays.
        // The second [0] returns the SpeechRecognitionAlternative at position 0.
        // We then return the transcript property of the SpeechRecognitionAlternative object 
        let speechResult = event.results[0][0].transcript;
        console.log("Speech received: " + speechResult);

        // An incredibly dumb AI
        if (speechResult === WEATHER_PHRASE) {
            weatherInfo("Stuttgart");
        } 
        else if (speechResult === TIME_PHRASE) {
            currentTimeInfo();
        }
        else if (speechResult === ETA_PHRASE) {
            etaInfo();
        }
    }

    recognition.onspeechstart = function() {
        $("#voice-command-button").addClass("btn-warning");          
    }

    recognition.onspeechend = function() {
        recognition.stop();        

        $("#voice-command-button").removeClass("btn-warning");    

        // Restart speech recognition if we haven't detected a valid phrase and voice command is enabled
        if (isVoiceCommandActive) {        
            recognition = new SpeechRecognition();
            enableVoiceCommand();
        }
    }
}


function disableVoiceCommand() {    
    console.log("Voice command disabled");    
    recognition.stop();
}


function speak(text) {
    let utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);    
}


function weatherInfo(city) {
    let apiKey = "63a9442563c740beb09111235202109";
    let url = "http://api.weatherapi.com/v1/current.json?key=" + apiKey + "&q=" + city;

    $.get(url, {})
    .done(function(data) {
        let textCondition = data["current"]["condition"]["text"];
        let temperature = data["current"]["temp_c"];        
        console.log(data, textCondition,temperature);
        speak("Current weather in " + city + " is " + textCondition + " with " + temperature + " degrees celcius");        
    })
    .fail(function() {
        console.error("Failed retrieving weather info");
        speak("I'm sorry, I can't retrieve weather information for now"); // dumb message if we can't retrieve weather info
    });
}


function currentTimeInfo() {
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes();
    speak("It is now " + time);    
}


function etaInfo() {
    let url = "http://127.0.0.1:5000/positioning/eta"            

    $.get(url, {})
    .done(function(data) {
        let etaMinutes = data["eta"];
        speak("Current ETA is " + etaMinutes + " minutes until destination");
    })
    .fail(function() {
        console.error("Failed retrieving ETA");
    });
}


function loadVideoCards() {
    let url = "http://127.0.0.1:5000/media/metadata"

    $.get(url, {})
    .done(function(data) {
        let metadata = data["metadata"];

        for (let i = 0; i < metadata.length; i++) {
            let item = metadata[i];
            let card = $('<div class="col-sm">' +
                            '<div class="card" style="width: 15rem; margin: 5px">' +
                                '<div class="card-body">' +
                                    '<img src="' + item.poster + '" class="card-img-top" onclick="statePlayVideo(\'' + item.media + '\', \'' + item.poster + '\')">' +                         
                                    '<h5 class="card-title">' + item.title + '</h5>' +
                                    '<h6 class="card-subtitle mb-2 text-muted">' + item.year + '</h6>' +
                                '</div>' +
                            '</div>' +                        
                        '</div>').appendTo("#video-cards");
        }    
    })
    .fail(function() {
        console.error("Failed retrieving media metadata");
    });
}


function statePlayVideo(media, poster) {
    $("#header").hide();
    $("#main").hide();    

    let video = $("#video-player");
    video.attr("width", window.innerWidth);
    video.attr("height", window.innerHeight);
    video.attr("poster", poster);

    let source = $("<source src='" + media + "'>").appendTo(video);

    video.show();
    video[0].play();
    $("#video-back-button").show();     
}


function stateShowBrowse() {
    $("#header").show();
    $("#main").show();  
    $("#video-back-button").hide();  

    let video = $("#video-player");
    video[0].pause();
    video.children("source").remove();
    video[0].load();

    video.hide();
}


function toggleVoiceCommand() {
    isVoiceCommandActive = !isVoiceCommandActive;
    let voiceCommandButton = $("#voice-command-button");

    if (isVoiceCommandActive) {
        voiceCommandButton.removeClass("btn-dark");
        voiceCommandButton.addClass("btn-success");      
        enableVoiceCommand();
    }
    else {
        voiceCommandButton.removeClass("btn-success");
        voiceCommandButton.addClass("btn-dark");        
        disableVoiceCommand();
    }
}


$(document).ready(function() {
    loadVideoCards();
    stateShowBrowse();
});
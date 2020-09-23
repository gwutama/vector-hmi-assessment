export class TouchUi {
    constructor() {   
        $("#video-back-button").on("click", function() {
            TouchUi.stateEntertainmentMain();
        });
    }

    buildEntertainmentMediaGrid(metadata) {    
        // make sure we remove existing items inside grid
        $("#video-cards").children().remove();

        for (let i = 0; i < metadata.length; i++) {
            let item = metadata[i];
            let card = $('<div class="col-sm">' +
                            '<div class="card mediacard">' +
                                '<div class="card-body">' +
                                    '<img src="' + item.poster + '" class="card-img-top">' +                         
                                    '<h5 class="card-title">' + item.title + '</h5>' +
                                    '<h6 class="card-subtitle mb-2 text-muted">' + item.year + '</h6>' +
                                '</div>' +
                            '</div>' +                        
                        '</div>').appendTo("#video-cards");

            card.find("img").on("click", function() {
                TouchUi.stateEntertainmentVideoPlay(item.media, item.poster);
            });                        
        }    
    }

    static stateEntertainmentVideoPlay(media, poster) {
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
    
    static stateEntertainmentMain() {
        $("#header").show();
        $("#main").show();  
        $("#video-back-button").hide();  
    
        let video = $("#video-player");
        video[0].pause();
        video.children("source").remove();
        video[0].load();
    
        video.hide();
    }
    
    setVoiceCommandButtonState(state) {
        let voiceCommandButton = $("#voice-command-button");

        if (state == 0) {
            voiceCommandButton.addClass("btn-dark");            
            voiceCommandButton.removeClass("btn-success");
            voiceCommandButton.removeClass("btn-warning");
        }        
        else if (state == 1) {
            voiceCommandButton.removeClass("btn-dark");            
            voiceCommandButton.addClass("btn-success");
            voiceCommandButton.removeClass("btn-warning");
        }
        else if (state == 2) {
            voiceCommandButton.removeClass("btn-dark");            
            voiceCommandButton.removeClass("btn-success");
            voiceCommandButton.addClass("btn-warning");
        }
    }
}

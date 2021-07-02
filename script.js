//editable values to customize for each channel
var chat_host = 'cytube_username';
//end editable values

var chat_frame = '<iframe frameborder="0" ' +
        'scrolling="no" ' +
        'id="' + chat_host + '" ' +
        'src="https://www.twitch.tv/embed/' + chat_host + '/chat?darkpopout" ' +
        'height="500" ' +
        'width="350">' +
        '</iframe>';

var popout_chat = 'https://www.twitch.tv/popout/' + chat_host + '/chat';

//change layout to the preset that most closely resembles Twitch
USEROPTS.layout = "synchtube-fluid";
storeOpts();
applyOpts();

var chat_element = $("#chatwrap");
var video_element = $("#videowrap");
chat_element.html(chat_frame);

var hide_chat_text = "Hide chat";
var is_chat_hidden = false;
var button_css_class = "btn btn-sm btn-default";
var hide_chat_button = $('<button/>', {
    "class": button_css_class,
    text: hide_chat_text,
    click: function() {
        if(is_chat_hidden) {
            chat_element.show();
            hide_chat_button.text(hide_chat_text);
            is_chat_hidden = false;
        }
        else {
            chat_element.hide();
            hide_chat_button.text("Show chat");
            is_chat_hidden = true;
        }
    }
});

var button_div = $("#leftcontrols");
button_div.html("");
button_div.append(hide_chat_button);

var popout_chat_button = $('<button/>', {
    "class": button_css_class,
    text: "Popout chat",
    click: function() {
        window.open(popout_chat, '_blank', 'location=yes,height=570,width=350,scrollbars=yes,status=yes');
    }
});
button_div.append(popout_chat_button);

var elements_to_hide_for_theater_mode = [$("#videowrap-header"), $("nav")];
var is_in_theater_mode = false;
var theater_mode_on_string = "Theater mode on";

var resize_chat = function() {
    $("#" + chat_host).attr("height", video_element.height());
};

var theater_button = $('<button/>', {
    "class": button_css_class,
    text: theater_mode_on_string,
    click: function() {
        if(is_in_theater_mode) {
            elements_to_hide_for_theater_mode.forEach(function (element) {
                element.show();
            });
            video_element.removeAttr("style");
            $("#mainpage").css("padding-top", "60px");
            resize_chat();
            theater_button.text(theater_mode_on_string);
            is_in_theater_mode = false;
        }
        else {
            elements_to_hide_for_theater_mode.forEach(function (element) {
                element.hide();
            });
            $("#mainpage").css("padding-top", "0px");
            var videoHeight = video_element.height();
            var videoWidth = video_element.width();
            var windowHeight = window.innerHeight;
            var windowWidth = window.innerWidth;
            if(!is_chat_hidden) {
                windowWidth -= 350 + 20; //needs some buffering space or chat flows over
            }
            //be lazy with math; that's what we have CPUs for
            //scale up width to fill window; then if it's too big, maximize height instead
            var widthScale = windowWidth * 1.0 / videoWidth;
            if(videoHeight * widthScale > windowHeight) {
                //too big; fit height to window instead
                var heightScale = windowHeight * 1.0 / videoHeight;
                videoHeight = windowHeight;
                videoWidth = Math.round(videoWidth * heightScale);
            }
            else {
                //it's not too big; now scale the height
                videoWidth = windowWidth;
                videoHeight = Math.round(videoHeight * widthScale);
            }
            video_element.css("height", videoHeight + "px");
            video_element.css("width", videoWidth + "px");
            resize_chat();
            theater_button.text("Theater mode off");
            is_in_theater_mode = true;
        }
    }
});

button_div.append(theater_button);

$("#resize-video-larger").click(resize_chat);
$("#resize-video-smaller").click(resize_chat);

resize_chat();

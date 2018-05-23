//editable values to customize for each channel
const chat_host = 'sg4e';
//end editable values

const chat_frame = '<iframe frameborder="0" ' +
        'scrolling="no" ' +
        'id="' + chat_host + '" ' +
        'src="https://www.twitch.tv/embed/' + chat_host + '/chat?darkpopout" ' +
        'height="500" ' +
        'width="350">' +
        '</iframe>';

const popout_chat = 'https://www.twitch.tv/popout/' + chat_host + '/chat';

var chat_element = $("#chatwrap");
chat_element.html(chat_frame);

var hide_chat_text = "Hide chat";
var is_chat_hidden = false;
const button_css_class = "btn btn-sm btn-default";
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

var resize_chat = function() {
    $("#" + chat_host).attr("height", $("#videowrap").height());
};

$("#resize-video-larger").click(resize_chat);
$("#resize-video-smaller").click(resize_chat);

resize_chat();
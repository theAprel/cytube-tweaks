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

$('<div/>', {
    html: '<a href="' + popout_chat + '" target="_blank">Popout chat</a>'
}).appendTo("#chatwrap");

var resize_chat = function() {
    $("#" + chat_host).attr("height", $("#videowrap").height());
};

$("#resize-video-larger").click(resize_chat);
$("#resize-video-smaller").click(resize_chat);

resize_chat();
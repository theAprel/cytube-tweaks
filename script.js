//editable values to customize for each channel
var chat_host = 'sg4e';
//end editable values

//set up Google Drive workaround

//set up CORS request: https://www.html5rocks.com/en/tutorials/cors/
function createCORSRequest(method, url, onload, onerror) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    //IE
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {
    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  if (!xhr) {
    throw new Error('CORS not supported');
  }
  xhr.onload = onload;
  xhr.onerror = onerror;
  xhr.send();
}

//copied and modified from cytube's greasemonkey script (5/24/2018):
function debug(message) {
    try {
        console.log('[Drive]', message);
    } catch (error) {
        console.error(error);
    }
}

var httpRequest = createCORSRequest;

var ITAG_QMAP = {
    37: 1080,
    46: 1080,
    22: 720,
    45: 720,
    59: 480,
    44: 480,
    35: 480,
    18: 360,
    43: 360,
    34: 360
};

var ITAG_CMAP = {
    43: 'video/webm',
    44: 'video/webm',
    45: 'video/webm',
    46: 'video/webm',
    18: 'video/mp4',
    22: 'video/mp4',
    37: 'video/mp4',
    59: 'video/mp4',
    35: 'video/flv',
    34: 'video/flv'
};

function getVideoInfo(id, cb) {
    var url = 'https://maika.ml/google-drive-proxy/get_video_info?authuser='
            + '&docid=' + id
            + '&sle=true'
            + '&hl=en';
    debug('Fetching ' + url);

    httpRequest(
        'GET',
        url,
        function (raw_xhr) {
            var res = raw_xhr.target;
            try {
                debug('Got response ' + res.responseText);

                if (res.status !== 200) {
                    debug('Response status not 200: ' + res.status);
                    return cb(
                        'Google Drive request failed: HTTP ' + res.status
                    );
                }

                var data = {};
                var error;
                // Google Santa sometimes eats login cookies and gets mad if there aren't any.
                if(/accounts\.google\.com\/ServiceLogin/.test(res.responseText)){
                    error = 'Google Docs request failed: ' +
                            'This video requires you be logged into a Google account. ' +
                            'Open your Gmail in another tab and then refresh video.';
                    return cb(error);
                }

                res.responseText.split('&').forEach(function (kv) {
                    var pair = kv.split('=');
                    data[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                });

                if (data.status === 'fail') {
                    error = 'Google Drive request failed: ' +
                            unescape(data.reason).replace(/\+/g, ' ');
                    return cb(error);
                }

                if (!data.fmt_stream_map) {
                    error = (
                        'Google has removed the video streams associated' +
                        ' with this item.  It can no longer be played.'
                    );

                    return cb(error);
                }

                data.links = {};
                data.fmt_stream_map.split(',').forEach(function (item) {
                    var pair = item.split('|');
                    data.links[pair[0]] = pair[1];
                });
                data.videoMap = mapLinks(data.links);

                cb(null, data);
            } catch (error) {
                console.error(error);
            }
        },

        function () {
            var error = 'Google Drive request failed: ' +
                        'metadata lookup HTTP request failed';
            error.reason = 'HTTP_ONERROR';
            return cb(error);
        }
    );
}

function mapLinks(links) {
    var videos = {
        1080: [],
        720: [],
        480: [],
        360: []
    };

    Object.keys(links).forEach(function (itag) {
        itag = parseInt(itag, 10);
        if (!ITAG_QMAP.hasOwnProperty(itag)) {
            return;
        }

        videos[ITAG_QMAP[itag]].push({
            itag: itag,
            contentType: ITAG_CMAP[itag],
            link: links[itag]
        });
    });

    return videos;
}

var getGoogleDriveMetadata = getVideoInfo;

console.log('Initialized userscript Google Drive player');
var hasDriveUserscript = true;
// Checked against GS_VERSION from data.js
var driveUserscriptVersion = '1.7';

//end Google Drive workaround

//redesign UI

var chat_frame = '<iframe frameborder="0" ' +
        'scrolling="no" ' +
        'id="' + chat_host + '" ' +
        'src="https://www.twitch.tv/embed/' + chat_host + '/chat?darkpopout" ' +
        'height="500" ' +
        'width="350">' +
        '</iframe>';

var popout_chat = 'https://www.twitch.tv/popout/' + chat_host + '/chat';

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
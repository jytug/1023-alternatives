var nbulbs = 10;
var ntestrounds = 2;
var nrounds = 2;
var between_rounds = 3;

var start;
var end;
var response_time = new Array(10).fill(0.0);

var keys = "asdfghjkl;";

function baseName(str) {
   var base = new String(str).substring(str.lastIndexOf('/') + 1); 
    if(base.lastIndexOf(".") != -1)       
        base = base.substring(0, base.lastIndexOf("."));
   return base;
}

nick = baseName(window.location.href);

// Sound
var horn = new Audio('/sound/nope.wav');

// A to L on keyboard
var btns = [65, 83, 68, 70, 71, 72, 74, 75, 76, 59]
function btn_to_bulb(btn) {
    for (i = 0; i < nbulbs; i++)
        if (btns[i] === btn)
            return i;
    return -1;
}


// The configuration
function get_config(settings, round_no, training, callback) {
    $.ajax({url: "/bulbs/" + nick + "/getConfig",
    success: function(result) {
        console.log(result);
        config = JSON.parse(result);
        console.log(config);
        callback(config);
    }});
}

function bulbClicked(config, bulb_no, lit, clicked, settings, round_no, training) {
    if (lit[bulb_no]) {
        clicked[bulb_no] = true;
        if (response_time[bulb_no] == 0)
            response_time[bulb_no] = new Date().getTime() - start;
        if (settings['mode'] === 'relative') {
            setTimeout(function() {
                lit = switchOff(config, lit, i);
                console.log("clicked " + JSON.stringify(clicked));
                console.log("config " + JSON.stringify(config));
                if (JSON.stringify(clicked) === JSON.stringify(config)) {
                    restart(settings, config, lit, clicked, round_no, training);
                }
            }, settings['timeout']);
        }
    } else {
        if (settings['feedback']) {
            horn.play();
        }
    }
}

function init() {
    for (i = 0; i < nbulbs; i++) {
        var fig = document.createElement("figure");
        var blb = document.createElement("img");
        var cap = document.createElement("figcaption");
        blb.src = "/img/off.png";
        blb.id = "blb_" + i;
        cap.textContent = keys[i];
        fig.appendChild(blb);
        fig.appendChild(cap);
        $('.bulb_container').append(fig);
        console.log(cap);
    }
}

function light_up(config) {
    for (i = 0; i < nbulbs; i++)
        if (config[i])
            $('#blb_' + i).attr("src", "/img/on.png")
}

function finish(config, lit, clicked, training) {
    switchOff(config, lit);
    console.log("Lampy wciśnięte:\n" + clicked);
    console.log("Lampy zapalone:\n" + config);
    console.log("Czasy wciskania:\n" + response_time);
    if (!training) {
        $.post("/bulbs/" + nick + "/submit",
           {
               results: JSON.stringify(response_time),
               start: start,
               end: new Date().getTime(),
               config: JSON.stringify(config),
           },
           function(data, status) {
               console.log("Przesłano dane: " + data);
           });
    }
    response_time.fill(0);
}

function restart(settings, config, lit, clicked, round_no, training) {
    finish(config, lit, clicked, training);
    intermission(settings, round_no, between_rounds, training);
}

function intermission(settings, round_no, secs, training) {
    n = training ? ntestrounds : nrounds;
    if (round_no < n - 1) {
        $('.countdown').css("display", "block");
        $('.countdown').html("<h1>" + secs + "</h1>");
        if (secs > 1) {
            setTimeout(function() {
                intermission(settings, round_no, secs - 1, training);
            }, 1000);
        } else {
            setTimeout(function() {
                $('.countdown').css("display", "none");
                run_round(settings, round_no + 1, training);
            }, 1000);
        }
    } else if (training) {
        session_message(settings, function() {
            intermission(settings, -1, between_rounds, false);
        });
    } else {
        bye_message();
    }
}

function switchOff(config, lit) {
    for (i = 0; i < nbulbs; i++) {
        if (config[i]) {
            $('#blb_' + i).attr("src", "/img/off.png")
            lit[i] = false;
        }
    }
    return lit;
}

function switchOff(config, lit, i) {
    if (config[i]) {
        $('#blb_' + i).attr("src", "/img/off.png")
        lit[i] = false;
    }
    return lit;
}

var config;
var lit;
var clicked;

function run_round(settings, round_no, training) {
    get_config(settings, round_no, training, function(config) {
        lit = config.slice();
        clicked = new Array(10).fill(false);

        // Listen for keystrokes
        document.addEventListener('keydown', function(event) {
            console.log("Przycisk: " + event.keyCode);
            bulb_no = btn_to_bulb(event.keyCode);
            if (bulb_no == -1 || !config)
                return;
            bulbClicked(config, bulb_no, lit, clicked, settings, round_no, training);
        });
        start = new Date().getTime();
        light_up(config);
        if (settings['mode'] == 'const') {
            setTimeout(restart, settings['timeout'], settings, config,
                 lit, clicked, round_no, training);
        }
    });
}

function training_message(settings, callback) {
    $('.test_message').css("display", "block");
    $('#run_test_session').click(function() {
        $('.test_message').css("display", "none");
        callback();
    });
}

function session_message(settings, callback) {
    $('.session_message').css("display", "block");
    $('#run_real_session').click(function() {
        $('.session_message').css("display", "none");
        callback();
    });
}

function bye_message() {
    $('.bye_message').css("display", "block");
}

// The settings
function get_settings_and_go() {
    $.ajax({url: "/getSettings",
    success: function(result) {
        init();
        console.log("Settings: " + result);
        var settings = JSON.parse(result);
        training_message(settings, function() {
            intermission(settings, -1, between_rounds, true);
        });
    }});
}

$('document').ready(function() {
    get_settings_and_go();
});

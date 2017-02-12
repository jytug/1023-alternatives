var nbulbs = 10;
var ntestrounds = 1;
var nrounds = 1;
var between_rounds = 3;

var config = get_config();

// Sound
var horn = new Audio('/sound/nope.wav');

// A to L on keyboard
var btns = [65, 83, 68, 70, 71, 72, 74, 75, 76, 186]
function btn_to_bulb(btn) {
    for (i = 0; i < nbulbs; i++)
        if (btns[i] === btn)
            return i;
    return -1;
}


// The configuration
function get_config() {
    // TODO tutaj bedzie request do servera
    var resu = []
        for (i = 0; i < nbulbs; i++) {
            resu.push(Math.random() > 0.5);
        }
    return resu;
}

function bulbClicked(bulb_no, lit, clicked, settings) {
    if (lit[bulb_no]) {
        clicked[bulb_no] = true;
    } else {
        if (settings['feedback']) {
            horn.play();
        }
    }
}

function init() {
    for (i = 0; i < nbulbs; i++) {
        var blb = document.createElement("img");
        blb.src = "/img/off.png";
        blb.id = "blb_" + i;
        $('.bulb_container').append(blb);
    }
}
function light_up(config) {
    for (i = 0; i < nbulbs; i++)
        if (config[i])
            $('#blb_' + i).attr("src", "/img/on.png")
}

function finish(config, lit, clicked) {
    switchOff(config, lit);
    console.log("Lampy wciśnięte:\n" + clicked);
    console.log("Lampy zapalone:\n" + config);
}

function restart(settings, config, lit, clicked, round_no, training) {
    finish(config, lit, clicked);
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
}

var config;
var lit;
var clicked;

function run_round(settings, round_no, training) {
    config = get_config();
    lit = config.slice();
    clicked = new Array(10).fill(false);

    // Listen for keystrokes
    document.addEventListener('keydown', function(event) {
        bulb_no = btn_to_bulb(event.keyCode);
        if (bulb_no == -1 || !config)
            return;
        bulbClicked(bulb_no, lit, clicked, settings);
    });

    light_up(config);
    setTimeout(restart, settings['timeout'], settings, config,
               lit, clicked, round_no, training);
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
        var settings = JSON.parse(result);
        training_message(settings, function() {
            intermission(settings, -1, between_rounds, true);
        });
    }});
}

$('document').ready(function() {
    get_settings_and_go();
});

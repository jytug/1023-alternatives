$('document').ready(function() {
    $('#new_experiment').click(function() {
        var nick = document.getElementById("nick").value;
        window.location.replace("bulbs/" + nick);
    });
});

$('document').ready(function() {
    $('#new_experiment').click(function() {
        var nick = document.getElementById("nick").value;
        if (nick != "")
            window.location.replace("bulbs/" + nick);
        else
            alert("Nick can't be empty");
    });
});

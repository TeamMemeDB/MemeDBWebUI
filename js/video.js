function createPlayer(container) {
    let video = container.getElementsByTagName("video")[0];
    // Load elements from video controller
    let playButton = container.getElementsByClassName("play-pause-button")[0];
    let muteButton = container.getElementsByClassName("mute-button")[0];
    let volumeSlider = container.getElementsByClassName("volume-slider")[0];
    let timeSlider = container.getElementsByClassName("time-slider")[0];
    let currentTime = container.getElementsByClassName("current-time")[0];
    let duration = container.getElementsByClassName("duration")[0];
    let fullscreenButton = container.getElementsByClassName("fullscreen-button")[0];
    // Add event listeners
    video.addEventListener("timeupdate", function() {timeUpdate(video, timeSlider, currentTime, duration)}, false); // Triggers when video's time is updated
    playButton.addEventListener("click", function() {playToggle(video, playButton);}, false); // Triggers when play/pause button is clicked
    muteButton.addEventListener("click", function() {muteVideo(video, muteButton);}, false); // Triggers when mute/unmute button is clicked
    volumeSlider.addEventListener("change", function () {updateVolume(video, volumeSlider, muteButton);}, false); // Triggers when volume slider is updated
    timeSlider.addEventListener("change", function () {updateTime(video, timeSlider);}, false); // Triggers when time slider is updated
    fullscreenButton.addEventListener("click", function() {fullscreenToggle(video.parentElement);}, false); // Triggers when fullscreen button is clicked
}
function timeUpdate(video, timeSlider, currentTime, duration) {
    // Updating time slider to display time progress
    timeSlider.value = video.currentTime * (100 / video.duration);
    // Calculating the current time and duration (flooring to get whole numbers)
    var currentMins  = Math.floor(video.currentTime / 60);
    var currentSecs  = Math.floor(video.currentTime - currentMins * 60);
    var durationMins = Math.floor(video.duration / 60);  
    var durationSecs = Math.floor(video.duration - durationMins * 60);
    // Appending a zero to the start of the strings if any time value is less than 10 (keeping 2 digits)
    if(durationMins>0){
        if(currentMins < 10){currentMins = "0" + currentMins};
        if(durationMins < 10){durationMins = "0" + durationMins};
        currentMins+=':';
        durationMins+=':';
    }else{
        currentMins='';
        durationMins='';
    }
    if(currentSecs < 10){currentSecs = "0" + currentSecs};
    if(durationSecs < 10){durationSecs = "0" + durationSecs};
    // Updating text on site
    currentTime.innerHTML = currentMins + currentSecs;
    duration.innerHTML = durationMins + durationSecs;
}
function playToggle(video, playButton) {
    if (video.paused) {
        video.play();
        playButton.innerHTML = "❚❚";

    }else {
        video.pause();
        playButton.classList.remove('rotate');
        playButton.innerHTML = "▶";
    }
}
function muteVideo(video, muteButton) {
    if (video.muted) {
        video.muted = false;
        var volume = video.volume * 100;
        if (volume == 0) {
            muteButton.innerHTML = "🔈";
        }else if (volume < 65) {
            muteButton.innerHTML = "🔉";
        }else {
            muteButton.innerHTML = "🔊";
        }
    }else {
        video.muted = true;
        muteButton.innerHTML = "🔇";
    }
}
function updateVolume(video, volumeSlider, muteButton){
    var volume = volumeSlider.value;
    video.volume = volume / 100;
    if (volume == 0) {
        muteButton.innerHTML = "🔈";
    }else if (volume < 65) {
        muteButton.innerHTML = "🔉";
    }else {
        muteButton.innerHTML = "🔊";
    }
    if (video.muted) {
        video.muted = false;
    }
}
function updateTime(video, timeSlider){
    video.currentTime = video.duration * (timeSlider.value / 100);
}
function fullscreenToggle(video) {
    var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;
    if (video.requestFullScreen){
        if(!isFullscreen)
            video.requestFullScreen();
        else
            document.exitFullScreen();
    }else if (video.webkitRequestFullScreen) {
        if(!isFullscreen)
            video.webkitRequestFullScreen();
        else
            document.webkitCancelFullScreen()
    }else if (video.mozRequestFullScreen) {
        if(!isFullscreen)
            video.mozRequestFullScreen();
        else
            document.mozCancelFullScreen();
    }
}

/*$('.meme.video,.meme.webm').each(function(){
    createPlayer(this)
})*/
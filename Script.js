console.log('lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await (await fetch(`./${folder}/`)).text();
    console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
              <img class="invert" src="music.svg" alt="">
              <div class="info">
                <div>${decodeURI(song.replaceAll("%20", " "))}</div>
                <div>Harshit</div>
              </div>
              <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
              </div>
            </li>`;
    }

    // Attach event listener to each song
    document.querySelectorAll(".songList li").forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info div").textContent.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `./${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "pause.svg";
    }
    document.querySelector(".songinfo").textContent = decodeURI(track);
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
};

// MAIN FUNCTION
async function main() {
    await getSongs("songs/glory");
    playMusic(songs[0], true);

    let play = document.getElementById("play");
    let next = document.getElementById("next");
    let previous = document.getElementById("previous");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Seek Bar Update Fix 🔥
    currentSong.addEventListener("timeupdate", () => {
        if (!currentSong.duration) return;
        document.querySelector(".songtime").textContent = 
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        
        let progress = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = `${progress}%`;
    });

    // Seek Bar Click Fix 🔥
    document.querySelector(".seekbar").addEventListener("click", e => {
        if (!currentSong.duration) return;
        let percent = (e.offsetX / e.target.clientWidth) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Handle Next and Previous Buttons
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Volume Control
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Sidebar Controls
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // Load songs when clicking an album card
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}

main();

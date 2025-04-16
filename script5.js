let currentsong = new Audio();
let currfolder;

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5501/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

     songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    return songs;
}


const playmusic = (track, pause=false) => {
    try {
        // Make sure currfolder is properly set
        if (!currfolder) currfolder = "songs/ncs"; // default folder
        
        currentsong.src = `/${currfolder}/${track}`;
        if(pause){
            currentsong.pause();
            document.getElementById("play-button").src = "play.svg";
        } else {
            currentsong.play();
            document.getElementById("play-button").src = "pause.svg";
        }
        document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    } catch (error) {
        console.error("Error playing music:", error);
    }
};

function formatTime(seconds) {
    seconds = Math.floor(seconds); // Ensure seconds is an integer
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}


let songs;


async function displayalbums() {
    let a = await fetch(`http://127.0.0.1:5501/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0];  // Get correct folder name

            try {
                let metadata = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`);
                let response = await metadata.json();  // Parse JSON correctly

                console.log(response);
                cardContainer.innerHTML += `
                    <div class="card" data-folder="${folder}">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
                                <circle cx="16" cy="16" r="14" fill="green"/>
                                <path d="M21 16.846C20.6465 18.189 18.9761 19.138 15.6351 21.0361C12.4054 22.8709 10.7906 23.7884 9.48923 23.4196C8.9512 23.2671 8.46099 22.9776 8.06564 22.5787C7.1094 21.6139 7.1094 19.7426 7.1094 16C7.1094 12.2574 7.1094 10.3861 8.06564 9.42132C8.46099 9.02245 8.9512 8.73288 9.48923 8.58042C10.7906 8.21165 12.4054 9.12907 15.6351 10.96393C18.9761 12.86197 20.6465 13.811 21 15.154C21.1459 15.7084 21.1459 16.2916 21 16.846Z" 
                                fill="black" stroke="black" stroke-width="1.5" stroke-linejoin="round" transform="scale(0.8) translate(4,4)"/>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
            } catch (error) {
                console.error("Error fetching info.json:", error);
            }
        }
    }
}

async function main() {
    try {
        // Initialize with default folder
        currfolder = "songs/ncs";
        songs = await getsongs(currfolder);
        
        if (songs && songs.length > 0) {
            playmusic(songs[0], true);
            updatePlaylistUI(songs);
        } else {
            console.error("No songs found in the default folder");
        }

        // Display all the albums on the page
      await displayalbums()

        //show all the song in the playlist
        let songUL = document.querySelector(".songlists ul");
        songUL.innerHTML = ""
        for (const song of songs) {
            songUL.innerHTML += `
                <li>
                    <img class="invert" src="music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Ansh</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="play.svg">
                    </div>
                </li>`;
        }

        let playbutton = document.getElementById("play-button");
        let isplaying = false;

        playbutton.addEventListener("click", function () {
            if (currentsong.paused) {
                currentsong.play();
                playbutton.src = "pause.svg"; // Update path to where your images are stored
            } else {
                currentsong.pause();
                playbutton.src = "play.svg"; // Update path to where your images are stored
            }
        });

        Array.from(document.querySelector(".songlists").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                let songName = e.querySelector(".info div").innerHTML.trim();
                playmusic(songName);
            });
        });

        //listen for timeupdate event
        currentsong.addEventListener("timeupdate", () => {
          /*  let duration = currentsong.duration;
            let currentTime = currentsong.currentTime;
            let minutes = Math.floor(currentTime / 60);
            let seconds = Math.floor(currentTime % 60);*/
            console.log(currentsong.currentTime,currentsong.duration);
            document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
            document.querySelector(".circle").style.left = `${(currentsong.currentTime/currentsong.duration)*100}%`
        });

        //add event listner to seekbar
        document.querySelector(".seekbar").addEventListener("click",(e)=>{
            let percentage = (e.offsetX / e.target.getBoundingClientRect().width)*100;
            document.querySelector(".circle").style.left = `${percentage}%`
            currentsong.currentTime = (percentage/100)*currentsong.duration;
        });

      /* // Move this OUTSIDE of the seekbar event listener
          document.querySelector(".hamburgericon").addEventListener("click",()=>{
              document.querySelector(".left").style.left = "0";
          });

          // Add close functionality when clicking outside
          document.querySelector(".right").addEventListener("click", () => {
                  document.querySelector(".left").style.left = "-120%";
          });*/

           /*  // Update hamburger menu functionality
               document.querySelector(".hamburgericon").addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent event from bubbling to right section
                document.querySelector(".left").classList.add("show");
            });

            // Close menu when clicking outside
            document.querySelector(".right").addEventListener("click", () => {
                document.querySelector(".left").classList.remove("show");
            });

            // Close menu when clicking anywhere in the document
            document.addEventListener("click", (e) => {
                if (!e.target.closest(".left") && !e.target.closest(".hamburgericon")) {
                    document.querySelector(".left").classList.remove("show");
                }
            });*/

            // Update these event listeners in your main() function
        document.querySelector(".hamburgericon").addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent event from bubbling
            const leftMenu = document.querySelector(".left");
            leftMenu.style.left = "0";
        });

        // Close menu when clicking on the right section
        document.querySelector(".right").addEventListener("click", (e) => {
            const leftMenu = document.querySelector(".left");
            // Only close if we're not clicking on the hamburger icon
            if (!e.target.closest(".hamburgericon")) {
                leftMenu.style.left = "-200%";
            }
        });

        // Add a document-level click handler for closing the menu
        document.addEventListener("click", (e) => {
            const leftMenu = document.querySelector(".left");
            // Close menu if clicking outside left menu and hamburger icon
            if (!e.target.closest(".left") && !e.target.closest(".hamburgericon")) {
                leftMenu.style.left = "-100%";
            }
        });

        //add an event listener to the previous button
        previous.addEventListener("click",()=>{
            console.log("previous clicked");
            let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
            console.log(songs,index);
            if(index > 0){
                playmusic(songs[index-1]);
            }else{
                playmusic(songs[songs.length-1]);
            } 
        });


        //add an event listener to the next button
        next.addEventListener("click",()=>{
            console.log("next clicked");
            let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
            console.log(songs,index);
            if(index < songs.length-1){
                playmusic(songs[index+1]);
            }else{
                playmusic(songs[0]);
            }
        });

        // add an event listner to volume 
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",
            (e) => {
                console.log(e,e.target,e.target.value)
                currentsong.volume = parseInt(e.target.value)/100
            })

            //Load the playlist whenever the card is clicked 
         Array.from(document.getElementsByClassName("card")).forEach(e=>{
                e.addEventListener("click", async item=>{
                  //  console.log(item,item.currentTarget.dataset)
                  console.log(item, e.dataset)
                    songs = await getsongs(`songs/${e.dataset.folder}`)

                })
            })  
                Array.from(document.getElementsByClassName("card")).forEach(e => {
                    e.addEventListener("click", async item => {
                        console.log("Clicked card data:", e.dataset); // Debugging
                
                        let folderName = e.dataset.folder;
                        if (folderName) {
                            songs = await getsongs(`songs/${folderName}`);
                            console.log("Loaded songs:", songs);
                
                            if (songs.length > 0) {
                                playmusic(songs[0], true); // Play first song (paused)
                                updatePlaylistUI(songs); // Update UI to reflect new playlist
                                
                            }
                        } else {
                            console.error("No data-folder attribute found!");
                        }
                    });
                });
               // update playlist ui
              function updatePlaylistUI(songs) {
                let songUL = document.querySelector(".songlists ul");
                songUL.innerHTML = "";
                for (const song of songs) {
                    songUL.innerHTML += `
                        <li>
                            <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Ansh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg">
                            </div>
                        </li>`;
                }
            
                // Attach event listeners to new playlist items
                Array.from(document.querySelector(".songlists").getElementsByTagName("li")).forEach(e => {
                    e.addEventListener("click", () => {
                        let songName = e.querySelector(".info div").innerHTML.trim();
                        playmusic(songName);
                    });
                });
            }
            
    } catch (error) {
        console.error("Error in main:", error);
    }
}

main();

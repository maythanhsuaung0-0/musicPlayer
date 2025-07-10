let tbody = document.querySelector("#musicList")
let currentPlayer = document.querySelector(".current")
let currentSongCover = document.querySelector(".current .cover")
let currentSongTitle = document.querySelector(".current .songTitle")
let currentSongArtist = document.querySelector(".current .songArtist")
let currentStatus = document.querySelector("#play")
let nextIcon = document.querySelector("#next")
let prevIcon = document.querySelector("#prev")
let playing = false
let audio;
let currentAudio = document.querySelector("#audio")
let likedSongs = []
let allSongs = []
let progress = document.querySelector(".progress")
let progressBar = document.querySelector(".progressBar")
let marker = document.querySelector(".marker")
let volume = document.querySelector("#volumeIcon")
let volumeProgress = document.querySelector(".volumeProgress")
let volumeBar = document.querySelector(".volumeBar")
let currentSongId = 0;
let nextSong, prevSong;
let shuffle = document.querySelector("#shuffle")
let isShuffle = false;
let likeIcon = document.querySelector("#like")
let noOfSongs = document.querySelector("#noOfSongs")
window.addEventListener('DOMContentLoaded', async function() {
  let data = await fetch('./songs.json').then((res) => {
    if (res.ok) {
      return res.json()
    }
    else {
      throw new Error(`status error ${res.status}`)
    }
  }).then((data) => { return data })
  // create element
  let songs = data.songs
  volume.addEventListener('click', function() {
    volumeProgress.classList.toggle("hidden")
  })
  noOfSongs.textContent = songs.length + " songs"
  for (let i = 0; i < songs.length; i++) {
    console.log('current index', i, nextSong)
    let song = songs[i]
    let tr = document.createElement("tr")
    let no = document.createElement("td")
    let title = document.createElement("td")
    let album = document.createElement("td")
    let artist = document.createElement("td")
    let year = document.createElement("td")
    let duration = document.createElement("td")
    let cover = document.createElement("td")
    let artistInMobile = document.createElement("span")
    artistInMobile.classList.add("artistInMobile")
    artistInMobile.textContent = song.artist
    no.classList.add("hideInMobile")
    album.classList.add("hideInMobile")
    artist.classList.add("hideInMobile")
    year.classList.add("hideInMobile")
    duration.classList.add("hideInMobile")
    title.classList.add("songTitle")
    no.textContent = song.id
    title.textContent = song.title
    album.textContent = song.album
    artist.textContent = song.artist
    year.textContent = song.year
    duration.textContent = song.duration
    cover.innerHTML = `<img class="cover" src="${song.cover}" alt="${song.title} cover" width="50">`
    title.appendChild(artistInMobile)
    tr.appendChild(no)
    tr.appendChild(cover)
    tr.appendChild(title)
    tr.appendChild(album)
    tr.appendChild(artist)
    tr.appendChild(year)
    tr.appendChild(duration)
    tbody.appendChild(tr)
    tr.addEventListener('click', function() {
      playMusic(song)
      let height = audio.volume * 100 + "%"
      volumeBar.style.height = height
      if (audio) {

        audio.addEventListener('volumechange', function() {
          height = audio.volume * 100 + "%"
          volumeBar.style.height = height
        })

        audio.addEventListener('timeupdate', function() {

          let duration = audio.duration

          let width = ((audio.currentTime + 0.25) / duration * 100) + "%"

          progressBar.style.width = width
          marker.style.left = width
          if (audio.currentTime == duration) {
            let id = getShuffleIDorNextIDorPrevID(songs, 'next')
            currentSongId = id;
            playMusic(songs[id])

          }
        })
      }

    }
    )
  }
  shuffle.addEventListener('click', function() {
    let songId = shuffleSongs(songs)
    playMusic(songs[songId])
    isShuffle = true;
  }
  )
  // for progress bar
  // likeIcon.addEventListener('click', function() {
  //   if (likeIcon.getAttribute("src") === "./data/icons/heart.svg") {
  //     likeIcon.setAttribute("src", "./data/icons/heartFilled.svg")
  //     console.log(currentSongId, 'ci')
  //     // likedSongs.push(
  //     // localStorage.setItem("likedSongs",)
  //   }
  //   else {
  //     likeIcon.setAttribute("src", "./data/icons/heart.svg")
  //   }
  // })
  progress.addEventListener('click', function(event) {
    let percent = getCursorLocation(progress, event, 'x')
    audio.currentTime = audio.duration * percent
  })

  volumeProgress.addEventListener('click', function(event) {

    let percent = 1 - getCursorLocation(volumeProgress, event, 'y')
    audio.volume = percent
  })

  // next
  prevIcon.addEventListener('click', function() {
    let id = getShuffleIDorNextIDorPrevID(songs, 'prev')

    currentSongId = id;
    playMusic(songs[id])

  })
  nextIcon.addEventListener('click', function() {
    let id = getShuffleIDorNextIDorPrevID(songs, 'next')

    currentSongId = id;
    playMusic(songs[id])


  })



  currentStatus.addEventListener('click', function() {
    if (audio) {
      if (playing) {
        audio.pause()
        currentStatus.setAttribute("src", "./data/icons/play.svg")
        playing = false
      }
      else {
        audio.play()
        currentStatus.setAttribute("src", "./data/icons/pause.svg")
        playing = true
      }
    }
    else {
      console.log("smth went wrong")
    }
  })
})
function getCursorLocation(element, event, axis) {
  let elementSize = element.getBoundingClientRect()
  let click = axis == "x" ? event.clientX - elementSize.left : event.clientY - elementSize.top
  let progress = axis == 'x' ? elementSize.width : elementSize.height
  let percent = click / progress
  return percent
}
function playMusic(song) {

  displayMusicInfo(song)
  // play
  if (!audio) {
    // if no song hasn't played
    audio = new Audio(song.audioUrl)
  }
  else {
    if (audio.src !== song.audioUrl) {
      // if different song is played
      audio.pause()
      audio.currentTime = 0
      audio.src = song.audioUrl
    }
    else {
      // restart if being played the same song
      audio.currentTime = 0
    }
  }
  audio.play()
  currentStatus.setAttribute("src", "./data/icons/pause.svg")
  playing = true
}
function displayMusicInfo(song) {
  currentPlayer.classList.remove("hidden")
  currentSongCover.innerHTML = `<img class="cover" src="${song.cover}" alt="${song.title} cover"/>`
  currentSongTitle.textContent = song.title
  currentSongArtist.textContent = song.artist
}
function shuffleSongs(songs) {
  let randomIndex = Math.floor(Math.random() * songs.length)
  return randomIndex

}
function getShuffleIDorNextIDorPrevID(songs, nextOrPrev) {
  let id;
  if (isShuffle) {
    id = shuffleSongs(songs)
  }
  else {
    // if not shuffle, play next song in the list
    if (nextOrPrev === 'prev') {
      id = (currentSongId - 1 + songs.length) % songs.length
    }
    else {
      id = (currentSongId + 1) % songs.length
    }
  }
  return id;
}

var createSongRow = function(songNumber, songName, songLength) {
  var template =
      '<tr class="album-view-song-item">'
  + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
  + '  <td class="song-item-title">' + songName + '</td>'
  + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
  + '</tr>';


  var $row = $(template);

  var clickHandler = function() {
    songNumber = parseInt($(this).attr('data-song-number'));
    // update volume seekbar
    var $volumeBar = $('.volume .seek-bar');
     updateSeekPercentage($volumeBar, currentVolume/100);


    if (currentlyPlayingSongNumber !== null) {
      // Revert to song number for currently playing song because user started playing new song.
      var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
      currentlyPlayingCell.html(currentlyPlayingSongNumber);
    }
    if (currentlyPlayingSongNumber !== songNumber) {
      // Switch from Play -> Pause button to indicate new song is playing.
      $(this).html(pauseButtonTemplate);
      setSong(songNumber);
      currentSoundFile.play();
      updatePlayerBarSong();
      updateSeekBarWhileSongPlays();
    } else if (currentlyPlayingSongNumber === songNumber){
      // Switch from Pause -> Play button to pause currently playing song.
      if (currentSoundFile.isPaused()){
        $(this).html(pauseButtonTemplate);
        $('main-controls .play-pause').html(playerBarPauseButton);
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
      }else{
        $(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
        currentSoundFile.pause();
      }

    }

  };

  var onHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumberCell.attr('data-song-number'));

    if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(playButtonTemplate);
    }
  };

  var offHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumberCell.attr('data-song-number'));

    if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(songNumber);
    }
  };
  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
};


var setSong = function(songNumber){
  if (currentSoundFile) {
    currentSoundFile.stop();
  }
  currentlyPlayingSongNumber = parseInt(songNumber); //
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];//

  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
                            formats: ['mp3'],
                            preload: true
  });
  setVolume(currentVolume);
};

var seek = function(time) {
  if (currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};

var setVolume = function(volume) {
  if (currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function(number){
  return $('.song-item-number[data-song-number="' + number +'"]');
};

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
};

var updateSeekBarWhileSongPlays = function() {
  if (currentSoundFile) {
    currentSoundFile.bind('timeupdate', function(event) {
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');
      updateSeekPercentage($seekBar, seekBarFillRatio);
      setCurrentTimeInPlayerBar(buzz.toTimer((currentSoundFile.getTime())));
      setTotalTimeInPlayerBar(buzz.toTimer(currentSoundFile.getDuration()));

    });
  }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  // #1
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
  var $seekBars = $('.player-bar .seek-bar');

  $seekBars.click(function(event) {
    var $seekBar = $(this).parent();
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;

    if ($seekBar.attr('class') === 'seek-control') {
      seek(seekBarFillRatio * currentSoundFile.getDuration());
    } else {
      setVolume(seekBarFillRatio*100);
    }
    updateSeekPercentage($seekBar, seekBarFillRatio);
  });

  $seekBars.find('.thumb').mousedown(function(event) {
    var $seekBar = $(this).parent();
    $(document).bind('mousemove.thumb', function(event){
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      if ($seekBar.parent().attr('class') === 'seek-control') {
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      } else {
        setVolume(seekBarFillRatio*100);
      }
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
    $(document).bind('mouseup.thumb', function() {
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });
  });
};

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
  $('.main-controls .play-pause').html(playerBarPauseButton);
  setTotalTimeInPlayerBar(buzz.toTimer(currentSoundFile.getDuration()));


};


var nextSong = function() {
  var getLastSongNumber = function(index) {
    return index == 0 ? currentAlbum.songs.length : index;
  };

  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  // Note that we're _incrementing_ the song here
  currentSongIndex++;

  if (currentSongIndex >= currentAlbum.songs.length) {
    currentSongIndex = 0;
  }

  // Set a new current song
  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();

  // Update the Player Bar information
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
  $('.main-controls .play-pause').html(playerBarPauseButton);

  var lastSongNumber = getLastSongNumber(currentSongIndex);
  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);

};

var previousSong = function() {

  // Note the difference between this implementation and the one in
  var getLastSongNumber = function(index) {
    return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
  };

  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  // Note that we're _decrementing_ the index here
  currentSongIndex--;

  if (currentSongIndex < 0) {
    currentSongIndex = currentAlbum.songs.length - 1;
  }

  // Set a new current song
  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  // Update the Player Bar information
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
  $('.main-controls .play-pause').html(playerBarPauseButton);

  var lastSongNumber = getLastSongNumber(currentSongIndex);
  var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

  $previousSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);

};

var togglePlayFromPlayerBar = function () {
  if (currentSoundFile.isPaused()){ //is the song paused?
   currentSoundFile.play();
    $(this).html(playerBarPauseButton);
    (getSongNumberCell(currentlyPlayingSongNumber)).html(pauseButtonTemplate);
  } else { //the song is playing and you should pause it
   currentSoundFile.pause();
    $(this).html(playerBarPlayButton);
    //get song number cell to change icon
    (getSongNumberCell(currentlyPlayingSongNumber)).html(playButtonTemplate);
    songNumberCell.html(playButtonTemplate);
  }
}

var setTotalTimeInPlayerBar = function (totalTime){
  $('.total-time').text(totalTime);
}

var setCurrentTimeInPlayerBar = function (currentTime){
  $('.current-time').text(currentTime);
}

var filterTimeCode = function (timeInSeconds){
  var totalSeconds = parseFloat(timeInSeconds);
  var getMinutes = Math.floor(totalSeconds/60);
  var getSeconds = Math.floor(totalSeconds - (getMinutes*60));
  return getMinutes+":"+getSeconds;
}

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';


var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $pausePlay = $('.main-controls .play-pause');


$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  setCurrentTimeInPlayerBar("0:00");
  $pausePlay.click(togglePlayFromPlayerBar);
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  var albums = [albumPicasso, albumMarconi,albumCher];
  var index = 1;
  $('.album-cover-art').click(function(event){
    setCurrentAlbum(albums[index]);
    index++;
    if (index == albums.length) {
      index = 0;
    }
  });
});

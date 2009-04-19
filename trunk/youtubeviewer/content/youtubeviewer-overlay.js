var YouTubeViewerOverlay = {
  onLoad: function() {
  },

  onMenuItemCommand: function() {
    window.open("chrome://youtubeviewer/content/youtubeviewer.xul", "", "chrome,resizable,centerscreen");
  }  
};

window.addEventListener("load", function(e) { YouTubeViewerOverlay.onLoad(e); }, false);

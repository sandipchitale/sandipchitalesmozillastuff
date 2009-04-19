var YouTubeViewer = {
    MAX_RESULTS: 50,
    previousSearchTerm: null,
    startIndex: 1,
    searchResults: [],

    onLoad: function() {
        this.windowElement = document.getElementById('youtubeviewer');
        this.search = document.getElementById('search');
        this.search.onkeyup = this.onSearchCommandKeyUp;
        this.videos = document.getElementById('videos');
        this.videos.ondblclick = this.onShowVideoCommand;
        this.videos.onkeyup = this.onShowVideoCommandKeyUp;
        this.range = document.getElementById('range');
        this.video = document.getElementById('video');
        this.description = document.getElementById('description');
        this.status = document.getElementById('status');
        this.progress = document.getElementById('progress');       
    },

    onSearchCommand: function() {
        this.request = new XMLHttpRequest();
        this.request.onreadystatechange = this.onSearchDone;
        var searchTerm = this.search.value;
        if (!searchTerm || searchTerm == '') {
            var searchTerm = prompt('Please specify search term:', this.previousSearchTerm);
            if (!searchTerm || searchTerm == '') {
                this.status.value = 'Please specify search term!';
                this.range.value = ' - ';
                return;
            } else {
                this.search.value = searchTerm;
            }
            this.previousSearchTerm = null;
        }
        if (searchTerm == this.previousSearchTerm) {
            this.startIndex += this.MAX_RESULTS;
        } else {
            this.startIndex = 1;
            if (this.previousSearchTerm) {
                this.search.appendItem(this.previousSearchTerm);
            }
        }
        this.previousSearchTerm = searchTerm;
        
        this.request.open("GET", "http://gdata.youtube.com/feeds/api/videos?format=5&start-index=" + this.startIndex + "&max-results=" + this.MAX_RESULTS + "&vq=" + searchTerm, true);

        this.status.value = 'Searching for videos matching: \'' + searchTerm + '\'...';
        this.windowElement.setAttribute('wait-cursor', "true");
        this.progress.mode = "undetermined";
        
        setTimeout("YouTubeViewer.request.send(null);", 20);
    },

    onSearchCommandKeyUp: function (e) {
        if (e.keyCode == KeyboardEvent.DOM_VK_RETURN) {
            YouTubeViewer.onSearchCommand();
        }
    },

    onSearchDone: function() {
        try {
            if (YouTubeViewer.request.status == 200) {
                var videosXML = YouTubeViewer.request.responseXML;
                while (YouTubeViewer.videos.getRowCount() > 0) {
                    YouTubeViewer.videos.removeItemAt(0);
                }
                YouTubeViewer.searchResults = [];
                var entries = videosXML.getElementsByTagName('entry');
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries.item(i);
                    var titles = entry.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'title');
                    var descriptions = entry.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'description');
                    var contents = entry.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content');
                    for (var j = 0; j < contents.length; j++) {
                        var content = contents.item(j);
                        if (content.getAttribute('type') == 'application/x-shockwave-flash' && content.getAttribute('medium') == 'video') {
                            var title = titles.item(0).firstChild.nodeValue;
                            var item = YouTubeViewer.videos.appendItem(title, i);
                            item.tooltipText = title;
                            item.command= "cmd_showvideo";
                            YouTubeViewer.searchResults.push(
                            {
                              url: content.getAttribute('url'),
                              description: title + '\n' + descriptions.item(0).firstChild.nodeValue
                            });
                        }
                    }
                }
                YouTubeViewer.range.value = YouTubeViewer.startIndex + ' - ' + (YouTubeViewer.startIndex  + YouTubeViewer.searchResults.length - 1);
                YouTubeViewer.status.value = 'Searching for videos matching: \'' + searchTerm + '\'...Done.';
            } else {
                YouTubeViewer.status.value = 'Searching for videos matching: \'' + searchTerm + '\'...Failed: ' + YouTubeViewer.request.status;
            }
        } catch (e) {
            YouTubeViewer.windowElement.removeAttribute('wait-cursor');
            YouTubeViewer.progress.mode = "determined";
        }
    },

    onShowVideoCommand: function (e) {
        var item = e.target;
        var index = item.value;
        YouTubeViewer.video.contentDocument.location.href = YouTubeViewer.searchResults[index].url;
        YouTubeViewer.description.value = YouTubeViewer.searchResults[index].description;
    },

    onShowVideoCommandKeyUp: function (e) {
        if (e.keyCode == KeyboardEvent.DOM_VK_RETURN) {
            YouTubeViewer.onShowVideoCommand(e);
        }
    }

};

window.addEventListener("load", function(e) {  YouTubeViewer.onLoad(e); }, false);

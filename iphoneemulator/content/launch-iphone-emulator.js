var LaunchiPhoneEmulator = function() {};
(function(){
    this.onLaunchiPhoneEmulator = function(event) {
        var URL = prompt("Open Location in iPhone mode:", "http://www.google.com/m");
        if (URL) {
            window.openDialog(
                "chrome://browser/content/browser.xul",
                "_blank",
                "chrome,all=yes,dialog,centerscreen,innerWidth=387,innerHeight=850",
                URL,
                "iphone=true");
        }
    }

    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    Rect.prototype.contains = function (x, y) {
        return ((this.x < x) && (x < (this.x + this.width)) &&
            (this.y < y) && (y < (this.y + this.height)));
    };

    const angle0     = 0;
    const angleCCW90 = 1;
    const angleCW90  = 2;

    const iPhoneMetrics = [
        {
            appcontentBackground: "url('chrome://iphone/skin/iphone.png') no-repeat",
            
            addressCols: "30",
            addressStyle: "margin: 180px 88px 8px;",

            contentWidth: "320px",

            contentCollapsedHeight: "356px",
            contentCollapsedMargin: "0px 34px 158px",

            contentExpandedHeight: "416px",
            contentExpandedMargin: "154px 34px 158px",

            iPhoneBarRect: new Rect(34, 133, 320, 20),
            reloadButtonRect: new Rect(325, 185, 20, 20),
            goBackButtonRect: new Rect(60, 581, 20, 20),
            goForwardButtonRect: new Rect(125, 581, 20, 20),
            addButtonButtonRect: new Rect(180, 581, 20, 20),
            showBookmarksButtonRect: new Rect(245, 581, 20, 20)
        }
    ];

    var angle = angle0;

    // Used as function
    const onKeyPress = function(event) {
        if (event.keyCode == 13) {
            contentTabbrowser.loadURI(event.target.value);
        }
    }

    // Used as function
    const onAreaClick = function (event) {
        var x = event.clientX - appcontentVbox.boxObject.x;
        var y = event.clientY - appcontentVbox.boxObject.y;

        // in addressbar ?
        if (iPhoneMetrics[angle].reloadButtonRect.contains(x,y)) {
            if (!addressTextField.collapsed) {
                contentTabbrowser.reload();
            }
        } else if (iPhoneMetrics[angle].goBackButtonRect.contains(x,y)) {
            try {
                if (contentTabbrowser.canGoBack) {
                    contentTabbrowser.goBack();
                }
            } catch (ex) {
                try {
                    contentTabbrowser.goBack();
                } catch (ex) {
                    alert(ex);
                }
            }
        } else if (iPhoneMetrics[angle].goForwardButtonRect.contains(x,y)) {
            try {
                if (contentTabbrowser.canGoForward) {
                    contentTabbrowser.goForward();
                }
            } catch (ex) {
                try {
                    contentTabbrowser.goForward();
                } catch (ex) {
                    alert(ex);
                }
            }
        } else if (iPhoneMetrics[angle].addButtonButtonRect.contains(x,y)) {
            addBookmarkAs(contentTabbrowser, false);
        } else if (iPhoneMetrics[angle].showBookmarksButtonRect.contains(x,y)) {
            toOpenWindowByType('bookmarks:manager', 'chrome://browser/content/bookmarks/bookmarksManager.xul');
        } else if (iPhoneMetrics[angle].iPhoneBarRect.contains(x,y)) {
            toggleAddressBar();
        }
    }

    const showAddressBar = function() {
        addressTextField.collapsed = false;
        contentTabbrowser.style.height = iPhoneMetrics[angle].contentCollapsedHeight;
        contentTabbrowser.style.margin = iPhoneMetrics[angle].contentCollapsedMargin;
    }

    const hideAddressBar = function() {
        addressTextField.collapsed = true;
        contentTabbrowser.style.height = iPhoneMetrics[angle].contentExpandedHeight;
        contentTabbrowser.style.margin = iPhoneMetrics[angle].contentExpandedMargin;
    }

    const toggleAddressBar = function() {
        if (addressTextField.collapsed) {
            showAddressBar();
        } else {
            hideAddressBar();
        }
    }

    const onLoadURL = function() {
        if (iphone) {
            if (!addressTextField.collapsed) {
                hideAddressBar();
            }
        }
    }

    var iphone = false;

    var addressTextField;
    var contentTabbrowser;
    var appcontentVbox;

    const onChromeLoad = function() {
	window.removeEventListener("load", onChromeLoad, false);
        if ("arguments" in window && window.arguments.length > 1 && window.arguments[1] == "iphone=true") {
            iphone = true;
            window.innerWidth = 387;
            window.innerHeight = 728;

            contentTabbrowser = document.getElementById("content");
            contentTabbrowser.style.width = iPhoneMetrics[angle].contentWidth;
            contentTabbrowser.style.height = iPhoneMetrics[angle].contentCollapsedHeight;
            contentTabbrowser.style.margin = iPhoneMetrics[angle].contentCollapsedMargin;
            contentTabbrowser.flex = 0;

            contentTabbrowser.addProgressListener({
                QueryInterface : function(iid)
                {
                    if (iid.equals(Components.interfaces.nsIWebProgressListener) ||
                        iid.equals(Components.interfaces.nsISupportsWeakReference) ||
                        iid.equals(Components.interfaces.nsISupports))
                    {
                        return this;
                    }

                    throw Components.results.NS_NOINTERFACE;
                },
                onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {},
                onLocationChange: function(aWebProgress, aRequest, aLocation) {
                    var selectedBrowser = contentTabbrowser.selectedBrowser;
                    if (selectedBrowser) {
                        if (selectedBrowser.currentURI) {
                            addressTextField.value = selectedBrowser.currentURI.spec;
                            addressTextField.tooltipText = selectedBrowser.currentURI.spec;
                        }
                    }
                },
                onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {},
                onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {},
                onSecurityChange: function(aWebProgress, aRequest, aState) {}
            });

            appcontentVbox = document.getElementById("appcontent");
            appcontentVbox.style.background = iPhoneMetrics[angle].appcontentBackground;
            appcontentVbox.style.width = 385;
            appcontentVbox.style.height = 726;
            appcontentVbox.style.maxwidth = 385;
            appcontentVbox.style.maxheight = 726;
            appcontentVbox.flex = 0;

            appcontentVbox.onmouseup = onAreaClick;

            addressTextField = document.createElement("textbox");
            addressTextField.setAttribute("id", "addressfield");
            addressTextField.setAttribute("flex", "0");
            addressTextField.setAttribute("multiline", "false");
            addressTextField.setAttribute("rows", "1");
            addressTextField.setAttribute("cols", iPhoneMetrics[angle].addressCols);
            addressTextField.setAttribute("style", iPhoneMetrics[angle].addressStyle);

            addressTextField.onkeypress = onKeyPress;

            appcontentVbox.insertBefore(addressTextField, contentTabbrowser);

            document.getElementById("browser").style.background = "black";

            // Listen to loading of URLs
            window.getBrowser().addEventListener("load", onLoadURL, true);
        }
    }

    window.addEventListener("load", onChromeLoad, false);
}).apply(LaunchiPhoneEmulator);

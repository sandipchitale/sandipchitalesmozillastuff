const nsIAppShellService    = Components.interfaces.nsIAppShellService;
const nsISupports           = Components.interfaces.nsISupports;
const nsICategoryManager    = Components.interfaces.nsICategoryManager;
const nsIComponentRegistrar = Components.interfaces.nsIComponentRegistrar;
const nsICommandLine        = Components.interfaces.nsICommandLine;
const nsICommandLineHandler = Components.interfaces.nsICommandLineHandler;
const nsIFactory            = Components.interfaces.nsIFactory;
const nsIModule             = Components.interfaces.nsIModule;
const nsIWindowWatcher      = Components.interfaces.nsIWindowWatcher;


const CHROME_URI = "chrome://youtubeviewer/content/youtubeviewer.xul";

const clh_contractID = "@netbeans.org/commandlinehandler/youtubeviewer;1?type=youtubeviewer";

// use uuidgen to generate a unique ID
const clh_CID = Components.ID("{2991c315-b871-42cd-b33f-bfee4fcbf682}");

// category names are sorted alphabetically. Typical command-line handlers use a
// category that begins with the letter "m".
const clh_category = "m-youtubeviewer";

/**
 * Utility functions
 */

/**
 * Opens a chrome window.
 * @param aChromeURISpec a string specifying the URI of the window to open.
 * @param aArgument an argument to pass to the window (may be null)
 */
function openWindow(aChromeURISpec)
{
    var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
    ww.openWindow(null, aChromeURISpec, "YouTubeViewer", "chrome", null);
}

/**
 * The XPCOM component that implements nsICommandLineHandler.
 * It also implements nsIFactory to serve as its own singleton factory.
 */
const commandlineHandler = {
    /* nsISupports */
    QueryInterface : function clh_QI(iid)
    {
        if (iid.equals(nsICommandLineHandler) ||
            iid.equals(nsIFactory) ||
            iid.equals(nsISupports))
        return this;

        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    /* nsICommandLineHandler */

    handle : function clh_handle(cmdLine)
    {
        var youtubeviewerFlag = cmdLine.handleFlag("youtubeviewer", false);
        if (youtubeviewerFlag) {
            openWindow(CHROME_URI);
            cmdLine.preventDefault = true;
        }
    },

    // CHANGEME: change the help info as appropriate, but
    // follow the guidelines in nsICommandLineHandler.idl
    // specifically, flag descriptions should start at
    // character 24, and lines should be wrapped at
    // 72 characters with embedded newlines,
    // and finally, the string should end with a newline
    helpInfo :
    "  -youtubeviewer search-term       View and edit the URI in in a window,\n" +
    "                       wrapping this description\n",

    /* nsIFactory */

    createInstance : function clh_CI(outer, iid)
    {
        if (outer != null)
        throw Components.results.NS_ERROR_NO_AGGREGATION;

        return this.QueryInterface(iid);
    },

    lockFactory : function clh_lock(lock)
    {
        /* no-op */
    }
};

/**
 * The XPCOM glue that implements nsIModule
 */
const commandlineHandlerModule = {
    /* nsISupports */
    QueryInterface : function mod_QI(iid)
    {
        if (iid.equals(nsIModule) ||
            iid.equals(nsISupports))
        return this;

        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    /* nsIModule */
    getClassObject : function mod_gch(compMgr, cid, iid)
    {
        if (cid.equals(clh_CID))
        return commandlineHandler.QueryInterface(iid);

        throw Components.results.NS_ERROR_NOT_REGISTERED;
    },

    registerSelf : function mod_regself(compMgr, fileSpec, location, type)
    {
        compMgr.QueryInterface(nsIComponentRegistrar);

        compMgr.registerFactoryLocation(clh_CID,
                                        "commandlineHandler",
                                        clh_contractID,
                                        fileSpec,
                                        location,
                                        type);

        var catMan = Components.classes["@mozilla.org/categorymanager;1"].
        getService(nsICategoryManager);
        catMan.addCategoryEntry("command-line-handler",
                                clh_category,
                                clh_contractID, true, true);
    },

    unregisterSelf : function mod_unreg(compMgr, location, type)
    {
        compMgr.QueryInterface(nsIComponentRegistrar);
        compMgr.unregisterFactoryLocation(clh_CID, location);

        var catMan = Components.classes["@mozilla.org/categorymanager;1"].
        getService(nsICategoryManager);
        catMan.deleteCategoryEntry("command-line-handler", clh_category);
    },

    canUnload : function (compMgr)
    {
        return true;
    }
};

/* The NSGetModule function is the magic entry point that XPCOM uses to find what XPCOM objects
 * this component provides
 */
function NSGetModule(comMgr, fileSpec)
{
    return commandlineHandlerModule;
}

# nwr-zoom-applet
A simple map applet for zooming to specified National Wildlife Refuge, for embedding. Based on ArcGIS API for JavaScript. Developed as a gesture of goodwill for our friends at US Fish & Wildlife Service.

No build system included. No gulp, bower, or yeoman. Just bare bones html, javascript, and the ArcGIS API for JavaScript.

Layers include a National Wildlife Refuges (NWR) polygon layer and a FWS Visitor Services locations point layer.

The purpose of this applet is to provide a static URL to zoom to a specified NWR, overlayed with the Visitor Services layer. Achieved via a query string in the URL, based on the 'LIT" or the "ORGNAME" field. To use, append a query to end of the URL: `?lit=KLP` or `?orgcode=12531`

Full example: `http://{domain}/nwr-zoom-applet?lit=KLP`


----------
Powered by [WiM](wim.usgs.gov)
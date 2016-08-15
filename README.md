# nwr-zoom-applet
A simple map applet for zooming to specified National Wildlife Refuge, for embedding. Based on ArcGIS API for JavaScript. Developed as a gesture of goodwill for our friends at US Fish & Wildlife Service.

No build system included. No gulp, bower, or yeoman. Just bare bones html, javascript, and the ArcGIS API for JavaScript.

Layers include a National Wildlife Refuges (NWR) polygon layer and a FWS Visitor Services locations point layer.

The purpose of this applet is to provide a static URL to zoom to a specified NWR, overlayed with the Visitor Services layer. Achieved via a query string in the URL, based on the 'LIT" or the "ORGNAME" field. To use, append a query to end of the URL: `?lit=KLP` or `?orgcode=12531`

Full example: `http://{domain}/nwr-zoom-applet?lit=KLP`


#### Dependencies
App is built with the ArcGIS API for JavaScript, version 3.13.
Bootstrap v3.3.7
Esri [bootstrap map](https://github.com/Esri/bootstrap-map-js)
Dojo Tundra theme for ArcGIS JS API
jQuery v1.11.1


#### Map Services
This application depends on 3 layers sourced from 2 map services hosted by FWS and ArcGIS Online:

https://gis.fws.gov/arcgis/rest/services/FWSCadastral_Internet/MapServer
Layers used: National Wildlife Refuges (>3M) (ID: 0) and National Wildlife Refuges (<3M) (ID: 2)


http://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWSVisitorServices/FeatureServer
Layer used: FWS Visitor Services (ID:0)

----------
Powered by [WiM](wim.usgs.gov)
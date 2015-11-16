//global variables
var map, nwrLayer, nwrDynamicLayer, visitorServiceLayer;
require([
    "esri/map",
    "esri/config",
    "esri/graphicsUtils",
    "esri/geometry/Polygon",
    "esri/geometry/Extent",
    "esri/symbols/SimpleFillSymbol",
    'esri/layers/FeatureLayer',
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/urlUtils",
    "dojo/domReady!"
], function (
    Map,
    esriConfig,
    graphicsUtils,
    Polygon,
    Extent,
    SimpleFillSymbol,
    FeatureLayer,
    ArcGISDynamicMapServiceLayer,
    QueryTask,
    Query,
    urlUtils
) {
    map = new Map("map", {
        basemap: "topo",
        wrapAround180: true,
        extent: new Extent({xmin:-14284551.845930014,ymin:2700367.3352579884,xmax:-7240115.31917005,ymax:6750918.338144969,spatialReference:{wkid:102100}}),
        slider: true,
        sliderStyle: "small",
        logo: false
    });

    nwrLayer = new FeatureLayer("https://gis.fws.gov/arcgis/rest/services/FWSCadastral_Simplified/FeatureServer/0", {id: "nwr", visible:true, opacity: 0.65, mode: FeatureLayer.MODE_ONDEMAND, outFields: ["*"]});
    map.addLayer(nwrLayer);

    //visitor service layer as feature layer
    visitorServiceLayer = new FeatureLayer("http://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWSVisitorServices/FeatureServer/0", {id: "visitorService", visible:true, mode: FeatureLayer.MODE_ONDEMAND, outFields: ["*"]});
    map.addLayer(visitorServiceLayer);

    //nwrDynamicLayer = new ArcGISDynamicMapServiceLayer("http://gis.fws.gov/arcgis/rest/services/FWSCadastral_Internet/MapServer", {id: "nwrDynamic"});
    //map.addLayer(nwrDynamicLayer);
    //disable client caching to allow refreshing of layer definition
    //nwrDynamicLayer.setDisableClientCaching(true);

    require(["dojo/on"], function (on) {

        on(map, "load", mapReady);

        function zoomToRefuge (featureSet) {
            //layer definition setting for dynamic layer
            // var layerDefinitions = [];
            //var lit = featureSet.features[0].attributes.LIT;
            //layerDefinitions[0] = "LIT = " + lit;
            //nwrDynamicLayer.setLayerDefinitions(layerDefinitions[0]);
            //nwrDynamicLayer.refresh();
            //definition expression for feature layer
            //nwrLayer.setDefinitionExpression("LIT = '" + lit + "'");
            var refugePolysExtent = graphicsUtils.graphicsExtent(featureSet.features);
            map.setExtent(refugePolysExtent, true);
            //window.history.pushState(null,null,"?lit=" + featureSet.features[0].attributes.LIT);
        }

      function mapReady(){
        //build query task
        queryTask = new QueryTask("https://gis.fws.gov/arcgis/rest/services/FWSCadastral_Simplified/FeatureServer/0");
        //build query filter
        refugeQuery = new Query();
        refugeQuery.returnGeometry = true;
        refugeQuery.outFields = ["LIT"];
         //pass the url parameters into a javascript object using esri's urlToObject class
        var urlSiteObject = esri.urlToObject(document.location.href);
        
        if (urlSiteObject.query){

          if (urlSiteObject.query.lit){
            var id = urlSiteObject.query.lit;
            //set query based on the parameter(s) from the URL
            var idParam = "LIT = '" + id + "'";
            refugeQuery.where = idParam;
            //execute query and call zoomToRefuge on completion
            queryTask.execute(refugeQuery,zoomToRefuge);
          }
        }
      }
    });
});
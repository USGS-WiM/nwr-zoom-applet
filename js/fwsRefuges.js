//global variables
var map, nwrLayer, nwrDynamicLayer, visitorServiceLayer, dialog;
require([
    "esri/map",
    "application/bootstrapmap",
    "esri/dijit/BasemapGallery",
    "esri/dijit/HomeButton",
    "esri/dijit/Scalebar",
    "esri/config",
    "dojo/on",
    "esri/graphicsUtils",
    "esri/geometry/Polygon",
    "esri/geometry/Extent",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "esri/graphic",
    "esri/lang",
    "dojo/number",
    "dojo/dom-style",
    "esri/renderers/SimpleRenderer",
    'esri/layers/FeatureLayer',
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "dijit/TooltipDialog",
    "dijit/popup",
    "esri/urlUtils",
    "dojo/domReady!"
], function (
    Map,
    BootstrapMap,
    BasemapGallery,
    HomeButton,
    Scalebar,
    esriConfig,
    on,
    graphicsUtils,
    Polygon,
    Extent,
    SimpleFillSymbol,
    SimpleLineSymbol,
    Color,
    Graphic,
    esriLang,
    number,
    domStyle,
    SimpleRenderer,
    FeatureLayer,
    ArcGISDynamicMapServiceLayer,
    QueryTask,
    Query,
    TooltipDialog,
    dijitPopup,
    urlUtils
) {
    //map = new Map("map", {
    //    basemap: "topo",
    //    wrapAround180: true,
    //    extent: new Extent({xmin:-14284551.845930014,ymin:2700367.3352579884,xmax:-7240115.31917005,ymax:6750918.338144969,spatialReference:{wkid:102100}}),
    //    slider: true,
    //    sliderStyle: "small",
    //    logo: false
    //});
    map = BootstrapMap.create("mapDiv",{
        basemap:"topo",
        center:[-98.5795,39.8282],
        zoom:5,
        logo: false
    });
    var scalebar = new Scalebar({map: map, scalebarUnit: "dual"});

    var home = new HomeButton({
        map: map
    }, "HomeButton");
    home.startup();

    $(document).ready(function() {
        $("#basemapsDropdown li").click(function (e) {
            switch (e.target.text) {
                case "Streets":
                    map.setBasemap("streets");
                    break;
                case "Imagery":
                    map.setBasemap("hybrid");
                    break;
                case "Topographic":
                    map.setBasemap("topo");
                    break;
            }
        });
    });
    //national wildlife refuges outline as feature layer(>3M)
    nwrOutlineLayer = new FeatureLayer("https://gis.fws.gov/arcgis/rest/services/FWSCadastral_Internet/MapServer/0", {id: "nwrOutline", visible:true, mode: FeatureLayer.MODE_ONDEMAND, outFields: ["*"]});
    map.addLayer(nwrOutlineLayer);
    //national wildlife refuges as feature layer (<3M)
    nwrLayer = new FeatureLayer("https://gis.fws.gov/arcgis/rest/services/FWSCadastral_Internet/MapServer/2", {id: "nwr", visible:true, mode: FeatureLayer.MODE_ONDEMAND, outFields: ["*"]});
    map.addLayer(nwrLayer);

    //visitor service layer as feature layer
    visitorServiceLayer = new FeatureLayer("http://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWSVisitorServices/FeatureServer/0", {id: "visitorService", visible:true, mode: FeatureLayer.MODE_ONDEMAND, outFields: ["*"]});
    map.addLayer(visitorServiceLayer);

    //national wildlife refuges as dynamic layer
    //nwrDynamicLayer = new ArcGISDynamicMapServiceLayer("http://gis.fws.gov/arcgis/rest/services/FWSCadastral_Internet/MapServer", {id: "nwrDynamic"});
    //map.addLayer(nwrDynamicLayer);
    //disable client caching to allow refreshing of layer definition
    //nwrDynamicLayer.setDisableClientCaching(true);
    dialog = new TooltipDialog({
        id: "tooltipDialog",
        style: "position: absolute; width: 250px; height:100%; font: normal normal normal 10pt Helvetica;z-index:100"
    });
    dialog.startup();

    var nwrHighlightSymbol = new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([68,204,0]), 3
        ),
        new Color([125,125,125,0.35])
    );
    //close the dialog when the mouse leaves the nwr highlight graphic or close button clicked
    //map.on("load", function(){
    //    map.graphics.enableMouseEvents();
    //    map.graphics.on("mouse-out", closeDialog);
    //});
    nwrLayer.on("click", function(evt){
        var t = "<b><button id='closeDialog' style='color:gray; float:right;'>&times;</button>${CMPXNAME}</b><hr>${ORGNAME}";
        var content = esriLang.substitute(evt.graphic.attributes,t);
        var highlightGraphic = new Graphic(evt.graphic.geometry,nwrHighlightSymbol);
        map.graphics.add(highlightGraphic);

        dialog.setContent(content);
        domStyle.set(dialog.domNode, "opacity", 0.85);
        dijitPopup.open({
            popup: dialog,
            x: evt.pageX,
            y: evt.pageY
        });
        $('#closeDialog').click(closeDialog);
    });

    visitorServiceLayer.on("click", function(evt){
        var t = "<button id='closeDialog' style='color:gray; float:right;'>&times;</button><b>${ORGNAME}</b><br>" +
            "${BldgType}<br>" +
            "<b>Phone</b>: ${PHONE}<br>" +
            "${ADDRESS}<br>" +
            "${CITY}, ${STATE} ${ZIPCODE}<br>" +
            "<b>Latitude:</b>${LAT}<br>" +
            "<b>Longitude:</b>${LONG}<br>" +
            "<a href='${URL}'>Refuge Page Link</a>";
        var content = esriLang.substitute(evt.graphic.attributes,t);

        dialog.setContent(content);

        domStyle.set(dialog.domNode, "opacity", 0.85);
        dijitPopup.open({
            popup: dialog,
            x: evt.pageX,
            y: evt.pageY
        });
        $('#closeDialog').click(closeDialog);
    });

    function closeDialog() {
        map.graphics.clear();
        dijitPopup.close(dialog);
    }

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
    var queryTask = new QueryTask("https://gis.fws.gov/arcgis/rest/services/FWSCadastral_Internet/MapServer/2");
    //build query filter
    var refugeQuery = new Query();
    refugeQuery.returnGeometry = true;
    refugeQuery.outFields = ["LIT", "ORGCODE"];
     //pass the url parameters into a javascript object using esri's urlToObject class
    var urlSiteObject = esri.urlToObject(document.location.href);

    if (urlSiteObject.query){
      //check for LIT
      if (urlSiteObject.query.lit){
        var lit = urlSiteObject.query.lit;
        //set query based on the parameter(s) from the URL
        var litParam = "LIT = '" + lit + "'";
        refugeQuery.where = litParam;
        //execute query and call zoomToRefuge on completion
        queryTask.execute(refugeQuery,zoomToRefuge);
      }
      //check for ORGCODE
      if (urlSiteObject.query.orgcode){
        var orgcode = urlSiteObject.query.orgcode;
        //set query based on the parameter(s) from the URL
        var orgCodeParam = "ORGCODE = '" + orgcode + "'";
        refugeQuery.where = orgCodeParam;
        //execute query and call zoomToRefuge on completion
        queryTask.execute(refugeQuery,zoomToRefuge);
      }
    }
  }
});
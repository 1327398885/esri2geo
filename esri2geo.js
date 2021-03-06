var esri2geo = {};
(function () {
  function toGeoJSON(data, cb){
    if(typeof data === 'string'){
      if(cb){
        ajax(data, function(err, d){
        	toGeoJSON(d,cb);
        });
        return;
      }else{
        throw new TypeError('callback needed for url');
      }
    }
    var outPut = { "type": "FeatureCollection","features": []};
    var fl = data.features.length;
    var i = 0;
    while(fl>i){
      var ft = data.features[i];
      var outFT = {
        "type": "Feature",
        "properties":prop(ft.attributes)
      };
      if(ft.geometry.x){
        outFT.geometry=point(ft.geometry);
      }else if(ft.geometry.points){
        outFT.geometry=points(ft.geometry);
      }else if(ft.geometry.paths){
        outFT.geometry=line(ft.geometry);
      }else if(ft.geometry.rings){
        outFT.geometry=poly(ft.geometry);
      }
      outPut.features.push(outFT);
      i++;
    }
    cb(null, outPut);
  }
  function point(geometry){
    return {"type": "Point","coordinates": [geometry.x,geometry.y]};  
  }
  function points(geometry){
    if(geometry.points.length===1){
      return {"type": "Point","coordinates": geometry.points[0]};
    }else{
      return { "type": "MultiPoint","coordinates":geometry.points}; 
    }
  }
  function line(geometry){
    if(geometry.paths.length===1){
      return {"type": "LineString","coordinates": geometry.paths[0]};
    }else{
      return { "type": "MultiLineString","coordinates":geometry.paths}; 
    }
  }
  function poly(geometry){
    if(geometry.rings.length===1){
      return {"type": "Polygon","coordinates": geometry.rings};
    }else{
      return decodePolygon(geometry.rings);
    }
  }
  function decodePolygon(a){
    var coords = [],type;
    var len = a.length;
    var i = 0;
    var len2 = coords.length-1;
    while(len>i){
      if(ringIsClockwise(a[i])){
        coords.push([a[i]]);
        len2++;
      }else{
        coords[len2].push(a[i]);
      }
      i++;
    }
    if(coords.length===1){
      type="Polygon";
    }else{
      type="MultiPolygon";
    }
    return {"type":type,"coordinates":(coords.length===1)?coords[0]:coords};
  }
  function ringIsClockwise(ringToTest) {
    var total = 0,
      i = 0,
      rLength = ringToTest.length,
      pt1 = ringToTest[i],
      pt2;
    for (i; i < rLength - 1; i++) {
      pt2 = ringToTest[i + 1];
      total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
      pt1 = pt2;
    }
    return (total >= 0);
  }
  function prop(a){
    var p = {};
    for(var k in a){
      if(a[k]){
        p[k]=a[k];  
      }
    }
    return p;
  }


  function ajax(url, cb){
    if(typeof module !== "undefined"){
        var request = require("request");
        request(url,{json:true},function(e,r,b){
          cb(e,b);
        });
        return;
    }
    var response;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status === 200) {
          cb(null, JSON.parse(req.responseText));
      }
    };
    req.open("GET", url);
    req.send();
  }
  if (typeof module !== "undefined"){
    module.exports = toGeoJSON;
  } else {
    esri2geo.toGeoJSON = toGeoJSON;
  }
}());
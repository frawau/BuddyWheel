/*
* Colourwheel
* Copyright (c) 2015 François Wautier
* Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*/
/*
 * Added to correct problem with Chrome 48 removing this function
 */
SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(elem) {
    return elem.getScreenCTM().inverse().multiply(this.getScreenCTM());
};
colourwheel = function(target, size, prefix){
    var hue=0,
        satu=50,
        bright=65,
        bu_callback,
        bu_gencallback,
        idprefix = prefix || "bu-",
        nbseg = 180,
        angle = 360/nbseg;;
            
    function toRadians (angle) {
        return (90-angle) * (Math.PI / 180);
    }
    
    function toDegrees (radians) {
        var deg = (radians * 180 / Math.PI)-90;
        if ( deg < 0) {
            return 360 + deg;
        }
        return deg;
    }
          
    function toHSL(colour){
        var h = colour[0];
        var l = (2 - colour[1] / 100) * colour[2] / 2; // Ligh. range 0-100
        var s = Math.round( colour[1] * colour[2] / (l<50 ? l * 2 : 200 - l * 2) );
        l = Math.round( l );
        return [h,s,l];
    }
    
    function toHSB(colour){
        var t = colour[1] * (colour[2]<50 ? colour[2] : 100-colour[2]) / 100; 
        var s = Math.round( 200 * t / (colour[2]+t) );
        var b = Math.round( t+colour[2] );
        return [colour[0],s,b]
    }
    
    function set_colour(B) {
        set_hue(B[0]);
        var hsvcol = B;
        var sat = Math.round(752.5-((hsvcol[1]*505)/100));
        var val = Math.round(252.5+((hsvcol[2]*505)/100)) ;
        set_sv(sat,val);
        if (bu_callback) {
            bu_callback(get_colour());
        }
    }

    function get_colour() {
        var h = hue;
        var s = Math.round(100-((satu-252.5)/505)*100)
        var l = Math.round(((bright-252.5)/505)*100)
        return [h,s,l]
    }
     
    function get_hsl_colour() {
        var h = hue;
        var s = Math.round(100-((satu-252.5)/505)*100)
        var l = Math.round(((bright-252.5)/505)*100)
        return toHSL([h,s,l])
    }
    
    function onchange(fcnt) {
        bu_callback=fcnt;
    }
    
    function onChange(fcnt) {
        bu_gencallback=fcnt;
    }
    
    function trackHue(e) {
        e.preventDefault();
        var svgobj =  document.getElementById(idprefix+"colourwheel");
        var pt = svgobj.createSVGPoint();
        if ((e.clientX)&(e.clientY)) {
            pt.x = e.clientX;
            pt.y = e.clientY;
        } else  if (e.targetTouches) {
            pt.x = e.targetTouches[0].clientX;
            pt.y = e.targetTouches[0].clientY;
        }
        var globalPoint = pt.matrixTransform(svgobj.getScreenCTM().inverse());
        var dragobj =  document.getElementById(idprefix+"hue-wheel");
        var globalToLocal = dragobj.getTransformToElement(svgobj).inverse();
        var inObjectSpace = globalPoint.matrixTransform( globalToLocal );
        //Find the angle
        var angle = toDegrees(Math.atan2(500-inObjectSpace.y,500-inObjectSpace.x));
        hue = angle;
        set_hue(angle);
        if (bu_callback) {
            bu_callback(get_colour());
        }
        if (bu_gencallback) {
            bu_gencallback(e);
        }
        return false;
    } 
    function set_hue(angle) {
        var myelt = document.getElementById(idprefix+"sat-value");
        myelt.setAttribute("transform","rotate("+angle+" 500 500)");
        var mydiv=0;
        while ( mydiv < 100 ) {
            myelt = document.getElementById(idprefix+"stop-colour-"+mydiv);
            
            var myhsl=toHSL([Math.round(angle),mydiv,100])
            myelt.setAttribute("stop-color", "hsl("+Math.round(angle)+","+myhsl[1]+"%,"+myhsl[2]+"%");
            mydiv += 1;
            }
            var myelt = document.getElementById(idprefix+"cw-sv-handle");
            myelt.setAttribute("stroke","hsl("+(Math.round(angle+180)) % 360+",80%,50%)");
    };
    function startTrackHue(e) {
        if ( e.type == "mousedown") {
            document.addEventListener("mousemove", trackHue);
            document.addEventListener("mouseup", stopTrackHue);
        } else {
            document.addEventListener("touchmove", trackHue);
            document.addEventListener("touchend", stopTrackHue);
        }
    };
    function stopTrackHue(e) {
        if ( e.type == "mouseup") {
            document.removeEventListener("mousemove", trackHue);
            document.removeEventListener("mouseup", stopTrackHue);
        } else {
            document.removeEventListener("touchmove", trackHue);
            document.removeEventListener("touchend", stopTrackHue);
        }
    };
    
    function in_SVW (px,py) {
        var ax = 252.5;
        var ay = 747.5;
        return (px >= ax) && (py >= ax) && (px <= ay) && (py <= ay)

    }
    
    function trackSV(e) {
        e.preventDefault();
        var svgobj =  document.getElementById(idprefix+"colourwheel");
        var pt = svgobj.createSVGPoint();
        if ((e.clientX)&(e.clientY)) {
            pt.x = e.clientX;
            pt.y = e.clientY;
        } else  if (e.targetTouches) {
            pt.x = e.targetTouches[0].clientX;
            pt.y = e.targetTouches[0].clientY;
        }
        var globalPoint = pt.matrixTransform(svgobj.getScreenCTM().inverse());
        var dragobj = document.getElementById(idprefix+"cw-sv-handle")
        var globalToLocal = dragobj.getTransformToElement(svgobj).inverse();
        var inObjectSpace = globalPoint.matrixTransform( globalToLocal );
        if ( in_SVW (inObjectSpace.x,inObjectSpace.y) ) { 
            bright = inObjectSpace.x;
            satu = inObjectSpace.y
            dragobj.setAttribute("cx",inObjectSpace.x);
            dragobj.setAttribute("cy",inObjectSpace.y);
            
            if (bu_callback) {
                bu_callback(get_colour());
            }
            
            if (bu_gencallback) {
                bu_gencallback(e);
            }
        }
        return false;
    }
    
    function set_sv(sat,val) {
       if ( in_SVW (val,sat) ) { 
            satu = sat;
            bright = val;
            var dragobj = document.getElementById(idprefix+"cw-sv-handle")
            dragobj.setAttribute("cx",val);
            dragobj.setAttribute("cy",sat);
       }
    }
    
    function startTrackSV(e) {
        if ( e.type == "mousedown") {
            document.addEventListener("mousemove", trackSV);
            document.addEventListener("mouseup", stopTrackSV);
        } else {
            document.addEventListener("touchmove", trackSV);
            document.addEventListener("touchend", stopTrackSV);
        }
    };
    function stopTrackSV(e) {
        if ( e.type == "mouseup") {
            document.removeEventListener("mousemove", trackSV);
            document.removeEventListener("mouseup", stopTrackSV);
        } else {
            document.removeEventListener("touchmove", trackSV);
            document.removeEventListener("touchend", stopTrackSV);
        }
    };

    function create ( target, size) {
        
        var newElement, onewElement;
        var svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); //Create a path in SVG's namespace
        svgElement.setAttribute("id",idprefix+"colourwheel");
        svgElement.setAttribute("viewBox","0 0 1000 1000");
        svgElement.setAttribute("width", size);
        svgElement.setAttribute("height", size);
        var defsElement = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
        defsElement.setAttribute("id",idprefix+"wheel-defs");
        
        newElement = document.createElementNS("http://www.w3.org/2000/svg", 'clipPath');
        newElement.setAttribute("id",idprefix+"sv-clipPath");
        onewElement = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
        onewElement.setAttribute("points","252.5,252.5 252.5,747.5 747.5,747.5 747.5,252.5");
        //onewElement.setAttribute("points","500,150 196.9,675 808.1,675");
        newElement.appendChild(onewElement);
        defsElement.appendChild(newElement);
        svgElement.appendChild(defsElement);

        
        var hwElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        hwElement.setAttribute("id",idprefix+"hue-wheel");
        svgElement.appendChild(hwElement)
        
        var svElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        svElement.setAttribute("id",idprefix+"sat-value");
        var gradElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        gradElement.setAttribute("id",idprefix+"value-grad");
        gradElement.setAttribute("style","clip-path: url(#"+idprefix+"sv-clipPath);")
        svElement.appendChild(gradElement)
        svgElement.appendChild(svElement)
        //The Hue Wheel
        newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        var mypath = "M 500,150 v -100 A 450,450 0 0,1 ";
        
        var cx = 500 + Math.cos(toRadians(angle))*450;
        var cy = 500 - Math.sin(toRadians(angle))*450;
        mypath += cx+","+cy+" L ";
        cx = 500 + Math.cos(toRadians(angle))*350;
        cy = 500 - Math.sin(toRadians(angle))*350;
        mypath += cx+","+cy+" M 500,150 A 350,350 0 0,1 "+cx+","+cy;
        newElement.setAttribute("id",idprefix+"wheelsegment");
        newElement.setAttribute("d",mypath);
        newElement.setAttribute("fill-rule","evenodd");
        hwElement.appendChild(newElement);
        //Re-use element , rotate it and set colour
        var cangle =  0 ; //tricky... We cover the original elt with a clone to get "fill"
        while ( cangle < 360 ) {
            newElement = document.createElementNS("http://www.w3.org/2000/svg", 'use');
            newElement.setAttributeNS('http://www.w3.org/1999/xlink','href',"#"+idprefix+"wheelsegment");
            newElement.setAttribute("transform","rotate("+cangle+" 500 500)")
            newElement.setAttribute("style","fill: hsl("+cangle+",90%,50%);");
            hwElement.appendChild(newElement);
            cangle += angle
        }
        
        var mydiv=0;
        var myLG, xstart, astop;
        // Create as many Linear gradients as we need, the middle "stop" has an id
        while ( mydiv < 100 ) {
            var ystart= 747.5 - (5.05*(mydiv+1))  // 5.05 = 2*252.5)/100;
            myLG = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
            myLG.setAttribute("id", idprefix+"LGID-"+mydiv);
            myLG.setAttribute("x1", "0%");
            myLG.setAttribute("x2", "100%");
            myLG.setAttribute("y1", "0%");
            myLG.setAttribute("y2", "0%");
            astop= document.createElementNS("http://www.w3.org/2000/svg", "stop");
            astop.setAttribute("offset", "0%");
            var myhsl=toHSL([0,mydiv,0])
            astop.setAttribute("stop-color", "hsl(0,"+myhsl[1]+"%,"+myhsl[2]+"%");
            myLG.appendChild(astop);
            astop= document.createElementNS("http://www.w3.org/2000/svg", "stop");
            astop.setAttribute("id", idprefix+"stop-colour-"+mydiv);
//             astop.setAttribute("offset", "50%");
//             myhsl=toHSL([0,mydiv,50])
//             astop.setAttribute("stop-color", "hsl(0,"+myhsl[1]+"%,"+myhsl[2]+"%");
//             myLG.appendChild(astop);
//             astop= document.createElementNS("http://www.w3.org/2000/svg", "stop");
            astop.setAttribute("offset", "100%");
            myhsl=toHSL([0,mydiv,100])
            astop.setAttribute("stop-color", "hsl(0,"+myhsl[1]+"%,"+myhsl[2]+"%");
            myLG.appendChild(astop);
            defsElement.appendChild(myLG);
            // The clipped rect
            myLG = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            myLG.setAttribute("style","fill:url(#"+idprefix+"LGID-"+mydiv+");");
            myLG.setAttribute("x", 252.5);
            myLG.setAttribute("y",ystart);
            myLG.setAttribute("width", 505);
            myLG.setAttribute("height", 8.5);
            gradElement.appendChild(myLG);
            mydiv += 1;
        }
            
        newElement = document.createElementNS("http://www.w3.org/2000/svg", 'polygon'); 
        newElement.setAttribute("points","252.5,252.5 252.5,747.5 747.5,747.5 747.5,252.5");
        newElement.setAttribute("style","fill: transparent; stroke: black; stroke-width: 1;");
        //newElement.setAttribute("style","fill: url(#myLGID-XX); stroke: black; stroke-width: 1;");
        svElement.appendChild(newElement);
        newElement = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        newElement.setAttribute("style","stroke:rgb(0,0,0);stroke-width:10;");
        newElement.setAttribute("x1",500);
        newElement.setAttribute("y1",252.5);
        newElement.setAttribute("x2",500);
        newElement.setAttribute("y2",25);
        svElement.appendChild(newElement);
        var huehandle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        //huehandle.setAttribute("id",idprefix+"cw-hue-handle");
        huehandle.setAttribute("style","fill:black");
        huehandle.setAttribute("cx",500);
        huehandle.setAttribute("cy",25);
        huehandle.setAttribute("r",25);
        svElement.appendChild(huehandle);
        var huehandle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        huehandle.setAttribute("id",idprefix+"cw-hue-handle");
        huehandle.setAttribute("style","fill:transparent; stroke none;");
        huehandle.setAttribute("cx",500);
        huehandle.setAttribute("cy",25);
        huehandle.setAttribute("r",40);
        svElement.appendChild(huehandle);
        var svhandle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        svhandle.setAttribute("id",idprefix+"cw-sv-handle");
        svhandle.setAttribute("fill","transparent");
        svhandle.setAttribute("stroke","black");
        svhandle.setAttribute("stroke-width",10);
        svhandle.setAttribute("cx",500);
        svhandle.setAttribute("cy",500);
        svhandle.setAttribute("r",25);
        svElement.appendChild(svhandle);
        
        huehandle.addEventListener("mousedown", startTrackHue);
        huehandle.addEventListener("touchstart", startTrackHue);
        svhandle.addEventListener("mousedown", startTrackSV);
        svhandle.addEventListener("touchstart", startTrackSV);
        svElement.addEventListener("click", trackSV);
        svElement.addEventListener("touchstart", trackSV);
        hwElement.addEventListener("click", trackHue);
        hwElement.addEventListener("touchstart", trackHue);
        target.appendChild(svgElement)
        set_colour([0,50,65])
        return signature()
    };
         
    //   Integration with buddyguilib
    function setValue(V) {
        this.set_colour([V["hue"],V["saturation"],V["value"]])
    }
    function getValue() {
        var resu = this.get_colour();
        return {"hue":resu[0],"saturation":resu[1],"value":resu[2]}
    } 

    // The object returned
    function signature(){
        return {
            onchange: onchange,
            set_colour : set_colour,
            get_colour : get_colour,
            get_hsl_colour : get_hsl_colour,
            val: get_colour,
            setValue: setValue,
            getValue: getValue,
            onChange: onChange,
        };
    }
    
    return create(target,size);
}

// Integration with buddyguilib. Providing "colourpicker" widget
if ( typeof buwidgetRegistry !== 'undefined' ) {
    var buwrprefix=1;
    buwidgetRegistry["colourpicker"]= function( target , hsize, vsize ) {
        buwrprefix+=1;
        return colourwheel( target, hsize, "bucw"+buwrprefix+"-")
    }
}
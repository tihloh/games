function genWof(){
	$.ajax({
		url: 'wofdata.json', // Replace 'yourfile.json' with the path to your JSON file
		dataType: 'json',
		success: function(data) {
			generateWof(data);
		},error: function() {
			console.error('Failed to read wof data!');
		}
	});
}

var overlayObj;
var overlaymessage;
function generateWof(data){
	if(data==""){
		data = [
			{"label":"1 hour",  "value":1, "message":"You won 1 hour"},
			{"label":"Bokya",  "value":0, "message":"BOKYA!"},
			{"label":"30 mins",  "value":1, "message":"You won 30 minutes"},
			{"label":"Bokya",  "value":0, "message":"BOKYA!"},
		];
	}
	
	var padding = {top:0, right:40, bottom:0, left:0},
		w = 300 - padding.left - padding.right,
		h = 300 - padding.top  - padding.bottom,
		r = Math.min(w, h)/2,
		rotation = 0,
		oldrotation = 0,
		picked = 100000,
		oldpick = [],
		color = d3.scale.category20();

	var svg = d3.select('#wofchart')
		.append("svg")
		.data([data])
		.attr("width",  w + padding.left + padding.right)
		.attr("height", h + padding.top + padding.bottom);

	var container = svg.append("g")
		.attr("class", "chartholder")
		.attr("transform", "translate(" + (w/2 + padding.left) + "," + (h/2 + padding.top) + ")");

	var vis = container.append("g");
		
	var pie = d3.layout.pie().sort(null).value(function(d){return 1;});

	// declare an arc generator function
	var arc = d3.svg.arc().outerRadius(r);

	// select paths, use arc generator to draw
	var arcs = vis.selectAll("g.slice")
		.data(pie)
		.enter()
		.append("g")
		.attr("class", "slice");
		

	arcs.append("path")
		.attr("fill", function(d, i){ return color(i); })
		.attr("d", function (d) { return arc(d); });

	// add the text
	arcs.append("text").attr("transform", function(d){
			d.innerRadius = 0;
			d.outerRadius = r;
			d.angle = (d.startAngle + d.endAngle)/2;
			return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius -10) +")";
		})
		.attr("text-anchor", "end")
		.text( function(d, i) {
			return data[i].label;
		});

	container.on("click", spin);


	function spin(d){
		/*
		//all slices have been seen, all done
		if(oldpick.length == (data.length - 1)){
			console.log("done");
			container.on("click", null);
			return;
		}
		*/
		var ps = 360/data.length, pieslice = Math.round(1440/data.length), rng = Math.floor((Math.random() * 1440) + 360);
			
		rotation = (Math.round(rng / ps) * ps);
		
		picked = Math.round(data.length - (rotation % 360)/ps);
		picked = picked >= data.length ? (picked % data.length) : picked;

		/*
		if(oldpick.indexOf(picked) !== -1){
			d3.select(this).call(spin);
			return;
		} else {
			oldpick.push(picked);
		}
		*/

		rotation += 90 - Math.round(ps/2);

		vis.transition()
			.duration(3000)
			.attrTween("transform", rotTween)
			.each("end", function(){
				/*
				//mark message as seen
				d3.select(".slice:nth-child(" + (picked + 1) + ") path")
					.attr("fill", "#111");
				*/

				try{handleWofResult(data[picked]);}catch(e){}
				oldrotation = rotation;
			});
	}

	//make arrow
	svg.append("g")
		.attr("transform", "translate(" + (w + padding.left + padding.right) + "," + ((h/2)+padding.top) + ")")
		.append("path")
		.attr("d", "M-" + (r*.15) + ",0L0," + (r*.05) + "L0,-" + (r*.05) + "Z")
		.style({"fill":"black"});

	//draw spin circle
	container.append("circle")
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", 40)
		.style({"fill":"white","cursor":"pointer"});

	//spin text
	container.append("text")
		.attr("x", 0)
		.attr("y", 15)
		.attr("text-anchor", "middle")
		.text("SPIN")
		.style({"font-weight":"bold", "font-size":"30px"});


	function rotTween(to) {
		var i = d3.interpolate(oldrotation % 360, rotation);
		return function(t) {return "rotate(" + i(t) + ")";};
	}

}
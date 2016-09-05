// copyright Eugene Ivanov
// e-ivanov.ru/
// Eugene Ivanov <eugene.ivanov@gmail.com>
//
jQuery(function() {
    var $ = jQuery;

	var ignition = function() {
	    //console.log('ignition');

    	var base_url = 'https://www.strava.com';

    	var gd = $('#map-type-control');
    	if (gd.length) {

    		var mm = window.location.href.match(/^.*?\/(activities|routes|segments)\/(\d+).*?$/i);

    		if (!mm) {
    			return false;
    		}

    		var type = mm[1];
    		var id = mm[2]|0;

    		var href = ' ';
    		if (type == 'routes') {
    			href = ' href="'+base_url+'/routes/'+id+'/export_gpx'+'" ';
    		}

    		var button = $('<a'+href+'class="button'+(type == 'segments' ? ' drop-down-menu' : '')+'" id="gpx-export" title="GPX export via extension">GPX export</a>');
    		button.insertBefore(gd);

    		/*
    		var fullscreen_button = $('<a class="button" id="toggle-fullscreen" rel="noreferrer"></a>');
    		fullscreen_button.insertBefore(gd);

    		fullscreen_button.bind('click', function(event) {
    			var s = Strava.Maps.FullScreenHandler.getInstance(r);
    			s.handler();
    		});
    		*/

    		button.bind('click', function(event) {
	    		if (type == 'routes') {
	    			return true;
	    		}

    			var title = document.title;

                httpLoad(
                	base_url+'/activities/'+id+'/facebook_open_graph_metadata',
                    function(html) {

                    	var mm = html.match(/<meta[^>]+content='([^']+)'[^>]+property='fitness:metrics:timestamp'[^>]*?>/im);

                    	if (mm && typeof mm[1] != 'undefined') {
    				        var start_time = (new Date(mm[1])).getTime();

    						//https://www.strava.com/stream/segments/12246849?streams%5B%5D=latlng&streams%5B%5D=distance&streams%5B%5D=altitude&_=1467826323538

    						var path = '/stream/';
    						if (type == 'segments') {
    							path += 'segments/';
    						}

                            httpLoad(
                            	base_url+path+id+'?streams%5B%5D=latlng&streams%5B%5D=distance&streams%5B%5D=altitude&streams%5B%5D=time&streams%5B%5D=moving',
                                function(html) {
                                	var o = JSON.parse(html);

                                	if (o && typeof o['latlng'] != 'undefined' && o['latlng'].length) {
                                		var r = [];

                                		r.push('<?xml version="1.0" encoding="UTF-8"?>');
                                		r.push('<gpx version="1.1" creator="Exported from Strava via extension e-ivanov.ru"');
                                		r.push('  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd"');
                                		r.push('  xmlns="http://www.topografix.com/GPX/1/1"');
                                		r.push('  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"');
                                		r.push('  xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
                                		r.push('<metadata><link href="http://e-ivanov.ru"><text>Strava gpx export</text></link><time>'+(new Date().toISOString())+'</time></metadata>');
                                		r.push('<trk>');
                                		r.push('<name>'+title+'</name>');
                                		r.push('<trkseg>');

                                		var date = new Date();

                                		var i, c = o['latlng'], l = c.length, e, alt, time;
                                		for (i=0; i < l; i++) {
                                			e = c[i];

                                			alt = o['altitude'][i];
                                			if (typeof alt == 'undefined') {
                                				alt = 0;
                                			}

                                			time = !o['time'] ? i : o['time'][i];

                                			if (typeof time == 'undefined') {
                                				time = 0;
                                			}
                                			time = start_time + time*1000;
                                			date.setTime(time);
                                			time = date.toISOString();

                                    		r.push('<trkpt lon="'+e[1]+'" lat="'+e[0]+'">');
                                    		r.push('<ele>'+alt+'</ele>');
                                    		r.push('<time>'+time+'</time>');
                                    		r.push('</trkpt>');
                                		}
                                		r.push('</trkseg>');
                                		r.push('</trk>');
                                		r.push('</gpx>');

                                		var s = r.join('');
                                		r = null;


                                        var output = $('<output style="display:none"></output>').insertAfter(button);
                                        output = output[0];


                                        var cleanUp = function(a) {
                                            a.dataset.disabled = true;

                                            // Need a small delay for the revokeObjectURL to work properly.
                                            setTimeout(function() {
                                                window.URL.revokeObjectURL(a.href);
                                                $(a).remove();
                                            }, 1500);
                                        };

                                        var downloadFile = function(text, filename) {

                            				const MIME_TYPE = 'text/xml';

                                            var prevLink = output.querySelector('a');
                                            if (prevLink) {
                                              window.URL.revokeObjectURL(prevLink.href);
                                              output.innerHTML = '';
                                            }

                                            var bb = new Blob([text], {type: MIME_TYPE});

                                            var a = document.createElement('a');
                                            a.download = filename;
                                            a.href = window.URL.createObjectURL(bb);
                                            a.textContent = 'Download';

                                            a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
                                            a.draggable = true; // Don't really need, but good practice.
                                            a.classList.add('dragout');

                                            output.appendChild(a);

                                            setTimeout(function() {
                                            	a.click();

                                            }, 100);

                                            a.onclick = function(e) {
                                              if ('disabled' in this.dataset) {
                                                return false;
                                              }

                                              cleanUp(this);
                                            };
                                        };

                            	        downloadFile(s, "ride."+id+".gpx");
                                	}
                                }
                            );
                    	}
                    }
                );

    			return false;
    		});


    	}


        var httpLoad = function(url, handler_ok, handler_error) {
            var ajaxData = {
               	'url':          url,
               	'type' :        'GET',
               	"dataType" : "html",
               	'success':      function(html) {
                   	html = (''+html).replace(/[\r\n\t]+/igm, '');
               		return handler_ok(html);
               	},

               	'error':      function(xhr, type) {
    		    	handler_error();
               	}
            };

            this.$.ajax(ajaxData);
        };
    };


	var check = function() {
		//console.log('check');

	    var gd = $('#map-type-control');
	    if (gd.length) {
		    return setTimeout(ignition, 500);
	    }


	    setTimeout(check, 500);
	};

    setTimeout(check, 500);



});

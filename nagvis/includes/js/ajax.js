/*****************************************************************************
 *
 * ajax.js - Functions for handling NagVis Ajax requests
 *
 * Copyright (c) 2004-2008 NagVis Project (Contact: lars@vertical-visions.de)
 *
 * License:
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 *
 *****************************************************************************/
 
/**
 * @author	Lars Michelsen <lars@vertical-visions.de>
 */
 
var ajaxQueryCache = [];

/**
 * function to create an XMLHttpClient in a cross-browser manner
 *
 * @author	Lars Michelsen <lars@vertical-visions.de>
 */
function initXMLHttpClient() {
	var xmlhttp;
	
	try {
		// Mozilla / Safari / IE7
		xmlhttp = new XMLHttpRequest();
	} catch (e) {
		// IE
		var XMLHTTP_IDS = new Array('MSXML2.XMLHTTP.5.0',
									'MSXML2.XMLHTTP.4.0',
									'MSXML2.XMLHTTP.3.0',
									'MSXML2.XMLHTTP',
									'Microsoft.XMLHTTP' );
		var success = false;
		
		for (var i=0;i < XMLHTTP_IDS.length && !success; i++) {
			try {
				xmlhttp = new ActiveXObject(XMLHTTP_IDS[i]);
				success = true;
			} catch (e) {}
		}
	
		if (!success) {
			throw new Error('Unable to create XMLHttpRequest.');
		}
	}
	
	return xmlhttp;
}

/**
 * Function for creating an async GET request
 *
 * @author	Lars Michelsen <lars@vertical-visions.de>
 */
function getRequest(url,myCallback,oOpt) {
	// Benutze cache, wenn die letzte Anfrage weniger als 30 Sekunden (30000 milisekunden) her ist
	if(typeof(ajaxQueryCache[url]) != 'undefined' && Date.parse(new Date())-ajaxQueryCache[url].timestamp <= 30000) {
		getAnswer(undefined, myCallback, ajaxQueryCache[url], true);
	} else {
		var oRequest = initXMLHttpClient();
		
		if (oRequest != null) {
			// Save this options to oOpt (needed for query cache)
			oOpt.url = url;
			oOpt.timestamp = Date.parse(new Date());
			
			oRequest.open("GET", url+"&timestamp="+oOpt.timestamp, true);
			oRequest.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2005 00:00:00 GMT");
			oRequest.onreadystatechange = function() { getAnswer(oRequest,myCallback,oOpt,false); };
			oRequest.send(null);
		}
	}
}

/**
 * Function for handling the answers of the ajax requests (including error handling)
 *
 * @author	Lars Michelsen <lars@vertical-visions.de>
 */
function getAnswer(oRequest,myCallback,oOpt,bCached) {
	if(bCached || (!bCached && oRequest.readyState == 4)) {
		if(bCached || (!bCached && oRequest.status == 200)) {
			var responseText;
			if(!bCached) {
				responseText = oRequest.responseText;
			} else {
				responseText = oOpt.response;
			}
			
			if(responseText.replace(/\s+/g,'').length == 0) {
				// Cache that dialog
				updateQueryCache(oOpt.url, oOpt.timestamp, '');
				
				window[myCallback]('',oOpt);
			} else {
				// Cache that dialog
				updateQueryCache(oOpt.url, oOpt.timestamp, responseText);
				
				// Error handling for the AJAX methods
				if(responseText.match(/Notice:|Warning:|Error:|Parse error:/)) {
					alert("Error in ajax request handler:\n"+oresponseText);
				} else {
					window[myCallback](eval('( '+responseText+')'),oOpt);
				}
			}
		}
	}
}

function updateQueryCache(url,timestamp,response) {
	ajaxQueryCache[url] = { "timestamp": timestamp, "response": response };
}
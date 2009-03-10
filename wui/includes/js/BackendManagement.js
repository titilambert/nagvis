/*****************************************************************************
 *
 * BackendManagement.js - Functions which are used by the backend management
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
 
function updateBackendOptions(backendType, backendId, sFormId) {
	var form = document.getElementById(sFormId);
	var tbl = document.getElementById('table_'+sFormId);
	
	var toDelete = [];
	
	// Remove old backend options
	for(var i=0, len = tbl.tBodies[0].rows.length; i < len; i++) {
		if(tbl.tBodies[0].rows[i].attributes.length > 0) {
			if(tbl.tBodies[0].rows[i].id !== '') {
				if(tbl.tBodies[0].rows[i].id.search("row_") !== -1) {
					toDelete[toDelete.length] = i;
				}
			}
		}
	}
	
	toDelete.reverse();
	for(var i=0, len = toDelete.length; i < len; i++) {
		tbl.deleteRow(toDelete[i]);
	}
	
	var lastRow = tbl.rows.length-1;
	
	// Add spacer row
	var row = tbl.insertRow(lastRow);
	row.id = 'row_'+lastRow;
	var label = row.insertCell(0);
	label.innerHTML = "&nbsp;";
	var input = row.insertCell(1);
	input.innerHTML = "&nbsp;";
	
	lastRow++;
	
	// When no backendId and no backendType set terminate here
	if(backendId === '' && backendType === '') {
		return false;
	}
	
	// Get configured values
	var oValues;
	if(backendId !== '') {
		oValues = getSyncRequest('ajax_handler.php?action=getBackendOptions&backend_id='+backendId);
	}
	
	// Get backend type from configued values when not set via function call
	// This occurs when editing backends cause only backendid is given
	if(backendType === '') {
		backendType = oValues['backendtype'];
	}
	
	// Fallback to default backendtype when nothing set here
	if(backendType === '') {
		backendType = validMainConfig['backend']['backendtype']['default'];
	}
	
	// Merge global backend options with type specific options
	var oOptions;
	oOptions = validMainConfig['backend']['options'][backendType];
	for(var sKey in validMainConfig['backend']) {
		// Exclude: backendid, backendtype, options
		if(sKey !== 'backendid' && sKey !== 'backendtype' && sKey !== 'options') {
			oOptions[sKey] = validMainConfig['backend'][sKey];
		}
	}
	
	for(var sKey in oOptions) {
		var sValue = "";
		
		var row = tbl.insertRow(lastRow);
		row.id = 'row_'+lastRow;
		
		// Add label
		var label = row.insertCell(0);
		label.className = "tdlabel";
		if(oOptions[sKey].must === 1) {
			label.setAttribute('style', 'color:red;');
		}
		label.innerHTML = sKey;
		
		// Add option
		var input = row.insertCell(1);
		input.className = "tdfield";
		
		// When editing fill the fields with configured values
		if(backendId !== '') {
			if(oValues[sKey] !== null && oValues[sKey] !== '') {
				sValue = oValues[sKey];
			}
		}
		
		input.innerHTML = "<input name='"+sKey+"' id='"+sKey+"' value='"+sValue+"' />";
		
		lastRow++;
	}
}

function check_backend_add() {
	form = document.backend_add;
	
	if(form.backend_id.value == '') {
		alert(printLang(lang['mustValueNotSet'],'ATTRIBUTE~backend_id'));
		return false;
	}
	if(form.backendtype.value == '') {
		alert(printLang(lang['mustValueNotSet'],'ATTRIBUTE~backendtype'));
		return false;
	}
	
	for(i=0;i<form.elements.length;i++) {
		// backend_id und backendtype are handled before this loop
		if(form.elements[i].name != 'backend_id' && form.elements[i].name != 'backendtype') {
			// if this value is a "must" and emtpy, error
			if(validMainConfig[form.backendtype.value][form.elements[i].name]['must'] == '1' && form.elements[i].value == '') {
				alert(printLang(lang['mustValueNotSet'],'ATTRIBUTE~'+form.elements[i].name));
				return false;
			}
		}
	}
	
	return true;
}

function check_backend_edit() {
	form = document.backend_edit;
	
	if(form.backend_id.value == '') {
		alert(printLang(lang['mustValueNotSet'],'ATTRIBUTE~backend_id'));
		return false;
	}
	
	for(i=0;i<form.elements.length;i++) {
		// backend_id und backendtype are handled before this loop
		if(form.elements[i].name != 'backend_id' && form.elements[i].name != 'backendtype') {
			// if this value is a "must" and emtpy, error
			if(validMainConfig[definedBackends[form.backend_id.value]['backendtype']][form.elements[i].name]['must'] == '1' && form.elements[i].value == '') {
				alert(printLang(lang['mustValueNotSet'],'ATTRIBUTE~'+form.elements[i].name));
				return false;
			}
		}
	}
	
	return true;
}

function check_backend_del() {
	form = document.backend_del;
	
	if(form.backend_id.value == '') {
		alert('backend_id not set. You have to set a backend_id.');
		
		return false;	
	}
	
	//FIXME: Check if backend is used in any maps/objects
	
	return true;
}
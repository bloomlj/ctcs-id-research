﻿// COPYRIGHT 2009, 2010, 2011, 2012, 2013, 2014 by the Open Rails project.
//
// This file is part of Open Rails.
//
// Open Rails is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Open Rails is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Open Rails.  If not, see <http://www.gnu.org/licenses/>.
//
// Based on original work by Dan Reynolds 2017-12-21

// Using XMLHttpRequest rather than fetch() as:
// 1. it is more widely supported (e.g. Internet Explorer and letious tablets)
// 2. It doesn't hide some returning error codes
// 3. We don't need the ability to chain promises that fetch() offers.

const httpCodeSuccess = 200;
const xmlHttpRequestCodeDone = 4;

// Used to extract png symbols
const signalAspectsImages="SignalAspects.png";
let signalPng = new Array();
const trackMonitorImages="TrackMonitorImages.png";
let trackPng = new Array();

async function ApiGet(path) {
	return new Promise((resolve, reject) => {
		let hr = new XMLHttpRequest();
		hr.open("GET", `http://localhost:2105/API/${path}`, true);
		hr.onreadystatechange = () => {
			if (hr.readyState === xmlHttpRequestCodeDone) {
				if (hr.status === httpCodeSuccess) {
					let obj = JSON.parse(hr.responseText);
					if (obj != null)
						resolve(obj);
					else
						reject(`Failed to parse JSON response: ${hr.responseText}`);
				} else {
					reject(`Bad HTTP response: ${this.status}.`);
				}
			}
		}
		hr.send();
	});
}

async function ApiTrackMonitor() {
	// GET to fetch data, POST to send it
	// "/API/APISAMPLE" /API is a prefix hard-coded into the WebServer class
	let [tnInfo, tmDisplay] = await Promise.all([ApiGet("TRAININFO"), ApiGet("TRACKMONITORDISPLAY")]);

	let Str = "<table>";
	let endIndexFirst = 0,
		endIndexTrackLeft = 0,
		endIndexTrack = 0,
		endIndexTrackRight = 0,
		endIndexLimit = 0,
		endIndexSignal = 0,
		endIndexDist = 0;

	let newDataFirst = "",
		newDataTrack = "",
		newDataLimit = "",
		newDataSignal = "",
		newDataDist = "",
		stringColorFirst = "",
		stringColorTrackLeft = "",
		stringColorTrack = "",
		stringColorTrackRight = "",
		stringColorLimit = "",
		stringColorSignal = "",
		stringColorDist = "";

	// Color codes
	const codeColor = ['???', '??!', '?!?', '?!!', '!??', '!!?', '!!!', '%%%', '%$$', '%%$', '$%$', '$$$'];

	//controlMode
	const controlMode = tnInfo.ControlMode;

	// Table title
	Str += "<tr> <td colspan='9' style='text-align: center'>" + 'Track Monitor' + "</td></tr>";
	Str += "<tr> <td colspan='9' class='separator'></td></tr>";

	// Customize data
	for (const [row, data] of tmDisplay.entries()) {
		Str += "<tr>";
		firstColor = false;
		trackColorLeft = false;
		trackColor = false;
		trackColorRight = false;
		limitColor = false;
		signalColor = false;
		distColor = false;

		// FirstCol
		if (data.FirstCol.length > 0) {
			endIndexFirst = data.FirstCol.length;
			newDataFirst = data.FirstCol.slice(0, endIndexFirst - 3);
			stringColorFirst = data.FirstCol.slice(-3);
		}
		// TrackColLeft
		if (data.TrackColLeft.length > 0) {
			endIndexTrackLeft = data.TrackColLeft.length;
			newDataTrackLeft = data.TrackColLeft.slice(0, endIndexTrackLeft - 3);
			stringColorTrackLeft = data.TrackColLeft.slice(-3);
		}
		// TrackCol
		if (data.TrackCol.length > 0) {
			endIndexTrack = data.TrackCol.length;
			newDataTrack = data.TrackCol.slice(0, endIndexTrack - 3);
			stringColorTrack = data.TrackCol.slice(-3);
		}
		// TrackColRight
		if (data.TrackColRight.length > 0) {
			endIndexTrackRight = data.TrackColRight.length;
			newDataTrackRight = data.TrackColRight.slice(0, endIndexTrackRight - 3);
			stringColorTrackRight = data.TrackColRight.slice(-3);
		}
		// LimitCol
		if (data.LimitCol.length > 0) {
			endIndexLimit = data.LimitCol.length;
			newDataLimit = data.LimitCol.slice(0, endIndexLimit - 3);
			stringColorLimit = data.LimitCol.slice(-3);
		}
		// SignalCol
		if (data.SignalCol.length > 0) {
			endIndexSignal = data.SignalCol.length;
			newDataSignal = data.SignalCol.slice(0, endIndexSignal - 3);
			stringColorSignal = data.SignalCol.slice(-3);
		}
		// DistCol
		if (data.DistCol.length > 0) {
			endIndexDist = data.DistCol.length;
			newDataDist = data.DistCol.slice(0, endIndexDist - 3);
			stringColorDist = data.DistCol.slice(-3);
		}

		// detects color
		if (codeColor.indexOf(stringColorFirst) != -1) { firstColor = true; }
		if (codeColor.indexOf(stringColorTrackLeft) != -1) { trackColorLeft = true; }
		if (codeColor.indexOf(stringColorTrack) != -1) { trackColor = true; }
		if (codeColor.indexOf(stringColorTrackRight) != -1) { trackColorRight = true; }
		if (codeColor.indexOf(stringColorLimit) != -1) { limitColor = true; }
		if (codeColor.indexOf(stringColorSignal) != -1) { signalColor = true; }
		if (codeColor.indexOf(stringColorDist) != -1) { distColor = true; }

		if (data.FirstCol == null) {
			Str += "<td colspan='2'></td>";
		}
		else if (data.FirstCol == "Sprtr") {
			Str += "<td colspan='9' class='separator'></td>";
		}
		else if (data.FirstCol == "SprtrRed") {
			Str += "<td colspan='9' class='separatorred'></td>";
		}
		else if (data.FirstCol == "SprtrDarkGray") {
			Str += "<td colspan='9' class='separatordarkgray'></td>";
		}
		else if (row == 9) {
			Str += `<td colspan='9' align='center' >${data.FirstCol}</td>`;
		}
		else {
			if (row < 8) {
				// first col = FirstCol data
				Str += DisplayItem('left', 3, firstColor, stringColorFirst, firstColor ? newDataFirst : data.FirstCol, false);
				Str += "<td></td>";
				Str += "<td></td>";

				// third col = TrackCol data
				Str += DisplayItem('right', 3, trackColor, stringColorTrack, trackColor ? newDataTrack : data.TrackCol, false);
			}
			else {
				// first col = FirstCol data
				Str += DisplayItem(row > 25 && controlMode.indexOf("AUTO") != -1? 'center' : 'left', 1, firstColor, stringColorFirst, firstColor ? newDataFirst : data.FirstCol, row > 25 && controlMode.indexOf("AUTO") != -1? true : false);

				// second col = TrackColLeft data
				Str += DisplayItem('right', 1, trackColorLeft, stringColorTrackLeft, trackColorLeft ? newDataTrackLeft : data.TrackColLeft, false);

				// third col = TrackCol data
				if (row > 12 && data.TrackCol.indexOf("││") == -1) {
					let size = 24;
					Str += `<td><img src='${await DrawPng(trackMonitorImages, data.TrackColItem)}' width ='${size}' height ='${size}' ColorCode='${`` + (data.TrackCol.indexOf("↶")!= -1 || data.TrackCol.indexOf("✋")!= -1? stringColorTrack :'') + ``}' style='background-color: black' /></td>`;
					Str += "<td></td>";
				}
				else {
					Str += DisplayItem('center', 2, trackColor, stringColorTrack, trackColor ? newDataTrack : data.TrackCol, false);
				}
				// fourth col = TrackColRight data
				Str += DisplayItem('left', 1, trackColorRight, stringColorTrackRight, trackColorRight ? newDataTrackRight : data.TrackColRight, false);

				// station zone
				if (row > 25 && controlMode.indexOf("AUTO") != -1) {
					// fifth col = LimitCol data
					Str += DisplayItem('left', 3, limitColor, stringColorLimit, limitColor ? newDataLimit : data.LimitCol, true);
				}
				else {
					// fifth col = LimitCol data
					Str += DisplayItem('left', 1, limitColor, stringColorLimit, limitColor ? newDataLimit : data.LimitCol, false);

					// sixth col = SignalCol data
					if (row > 12 && data.SignalCol.length > 1) {
						let size = 16;
						Str += `<td><img src='${await DrawPng(signalAspectsImages, data.SignalColItem)}' width ='${size}' height ='${size}'/></td>`;
					}
					else {
						Str += DisplayItem('center', 1, signalColor, stringColorSignal, signalColor ? newDataSignal : data.SignalCol, false);
					}
					// seventh col = DistCol data
					Str += DisplayItem('right', 1, distColor, stringColorDist, distColor ? newDataDist : data.DistCol, false);
				}
			}
		}
		Str += "</tr>";
	}
	Str += "</table>";
	TrackMonitor.innerHTML = Str;
}

let pngCanvas = null;
async function DrawPng(imagePath, rect) {
	if (pngCanvas === null)
		pngCanvas = document.createElement("canvas");
	let cv = pngCanvas;
	cv.width = rect.Width;
	cv.height = rect.Height;
	let ctx = cv.getContext("2d");
	ctx.drawImage(await DownloadImage(imagePath), rect.X, rect.Y, rect.Width, rect.Height, 0, 0, rect.Width, rect.Height);
	return cv.toDataURL("image/png");
};

let images = {};
async function DownloadImage(path) {
	if (path in images) {
		return images[path];
	} else {
		return new Promise((resolve, reject) => {
			let image = new Image();
			image.onload = () => {
				images[path] = image;
				resolve(image);
			};
			image.onerror = reject;
			image.src = path;
		});
    }
}

function DisplayItem(alignment, colspanvalue, isColor, colorCode, item, small){
	return `<td align='${alignment}' colspan='${colspanvalue}' ColorCode=${isColor? colorCode : ''}>${small? item.small() : item}</td>`;
}

function changePageColor() {
	let buttonClicked = document.getElementById("buttonDN");
	let bodyColor = document.getElementById("body");

	if (buttonClicked.innerHTML == "Night"){
		buttonClicked.innerHTML = "Day";
		bodyColor.style.background = "black";
		bodyColor.style.color =	"white";
	}
	else if (buttonClicked.innerHTML == "Day"){
		buttonClicked.innerHTML = "Night";
		bodyColor.style.background = "white";
		bodyColor.style.color =	"black";
	}
};
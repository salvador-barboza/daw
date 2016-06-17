"use strict";

(function() {

var uifileDragging,
	jqWaveformTmp;

ui.jqBody
	.mousemove( function( e ) {
		if ( uifileDragging ) {
			jqWaveformTmp.css( { left: e.pageX, top: e.pageY } );
		}
	} )
	.mouseup( function( e ) {
		if ( uifileDragging ) {
			var track = ui.getTrackFromPageY( e.pageY ),
				xem = ui.getGridXem( e.pageX );
			jqWaveformTmp.remove();
			if ( track && xem >= 0 ) {
				gs.sampleCreate( uifileDragging, track.id, xem );
			}
			uifileDragging = null;
		}
	} )
;

ui.File.prototype.dragstart = function( e ) {
	if ( this.isLoaded && !uifileDragging ) {
		uifileDragging = this;
		jqWaveformTmp = this.jqCanvasWaveform.clone();
		var canvas = jqWaveformTmp[ 0 ];
		canvas.getContext( "2d" ).drawImage(
			this.jqCanvasWaveform[ 0 ],
			0, 0, canvas.width, canvas.height
		);
		jqWaveformTmp
			.addClass( "dragging" )
			.css( { left: e.pageX, top: e.pageY } )
			.appendTo( ui.jqBody )
		;
	}
	return false;
};

})();

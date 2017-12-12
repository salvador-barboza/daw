"use strict";

ui.patterns = {
	init() {
		ui.patterns.audioBlocks = {};
		dom.patterns.oncontextmenu = ui.patterns._oncontextmenu;
	},
	empty() {
		Object.keys( ui.patterns.audioBlocks ).forEach( ui.patterns.delete );
	},
	create( id, obj ) {
		var pat = new gsuiAudioBlock(),
			patRoot = pat.rootElement,
			cloneBtn = document.createElement( "a" ),
			removeBtn = document.createElement( "a" );

		pat.data = obj;
		pat.name( obj.name );
		pat.datatype( "keys" );
		patRoot.dataset.id = id;
		patRoot.setAttribute( "draggable", "true" );
		patRoot.onclick = ui.patterns._onclickPattern.bind( null, id );
		patRoot.ondblclick = ui.patterns._ondblclickPattern.bind( null, id );
		patRoot.ondragstart = ui.patterns._ondragstartPattern.bind( null, id );
		cloneBtn.onclick = ui.patterns._onclickClone.bind( null, id );
		removeBtn.onclick = ui.patterns._onclickRemove.bind( null, id );
		cloneBtn.className = "icon ico-clone";
		removeBtn.className = "icon ico-remove";
		cloneBtn.title = "Clone this pattern";
		removeBtn.title = "Delete this pattern";
		patRoot.querySelector( ".gsuiab-head" ).append( cloneBtn, removeBtn );

		ui.patterns.audioBlocks[ id ] = pat;
		ui.synths.addPattern( obj.synth, patRoot );
		gs.openPattern( id );
	},
	update( id, obj ) {
		if ( "name" in obj ) {
			var val = obj.name;

			ui.patterns.audioBlocks[ id ].name( val );
			ui.mainGrid.getPatternBlocks( id ).forEach( function( uiBlock ) {
				uiBlock.name( val );
			} );
			if ( id === gs.currCmp.patternOpened ) {
				ui.pattern.name( val );
			}
		}
	},
	delete( id ) {
		var sibling,
			patRoot = ui.patterns.audioBlocks[ id ].rootElement;

		if ( id === gs.currCmp.patternOpened ) {
			delete gs.currCmp.patternOpened;

			// .2
			sibling = patRoot.nextSibling || patRoot.previousSibling;
			if ( sibling ) {
				gs.openPattern( sibling.dataset.id );
			}
		}
		delete ui.patterns.audioBlocks[ id ];
		patRoot.remove();
	},
	select( id ) {
		var patSel = ui.patterns._selectedPattern,
			pat = ui.patterns.audioBlocks[ id ];

		if ( patSel ) {
			patSel.rootElement.classList.remove( "selected", "gsuiAudioBlock-reversedColors" );
			delete ui.patterns._selectedPattern;
		}
		if ( pat ) {
			ui.patterns._selectedPattern = pat;
			pat.rootElement.classList.add( "selected", "gsuiAudioBlock-reversedColors" );
		}
	},
	updateContent( id, data ) {
		ui.patterns.audioBlocks[ id ].updateData( data );
		ui.mainGrid.getPatternBlocks( id ).forEach( function( uiBlock ) {
			var blc = gs.currCmp.blocks[ uiBlock.id ];

			if ( !blc.durationEdited ) {
				uiBlock.duration( blc.duration );
				uiBlock.contentWidthFixed();
			}
			uiBlock.updateData( data, blc.offset, blc.duration );
		} );
	},

	// events:
	_oncontextmenu( e ) {
		if ( !e || e.target !== dom.patterns ) {
			if ( ui.patterns._uiBlockPlaying ) {
				wa.patterns.stop();
				ui.patterns._uiBlockPlaying.stop();
				delete ui.patterns._uiBlockPlaying;
			}
		}
		return false;
	},
	_onclickClone( id, e ) {
		e.stopPropagation();
		gs.pushCompositionChange( jsonActions.clonePattern( id ) );
		return false;
	},
	_onclickRemove( id, e ) {
		var patRoot = ui.patterns.audioBlocks[ id ].rootElement;

		e.stopPropagation();
		// .1
		if ( patRoot.nextSibling || patRoot.previousSibling ) {
			gs.pushCompositionChange( jsonActions.removePattern( id ) );
		} else {
			gsuiPopup.alert( "Error", "You can not delete the last pattern" );
		}
		return false;
	},
	_onclickPattern( id, e ) {
		var uiBlock = ui.patterns.audioBlocks[ id ];

		ui.patterns._oncontextmenu();
		ui.patterns._uiBlockPlaying = uiBlock;
		uiBlock.start( gs.currCmp.bpm );
		wa.patterns.play( id );
	},
	_ondblclickPattern( id ) {
		if ( id !== gs.currCmp.patternOpened ) {
			ui.patterns._oncontextmenu();
			gs.openPattern( id );
		}
	},
	_ondragstartPattern( id, e ) {
		e.dataTransfer.setData( "text", id );
	}
};

/*
.1 : Why the UI choose to block the deletion of the last pattern?
	The logic code can handle the deletion of all the pattern, but the UI not.
	Currently the UI need a pattern opened everytime.
	Because of this, the `if` is not in the logic code.

.2 : Why is there *another* sibling check in the ui.remove() function?
	The UI doesn't allow the deletion of the last pattern, but there is still
	another check in the simple `ui.remove()` function. This is because when
	a composition is unload (to load another one) ALL the patterns are removed.
*/

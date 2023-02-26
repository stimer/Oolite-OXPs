(function(){

'use strict';

this.name        = 'eqDuplexFuelTank';
this.author      = 'Andrey Belov';
this.description = 'http://wiki.alioth.net/index.php/DuplexFuelTank_OXP';


/* Use button "n" for pump fuel to main tank */
this.activated = function() {
    this._dft_pump(true);
};

/* Use button "b" for pump fuel from main tank */
this.mode = function() {
    this._dft_pump(false);
};

this._dft_pump = function(mode) {
    if ( player.ship.equipmentStatus('EQ_DUPLEX_FUEL_TANK') !== 'EQUIPMENT_OK' ) {
	    return;
	}

	let dft = worldScripts['DuplexFuelTank'];

    if (mode) {
        dft.$dft_pump_to_main();
    }
    else {
        dft.$dft_pump_from_main();
    }
};

}).call(this);

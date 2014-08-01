this.name        = 'eqDuplexFuelTank';
this.author      = 'Andrey Belov';
this.description = 'http://wiki.alioth.net/index.php/DuplexFuelTank_OXP';


/* Use button "n" for pump fuel to main tank */
this.activated = function() {
	this._pump(true);
};

/* Use button "b" for pump fuel from main tank */
this.mode = function() {
	this._pump(false);
};

this._pump = function(mode) {
	if ( player.ship.equipmentStatus('EQ_DUPLEX_FUEL_TANK') !== 'EQUIPMENT_OK' ) {
		return;
	}

	var duplex_fuel_tank = worldScripts['duplex_fuel_tank'];

	if (mode) {
		duplex_fuel_tank.pump_to_main();
	}
	else {
		duplex_fuel_tank.pump_from_main();
	}
};

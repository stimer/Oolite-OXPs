this.name        = 'duplex_fuel_tank';
this.author      = 'Andrey Belov';
this.copyright   = '© 2013 Andrey Belov aka timer [ TiNe Corp. ]';
this.licence     = 'CC BY-NC-SA 3.0'; // see http://creativecommons.org/licenses/by-nc-sa/3.0/ for more info.
this.description = 'Additional fuel tank with duplex interaction with main tank.';
this.version     = '0.5';


this._max_fuel      = 3;
this._max_ship_fuel = 7.0;


this.playerBoughtEquipment = function(equipmentKey) {
	if ( equipmentKey === 'EQ_DUPLEX_FUEL_TANK_REFILL' ) {
		this.refill();
	}
	else if ( equipmentKey === 'EQ_DUPLEX_FUEL_TANK') {
		this.buyDFT();
	}
	else if ( equipmentKey === 'EQ_DUPLEX_FUEL_TANK_REMOVAL') {
		this.sellDFT();
	}
};

this.buyDFT = function() {
	player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_CTRL');
	player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + this._max_fuel);
};

this.sellDFT = function() {
	player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_REMOVAL');
	player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_CTRL');
	var cs = this.get_current_state();
	player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);
	player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK');
	player.credits += (EquipmentInfo.infoForKey('EQ_DUPLEX_FUEL_TANK').price * 0.07 );
};

this.refill = function() {
	var cs = this.get_current_state();

	player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_REFILL');
	if ( cs < this._max_fuel ) {
		player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);
		player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + (cs+1));
	}
};

this.pump_to_main = function() {
	var cs = this.get_current_state();

	if (cs < 1) {
		player.consoleMessage('DFT: additional tank is empty.', 3);
		return;
	}

	if ( player.ship.fuel >= this._max_ship_fuel ) {
		player.consoleMessage('DFT: main tank full.', 3);
		return;
	}

	var ff = 1.0 - ( this._max_ship_fuel - player.ship.fuel );
	if ( ff > 0 ) {
		player.consoleMessage('DFT: main tank full, ' + ff.toFixed(1) + ' fuel lost.', 3);
	}

	player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);
	cs--;
	player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);

	player.ship.fuel += 1.0;

	if ( player.ship.fuel > this._max_ship_fuel ) {
		// should never happens
		player.ship.fuel = this._max_ship_fuel;
	}

	this.info(cs);
};

this.pump_from_main = function() {
	var cs = this.get_current_state();

	if ( cs >= this._max_fuel ) {
		player.consoleMessage('DFT: additional tank is full.', 3);
		return;
	}

	if ( player.ship.fuel < 1.0 ) {
		player.consoleMessage('DFT: main tank too low.', 3);
		return;
	}

	player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);
	cs++;
	player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);

	player.ship.fuel -= 1.0;

	this.info(cs);
};

this.info = function(cs) {
	player.consoleMessage('DFT state: ' + cs + '/' + this._max_fuel, 3);
};

this.get_current_state = function() {
	for ( var k = 0; k <= this._max_fuel; k++ ) {
		if ( player.ship.equipmentStatus('EQ_DUPLEX_FUEL_TANK_STATE_'+k) === 'EQUIPMENT_OK' ) {
			return k;
		}
	}

	return 0;
};

// special for Smivs ;)
this.$dftSabotage = function() {
	if ( player.ship.equipmentStatus('EQ_DUPLEX_FUEL_TANK') === 'EQUIPMENT_OK' ) {
		var cs = this.get_current_state();
		if ( cs > 0 ) {
			player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);
			player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_STATE_0');
			player.consoleMessage('DFT malfunction: fuel leak!', 3);
		}
	}
};

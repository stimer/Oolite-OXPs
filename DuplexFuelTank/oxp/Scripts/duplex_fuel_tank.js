(function(){

'use strict';

this.name        = 'DuplexFuelTank';
this.author      = 'Andrey Belov';
this.copyright   = '© 2015 Andrey Belov aka timer [ TiNe Corp. ]';
this.licence     = 'CC BY-NC-SA 3.0'; // see http://creativecommons.org/licenses/by-nc-sa/3.0/ for more info.
this.description = 'Additional fuel tank with duplex interaction with main tank.';
this.version     = '0.52';


const _DFT_MAX_FUEL      = 3;
const _DFT_MAX_SHIP_FUEL = 7.0;


this.playerBoughtEquipment = function(equipmentKey) {
    if ( equipmentKey === 'EQ_DUPLEX_FUEL_TANK_REFILL' ) {
        this._dft_refill();
    }
    else if ( equipmentKey === 'EQ_DUPLEX_FUEL_TANK' ) {
        this._dft_buy();
    }
    else if ( equipmentKey === 'EQ_DUPLEX_FUEL_TANK_REMOVAL' ) {
        this._dft_sell();
    }
};

this._dft_buy = function() {
    player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_CTRL');
    player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + _DFT_MAX_FUEL);
};

this._dft_sell = function() {
    player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_REMOVAL');
    player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_CTRL');
    let cs = this._dft_get_current_state();
    player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);
    player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK');
    player.credits += (EquipmentInfo.infoForKey('EQ_DUPLEX_FUEL_TANK').price * 0.07);
};

this._dft_refill = function() {
    let cs = this._dft_get_current_state();

    player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_REFILL');
    if ( cs < _DFT_MAX_FUEL ) {
        player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);
        player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + (cs+1));
    }
};

// Call from EQ script
this.$dft_pump_to_main = function() {
    let cs = this._dft_get_current_state();

    if ( cs < 1 ) {
        this._dft_print('DFT: additional tank is empty.');
        return;
    }

    if ( player.ship.fuel >= _DFT_MAX_SHIP_FUEL ) {
        this._dft_print('DFT: main tank full.');
        return;
    }

    let ff = 1.0 - ( _DFT_MAX_SHIP_FUEL - player.ship.fuel );
    if ( ff > 0 ) {
        this._dft_print('DFT: main tank full, ' + ff.toFixed(1) + ' fuel lost.');
    }

    player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);
    cs--;
    player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);

    player.ship.fuel += 1.0;

    if ( player.ship.fuel > _DFT_MAX_SHIP_FUEL ) {
        // should never happens
        player.ship.fuel = _DFT_MAX_SHIP_FUEL;
    }

    this._dft_print_state(cs);
};

// Call from EQ script
this.$dft_pump_from_main = function() {
    let cs = this._dft_get_current_state();

    if ( cs >= _DFT_MAX_FUEL ) {
        this._dft_print('DFT: additional tank is full.');
        return;
    }

    if ( player.ship.fuel < 1.0 ) {
        this._dft_print('DFT: main tank too low.');
        return;
    }

    player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);
    cs++;
    player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);

    player.ship.fuel -= 1.0;

    this._dft_print_state(cs);
};

this._dft_print_state = function(cs) {
    this._dft_print('DFT state: ' + cs + '/' + _DFT_MAX_FUEL);
};

this._dft_print = function(msg) {
    // TODO MFD?
    player.consoleMessage(msg, 3);
};

this._dft_get_current_state = function() {
    for ( let k = 0; k <= _DFT_MAX_FUEL; k++ ) {
        if ( player.ship.equipmentStatus('EQ_DUPLEX_FUEL_TANK_STATE_'+k) === 'EQUIPMENT_OK' ) {
            return k;
        }
    }

    return 0;
};

// Special for Smivs ;)
this.$dftSabotage = function() {
    if ( player.ship.equipmentStatus('EQ_DUPLEX_FUEL_TANK') === 'EQUIPMENT_OK' ) {
        let cs = this._dft_get_current_state();
        if ( cs > 0 ) {
            player.ship.removeEquipment('EQ_DUPLEX_FUEL_TANK_STATE_' + cs);
            player.ship.awardEquipment('EQ_DUPLEX_FUEL_TANK_STATE_0');
            player.consoleMessage('DFT malfunction: fuel leak!', 3);
        }
    }
};

// Condition scripting method (Thanks Smivs again)
this.allowAwardEquipment = function( equipment, ship, context ) {
    // Can't buy service equipment - only scripting operations
    return !!(context == 'scripted');
};

}).call(this);

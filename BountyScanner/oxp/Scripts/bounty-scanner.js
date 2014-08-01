'use strict';

this.name = 'Bounty Scanner';


this._markRE = /( ?Bounty )([\d\.]+)( ₢)/;


this.shipWillDockWithStation = function(station) {
    this._stopTimer();
};


this.shipTargetLost = function(target) {
    this._stopTimer();
};


this.shipDied = function() {
    this._stopTimer();
};


this._stopTimer = function() {
    if ( this._checkTimer && this._checkTimer.isRunning ) {
        this._checkTimer.stop();
    }
};


this._isEqOk = function() {
    return player.ship.equipmentStatus('EQ_FRAME_BOUNTY_SCANNER') === 'EQUIPMENT_OK';
};


this.shipTargetAcquired = function(target) {
    this._scanAndUpdate(target);
    this._startTimer(5);
};


this._startTimer = function(delay) {
    if ( ! this._isEqOk ) return;

    if ( this._checkTimer ) {
        if ( ! this._checkTimer.isRunning ) this._checkTimer.start();
    }
    else {
        this._checkTimer = new Timer( this, this._scanAndUpdate, delay||0, 5 );
    }
};


this._scanAndUpdate = function(target) {
    target = target || player.ship.target;

    if ( ! target || ! this._isEqOk() || player.ship.status === 'STATUS_DOCKED' ) {
        this._stopTimer();
        return;
    }

    if ( ! target.isShip || target.isCargo ) return;

    var
    bounty  = this._getBounty(target),
    srcName = target.shipUniqueName,
    found   = srcName.match( this._markRE ),
    hasMark = found && found.length === 4 ? 1 : 0,
    mBounty = hasMark ? +found[2] : 0;

    if ( bounty !== 0 ) {
        if (hasMark) {
            if ( mBounty !== bounty ) {
                target.shipUniqueName = srcName.replace( this._markRE, '$1'+bounty+'$3' );
            }
        }
        else {
            target.shipUniqueName += (srcName?' ':'')+'Bounty '+bounty+' ₢';
        }
    }
    else if (hasMark) {
        target.shipUniqueName = srcName.replace( this._markRE, '' );
    }
};


this._getBounty = function(ship) {
    var
    bounty = ship.bounty,
    sc = ship.scanClass;

    return sc == 'CLASS_BUOY' || sc == 'CLASS_ROCK'
        ? bounty / 10
        : bounty;
};


this.playerBoughtEquipment = function(equipment) {
    if ( equipment === 'EQ_FRAME_BOUNTY_SCANNER_REMOVER' ) {
        this._stopTimer();
        player.ship.removeEquipment('EQ_FRAME_BOUNTY_SCANNER_REMOVER');
        player.ship.removeEquipment('EQ_FRAME_BOUNTY_SCANNER');
        player.credits += ( EquipmentInfo.infoForKey('EQ_FRAME_BOUNTY_SCANNER').price * 0.06 );
    }
};

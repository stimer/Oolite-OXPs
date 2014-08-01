'use strict';

this.name = 'Bounty Scanner';


this._markRE = /( ?Bounty )([\d\.]+)( ₢)/;


this.shipWillDockWithStation = this.shipTargetLost = this.shipDied = function(station) {
    this._stopPeriodicalCheck();
};


this._stopPeriodicalCheck = function() {
    if ( this._timer && this._timer.isRunning ) {
        this._timer.stop();
    }
};


this._startPeriodicalCheck = function(delay) {
    if ( this._timer ) {
        if ( ! this._timer.isRunning ) this._timer.start();
    }
    else {
        this._timer = new Timer( this, this._scanAndUpdate, delay||0, 5 );
    }
};


this.shipTargetAcquired = function(target) {
    if ( this._scanAndUpdate(target) ) {
        this._startPeriodicalCheck(5);
    }
};


this._scanAndUpdate = function(target) {
    target = target || player.ship.target;

    if ( ! target
         || player.ship.equipmentStatus('EQ_FRAME_BOUNTY_SCANNER') !== 'EQUIPMENT_OK'
         || player.ship.status === 'STATUS_DOCKED'
         || ! target.isShip
         || target.isCargo ) {

        this._stopPeriodicalCheck();
        return false;
    }

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

    if ( target.scanClass === 'CLASS_ROCK' ) return false;

    return true;
};


this._getBounty = function(ship) {
    var
    bounty = ship.bounty,
    sc = ship.scanClass;

    return sc === 'CLASS_BUOY' || sc === 'CLASS_ROCK'
        ? bounty / 10
        : bounty;
};


this.playerBoughtEquipment = function(equipment) {
    if ( equipment === 'EQ_FRAME_BOUNTY_SCANNER_REMOVER' ) {
        this._stopPeriodicalCheck();
        player.ship.removeEquipment('EQ_FRAME_BOUNTY_SCANNER_REMOVER');
        player.ship.removeEquipment('EQ_FRAME_BOUNTY_SCANNER');
        player.credits += ( EquipmentInfo.infoForKey('EQ_FRAME_BOUNTY_SCANNER').price * 0.06 );
    }
};

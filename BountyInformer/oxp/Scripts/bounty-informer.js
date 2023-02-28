(function(){
'use strict';

this.name        = 'Bounty Informer';
this.author      = 'Andrey Belov';
this.copyright   = '© 2023 Andrey Belov aka timer [ TiNe Corp. ]';
this.licence     = 'CC BY-NC-SA 3.0'; // see http://creativecommons.org/licenses/by-nc-sa/3.0/ for more info.
this.description = 'This device gives you access to the bounty registry of police criminal database.';
this.version     = '2.0';


let _binf_disabled = false;
let _binf_timer    = false;
let _binf_bountyRE = /((?:Bounty )? )([\d\.]+)( ₢)/;


this.$disableBountyInformer = function() {
    _binf_disabled = true;
    this._binf_stopPeriodicalCheck( player.ship.target );
};

this.$enableBountyInformer = function() {
    _binf_disabled = false;
};

this.shipWillDockWithStation = function(station) {
    this._binf_stopPeriodicalCheck(false);
};

this.shipTargetLost = this.shipTargetCloaked = function(target) {
    this._binf_stopPeriodicalCheck(target);
};

this._binf_stopPeriodicalCheck = function(target) {
    if ( _binf_timer && _binf_timer.isRunning ) {
        _binf_timer.stop();
    }
    if (target) {
        this._binf_removeBountyInfo(target);
    }
};

this._binf_startPeriodicalCheck = function(delay) {
    if ( _binf_timer ) {
        if ( ! _binf_timer.isRunning ) _binf_timer.start();
    }
    else {
        _binf_timer = new Timer( this, this._binf_scanAndUpdate, delay||0, 5 );
    }
};

this.shipTargetAcquired = function(target) {
    if ( _binf_disabled ) return;
    if ( this._binf_scanAndUpdate(target) ) this._binf_startPeriodicalCheck(5);
};

this._binf_scanAndUpdate = function(target) {
    let pship = player.ship;
    target = target || pship.target;

    if ( ! target || _binf_disabled
         || pship.equipmentStatus('EQ_BOUNTY_INFORMER') !== 'EQUIPMENT_OK'
         || pship.status === 'STATUS_DOCKED'
         || ! target.isShip
         || target.isCloaked
         || target.isJamming
         || target.isCargo ) {

        this._binf_stopPeriodicalCheck(target);
        return false;
    }

    let bounty = this.$getBounty(target);

    if ( bounty > 0 ) {
        let desc  = target.scanDescription || this.$initialScanDescription( target, bounty );
        let found = desc.match(_binf_bountyRE);
        if ( found && found.length === 4 ) {
            if ( (+found[2]) !== bounty ) {
                target.scanDescription = desc.replace( _binf_bountyRE, '$1'+bounty+'$3' );
            }
        }
        else {
            target.scanDescription = desc+' '+bounty+' ₢';
        }
    }
    else {
        this._binf_removeBountyInfo(target);
    }

    if ( target.scanClass === 'CLASS_ROCK' ) return false;

    return true;
};

this._binf_removeBountyInfo = function(target) {
    if ( ! target || target.scanDescription === null ) return;
    let initDesc = target.scanDescription;
    target.scanDescription = initDesc.replace( _binf_bountyRE, '' ) || null;
}

this.$getBounty = function(ship) {
    let bounty = ship.bounty;
    let sc = ship.scanClass;

    return sc === 'CLASS_BUOY' || sc === 'CLASS_ROCK'
        ? bounty / 10
        : bounty;
};

this.playerBoughtEquipment = function(equipment) {
    if ( equipment !== 'EQ_BOUNTY_INFORMER_REMOVER' ) return;

    this._binf_stopPeriodicalCheck(false);
    player.ship.removeEquipment('EQ_BOUNTY_INFORMER_REMOVER');
    player.ship.removeEquipment('EQ_BOUNTY_INFORMER');
    player.credits += ( EquipmentInfo.infoForKey('EQ_BOUNTY_INFORMER').price * 0.06 );
};

this.$initialScanDescription = function( ship, bounty ) {
    let sc = ship.scanClass;
    if ( sc === 'CLASS_NEUTRAL' ) {
        return bounty > 0
            ? ( bounty > 50 ? 'Fugitive' : 'Offender' )
            : 'Clean';
    }
    let tmp = sc === 'CLASS_THARGOID' ? 'legal-desc-alien'
            : sc === 'CLASS_POLICE'   ? 'legal-desc-system-vessel'
            : sc === 'CLASS_MILITARY' ? 'legal-desc-military-vessel'
            : false;
    return tmp ? expandDescription('['+tmp+']')
               : bounty > 0 ? 'Bounty'
               : '';
}

}).call(this);

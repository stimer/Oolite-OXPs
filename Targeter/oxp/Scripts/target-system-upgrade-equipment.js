'use strict';

this.author  = 'Andrey Belov';
this.licence = 'CC-BY-NC-SA 3.0';


this._mode = 0;

// Handle event "mode" for prime equipment
this.mode = function() {
    if ( player.ship.equipmentStatus('EQ_ENEMY_TARGETER_UPGRADE') !== 'EQUIPMENT_OK' ) {
        return;
    }
    if ( ++this._mode > 2 ) {
        this._mode = 0;
    }
    this._showMsg( 'timer.tsu@mode', 'TSU mode: ' + ['hostile/outlaw','neutral','cargo'][this._mode] );
};

this._showMsg = function(key, msg) {
    var
    c = player.ship.multiFunctionDisplays,
    r = false;

    if ( c > 0 ) {
        player.ship.setMultiFunctionText(key, msg);
        for ( var n = 0; n < c; n++ ) {
            r = player.ship.setMultiFunctionDisplay(n, key);
            if (r) break;
        }
    }

    if ( c<1 || !r ) player.consoleMessage(msg, 1);
};

//Handle event "activated" for prime equipment
this.activated = function() {
    if ( player.ship.equipmentStatus('EQ_ENEMY_TARGETER_UPGRADE') === 'EQUIPMENT_OK' ) {
        this._setNextTarget();
    }
};

this._setNextTarget = function() {
    var targets = [];

    if ( 0 === this._mode ) {
        targets = this._getHostileShips();

        if ( targets.length < 1 ) {
            targets = this._getOutlawShips();
        }
    }
    else if ( 1 === this._mode ) {
        targets = this._getNeutralShips();
    }
    else if ( 2 === this._mode ) {
        targets = this._getCargoPods();
    }

    var len = targets.length - 1;

    if ( len < 0 ) {
        return;
    }

    this._sortByDistance(targets);

    var ptn = 0;
    if ( player.ship.target ) {
        var TSU = worldScripts['Target System Upgrade'];
        ptn = TSU._getPreviousTargetNum();
        ptn = ptn >= len ? 0 : ptn + 1;
        TSU._setPreviousTargetNum(ptn);
    }
    var nextTarget = targets[ptn];

    if ( player.ship.target && player.ship.target === nextTarget ) {
        return;
    }

    player.ship.target = nextTarget;
};

this._getHostileShips = function() {
    if ( ! player.alertHostiles ) {
        return [];
    }
    return this._filterEntities(
        function(e) { return ( e.isShip && e.hasHostileTarget && e.target === player.ship ); }
    );
};

this._getOutlawShips = function() {
    if ( 1 > player.alertCondition ) {
        return [];
    }
    return this._filterEntities(
        function(e) { return ( e.scanClass === 'CLASS_NEUTRAL' && e.bounty !== 0 ); }
    );
};

this._getNeutralShips = function() {
    if ( 1 > player.alertCondition ) {
        return [];
    }
    return this._filterEntities(
//        function(e) { return ( e.scanClass === 'CLASS_NEUTRAL' && e.bounty === 0 && e.target !== player.ship ); }
        function(e) { return ( e.scanClass === 'CLASS_NEUTRAL' && e.bounty === 0 ); }
    );
};

this._getCargoPods = function() {
    return this._filterEntities(
        function(e) { return ( e.scanClass === 'CLASS_CARGO' ); }
    );
};

this._filterEntities = function(filterFunc) {
    return system.filteredEntities(
        this,
        filterFunc,
        player.ship,
        player.ship.scannerRange
    );
};

this._sortByDistance = function(targets) {
    var cache = {};
    // sort
    targets.sort( function sortByDist(a,b) {
        // cache distance
        //var ai=a.ID,bi=b.ID; // work only with my patch with universalID getter :(
        var
        ai = a.entityPersonality,
        bi = b.entityPersonality; // use some "uniq" ident
        cache[ai] = cache[ai] || a.position.distanceTo(player.ship.position);
        cache[bi] = cache[bi] || b.position.distanceTo(player.ship.position);
        return ((cache[ai]<cache[bi])?-1:((cache[ai]>cache[bi])?1:0));
    } );
};

'use strict';

this.author  = 'Andrey Belov';
this.licence = 'CC-BY-NC-SA 3.0';

this.name    = 'Target System Upgrade';


this.startUp = function() {
    this._setPreviousTargetNum(0);
};

this._setPreviousTargetNum = function(num) {
    this._previousTargetNum = num;
};

this._getPreviousTargetNum = function() {
	return this._previousTargetNum;
};

// sell 'Target System Upgrade'
this.playerBoughtEquipment = function(equipmentKey) {
	if ( equipmentKey === 'EQ_ENEMY_TARGETER_UPGRADE_REMOVAL') {
		player.ship.removeEquipment('EQ_ENEMY_TARGETER_UPGRADE');
		player.ship.removeEquipment('EQ_ENEMY_TARGETER_UPGRADE_REMOVAL');
		player.credits += ( EquipmentInfo.infoForKey('EQ_ENEMY_TARGETER_UPGRADE').price * 0.09 );
	}
};

this.equipmentDamaged = function(equipment) {
	if ( equipment === 'EQ_ENEMY_TARGETER_UPGRADE' ) {
		player.consoleMessage('Target System Upgrade is damaged!');
	}
};

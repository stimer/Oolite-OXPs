'use strict';

this.name = 'Cargo Scanner';

this.shipTargetAcquired = function(target) {
    if ( ! target.isCargo || target.isPiloted
         || player.ship.equipmentStatus('EQ_CARGO_SCANNER') !== 'EQUIPMENT_OK' ) {
        return;
    }

    if ( target.commodity !== 'goods' ) {
        if ( ! target.shipUniqueName ) {
            var ca = +target.commodityAmount;
            target.shipUniqueName = displayNameForCommodity( target.commodity )
                    + ( ca === 1 ? '' : ' ['+ca+']' );
        }
    }
    else {
        target.shipUniqueName = 'Unknown/Broken RFID';
    }
};

this.playerBoughtEquipment = function(equipment) {
    if ( equipment === 'EQ_CARGO_SCANNER_REMOVER' ) {
        player.ship.removeEquipment('EQ_CARGO_SCANNER_REMOVER');
        player.ship.removeEquipment('EQ_CARGO_SCANNER');
        player.credits += ( EquipmentInfo.infoForKey('EQ_CARGO_SCANNER').price * 0.06 );
    }
};

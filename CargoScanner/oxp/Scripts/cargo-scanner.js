'use strict';

this.name = 'Cargo Scanner';

this.shipTargetAcquired = function(target) {
    if ( ! target.isShip || ! target.isCargo || target.shipUniqueName || target.isPiloted
         || player.ship.equipmentStatus('EQ_CARGO_SCANNER') !== 'EQUIPMENT_OK' ) {
        return;
    }

    var tc = target.commodity;
    if ( tc && tc !== 'goods' ) {
        var ca = +target.commodityAmount;
        target.shipUniqueName = displayNameForCommodity(tc)
                + ( ca === 1 ? '' : ' ['+ca+']' );
    }
    else {
        target.shipUniqueName = 'Unknown';
    }
};

this.playerBoughtEquipment = function(equipment) {
    if ( equipment === 'EQ_CARGO_SCANNER_REMOVER' ) {
        player.ship.removeEquipment('EQ_CARGO_SCANNER_REMOVER');
        player.ship.removeEquipment('EQ_CARGO_SCANNER');
        player.credits += ( EquipmentInfo.infoForKey('EQ_CARGO_SCANNER').price * 0.06 );
    }
};

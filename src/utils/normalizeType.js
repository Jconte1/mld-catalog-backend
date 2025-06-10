export default function normalizeType(typeParam) {
    const t = typeParam?.toLowerCase?.() || '';
  
    switch (t) {
      case 'cooktops-and-rangetops':
        return ['COOKTOPS (ELECTRIC)', 'COOKTOPS (GAS)', 'RANGETOPS'];
      case 'built-in-ovens':
        return ['SINGLE WALL OVEN', 'DOUBLE WALL OVEN', 'BUILT-IN OVEN'];
      case 'warming-drawers':
        return ['WARMING DRAWER'];
      case 'microwave':
        return ['MICROWAVE', 'OVER THE RANGE MICROWAVE', 'COUNTERTOP MICROWAVE', 'BUILT-IN MICROWAVE'];
      case 'coffee-systems':
        return ['COFFEE MAKERS AND GRINDERS'];
      case 'dishwashers':
        return ['BUILT IN DISHWASHER', 'PORTABLE DISHWASHER'];
      case 'refrigerators':
        return [
          'FRENCH DOOR REFRIGERATOR',
          'SIDE BY SIDE REFRIGERATOR',
          'TOP FREEZER REFRIGERATOR',
          'BOTTOM FREEZER REFRIGERATOR',
          'NO FREEZER BUILT IN REFRIGERATOR',
          'FRENCH DOOR FREESTANDING REFRIGERATOR',
          'SIDE BY SIDE BUILT IN REFRIGERATOR',
          'COMPACT REFRIGERATOR',
          'SPECIALTY REFRIGERATOR',
          'TOP FREEZER FREESTANDING REFRIGERATOR',
          'GLASS DOOR REFRIGERATOR',
        ];
      case 'freezers':
        return ['REFRIGERATED DRAWER', 'UPRIGHT FREEZERS', 'CHEST FREEZERS'];
      case 'ice-makers':
        return ['ICE MAKERS'];
      case 'outdoor-grills':
        return ['LP GAS BBQ', 'NATURAL GAS BBQ', 'PRO STYLE BBQ', 'CHARCOAL BBQ', 'ELECTRIC BBQ', 'PELLET BBQ'];
      case 'laundry':
        return [
          'TOP LOAD MATCHING ELECTRIC DRYER',
          'FRONT LOAD ELECTRIC DRYER',
          'COMBINATION WASHER DRYER',
          'FRONT LOAD GAS DRYER',
          'HIGH EFFICIENCY TOP LOAD WASHER',
          'TRADITIONAL TOP LOAD WASHER',
          'TOP LOAD GAS DRYER',
          'LAUNDRY PEDESTAL',
          'ELECTRIC DRYER',
          'FRONT LOAD ELECTRIC DRYER',
          'COMMERCIAL WASHER',
          'PORTABLE DRYER',
        ];
        
      case 'ranges':
        return [
          'PROFESSIONAL AND LARGE FREE STANDING GAS RANGE',
          'PROFESSIONAL GAS RANGE',
          'FREESTANDING SMOOTHTOP ELECTRIC RANGE',
          'ELECTRIC SPECIALTY RANGE',
          'SLIDE-IN ELECTRIC RANGE',
          'SLIDE IN GAS RANGE',
          'SLIDE IN ELECTRIC RANGE',
          '20" FREESTANDING COIL ELECTRIC RANGE',
          '20" FREE STANDING GAS RANGE',
          '24" FREE STANDING GAS RANGE',
          '24" FREESTANDING COIL ELECTRIC RANGE',
          '30" FREE STANDING ELECTRIC RANGE',
          '30" FREE STANDING GAS RANGE',
          '30" SLIDE-IN GAS RANGE',
          '30" ELECTRIC COIL RANGE',
          '30" FREESTANDING COIL ELECTRIC RANGE',
          
          '36" FREE STANDING GAS RANGE',
          '36" AND LARGER FREE STANDING GAS RANGE',
          '36" AND LARGER FREESTANDING COIL RANGE',
          '30" FREESTANDING COIL ELECTRIC RANGE',
          'ELECTRIC FREESTANDING COIL RANGE',
          
          'DROP IN ELECTRIC RANGE',
          'SPECIALTY RANGE',
          'SPECIALTY GAS RANGE'
        ];
      default:
        return [typeParam.toUpperCase()];
    }
  }


export function parseMETAR(metarString) {
    const components = metarString.split(' ');
    let wind = '';
    let visibility = '';
    let ceiling = Infinity;
    let visibilityValue = Infinity;
  
    for (const component of components) {
      if (component.match(/^\d{3}\d{2}KT$/) || component.match(/^\d{3}V\d{3}$/)) {
        wind = component;
      } else if (component.match(/^\d+SM$/)) {
        visibilityValue = parseFloat(component.replace('SM', '').replace('/', '.'));
        visibility = component;
      } else if (component.match(/\b(VV|OVC|BKN|FEW|SCT)\d{3}\b/)) {
        const ceilingValue = parseInt(component.slice(-3)) * 100;
        if (
          component.startsWith('BKN') ||
          component.startsWith('OVC') ||
          component.startsWith('VV')
        ) {
          if (ceilingValue < ceiling) {
            ceiling = ceilingValue;
          }
        }
      }
    }
  
    const { category, color } = getFlightCategory(ceiling, visibilityValue);

    return { metarString, ceiling, visibilityValue, category, color };
  }

  
export function getFlightCategory(ceiling, visibility) {
    if (ceiling < 500 || visibility < 1) {
      return { category: 'LIFR', color: 'text-custom-lifr' };
    } else if (ceiling < 1000 || visibility < 3) {
      return { category: 'IFR', color: 'text-custom-ifr' };
    } else if (ceiling <= 3000 || visibility <= 5) {
      return { category: 'MVFR', color: 'text-custom-mvfr' };
    } else if (ceiling > 3000 && visibility > 5) {
      return { category: 'VFR', color: 'text-custom-vfr' };
    } else {
      return { category: 'Unknown', color: 'text-gray-500' };
    }
  }
  
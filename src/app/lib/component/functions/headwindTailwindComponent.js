export const HeadwindTailwindComponent = (
    integerWindDirection,
    integerRunwayHeading,
    integerWindSpeed,
    initialEastOrWestVar,
    integerInitialMagneticVar
) => {

    const magneticWinds = initialEastOrWestVar === "West" ?
    integerWindDirection += integerInitialMagneticVar : integerWindDirection -= integerInitialMagneticVar;
  
    const magneticWindsNoNeg = magneticWinds < 0 ? 360 + magneticWinds : magneticWinds > 360 ? magneticWinds - 360 : magneticWinds;
  

    let degree = magneticWindsNoNeg - integerRunwayHeading;

    if (magneticWindsNoNeg > 0 && integerRunwayHeading > 0) {
        return ((integerWindSpeed) * ((Math.cos(degree * (Math.PI / 180.0)))));
    } else {
        return 0;
    }
}


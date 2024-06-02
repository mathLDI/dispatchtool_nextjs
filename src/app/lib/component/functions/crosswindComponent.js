
export const CrosswindComponent = (
  integerWindDirection,
  integerRunwayHeading,
  integerWindSpeed,
  initialEastOrWestVar,
  initialMagneticVar

) => {

  const magneticWinds = initialEastOrWestVar === "West" ?
  integerWindDirection += initialMagneticVar : integerWindDirection -= initialMagneticVar;


  const magneticWindsNoNeg = magneticWinds < 0 ? 360 + magneticWinds : magneticWinds > 360 ? magneticWinds - 360 : magneticWinds;

  let degree = magneticWindsNoNeg - integerRunwayHeading;
  let x = integerWindSpeed * Math.sin((degree * Math.PI) / 180.0);
  let y = x.toString();

  if (magneticWindsNoNeg > 0.0 && integerRunwayHeading > 0.0) {
    return y;
  } else {
    return 0;
  }
};


export const CrosswindComponentNoNegOneDigit = (
  CrosswindComp,
) => {

  return parseFloat(Math.abs(CrosswindComp,
  ).toFixed(1));


}

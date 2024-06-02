import { contaminent } from '../functions/runwayType.js';


export const RccToUse = (
    initialRunwayConditionDescriptionGravel1,
    initialRunwayConditionDescriptionPaved2,
    initialRunwayConditionDescriptionGravel3,
    initialRunwayConditionDescriptionPaved4,
    initialDropDownPavedOrGravel,
    initialContaminationCoverage1,
    initialContaminationCoverage3,
    initialContaminationCoverage2,
    initialContaminationCoverage4
) => {

    const totalPercentage = initialDropDownPavedOrGravel === "GRAVEL" ?
        initialContaminationCoverage1 + initialContaminationCoverage3 :
        initialContaminationCoverage2 + initialContaminationCoverage4;

    const gravelSingleOrMulti =
        initialContaminationCoverage1 === 0 && initialContaminationCoverage3 === 0
            ? 0
            : initialContaminationCoverage1 > 0 && initialContaminationCoverage3 > 0
                ? 2
                : 1;

    const pavedSingleOrMulti =
        initialContaminationCoverage2 === 0 && initialContaminationCoverage4 === 0
            ? 0
            : initialContaminationCoverage2 > 0 && initialContaminationCoverage4 > 0
                ? 2
                : 1;

    const singleOrMultiContam = initialDropDownPavedOrGravel === "GRAVEL" ? gravelSingleOrMulti : pavedSingleOrMulti;

    const topRccCode = contaminent.find((item) => item.description === (initialDropDownPavedOrGravel === "GRAVEL" ? initialRunwayConditionDescriptionGravel1 :
        (initialDropDownPavedOrGravel === "PAVED" ? initialRunwayConditionDescriptionPaved2 : "DEFAULT_DESCRIPTION")));

    const topRccCodeX = topRccCode ? topRccCode.code : -1;

    const bottomRccCode = contaminent.find((item) => item.description === (initialDropDownPavedOrGravel === "GRAVEL" ? initialRunwayConditionDescriptionGravel3 :
        (initialDropDownPavedOrGravel === "PAVED" ? initialRunwayConditionDescriptionPaved4 : "DEFAULT_DESCRIPTION")));

    const bottomRccCodeX = bottomRccCode ? bottomRccCode.code : -1;

    const topPercentageSelector = (
        initialDropDownPavedOrGravel, initialContaminationCoverage1, initialContaminationCoverage2
    ) => {
        return initialDropDownPavedOrGravel === "GRAVEL" ? initialContaminationCoverage1 : initialContaminationCoverage2;
    };

    const topPercentageSelect = topPercentageSelector(initialDropDownPavedOrGravel, initialContaminationCoverage1, initialContaminationCoverage2)

    const bottomPercentageSelector = (
        initialDropDownPavedOrGravel, initialContaminationCoverage3, initialContaminationCoverage4
    ) => {
        return initialDropDownPavedOrGravel === "GRAVEL" ? initialContaminationCoverage3 : initialContaminationCoverage4;
    };

    const bottomPercentageSelect = bottomPercentageSelector(initialDropDownPavedOrGravel, initialContaminationCoverage3, initialContaminationCoverage4)

    const LowerRccContaminant = (topRccCodeX, bottomRccCodeX) => topRccCodeX === -1 || bottomRccCodeX === -1
        ? 'null' : topRccCodeX < bottomRccCodeX ? topRccCodeX : bottomRccCodeX;

    const LowerRccContam = LowerRccContaminant(topRccCodeX, bottomRccCodeX);

    let result = "null";

    if (totalPercentage > 100) {
        result = true;
    } else if (totalPercentage <= 25) {
        result = 6;
    } else if (
        singleOrMultiContam === 1 &&
        topRccCodeX !== -1
    ) {
        result = topRccCodeX;
    } else if (
        singleOrMultiContam === 1 &&
        bottomRccCodeX
        !== -1
    ) {
        result = bottomRccCodeX;
    } else if (
        singleOrMultiContam === 1 &&
        topRccCodeX === -1
    ) {
        result = "null";
    } else if (
        singleOrMultiContam === 1 &&
        bottomRccCodeX
        === -1
        //code below doesnt seem to be called at any time!!//
    ) {
        result = "null";
    } else if (
        singleOrMultiContam === 2 &&
        topPercentageSelect > 25 &&
        bottomPercentageSelect > 25
    ) {
        result = LowerRccContam;
    } else if (
        (singleOrMultiContam === 2 &&
            topPercentageSelect > 25 &&
            bottomPercentageSelect <= 25) ||
        (bottomPercentageSelect > 25 && topPercentageSelect <= 25)
    ) {
        result = topPercentageSelect > bottomPercentageSelect ? topRccCodeX : bottomRccCodeX;
    } else if (
        singleOrMultiContam === 2 &&
        topPercentageSelect <= 25 &&
        bottomPercentageSelect <= 25 &&
        topPercentageSelect !== bottomPercentageSelect
    ) {
        result = (topPercentageSelect > bottomPercentageSelect) ? (topRccCodeX <= 2 ? 3 : topRccCodeX)
            : (bottomRccCodeX <= 2 ? 3 : bottomRccCodeX);
    } else if (
        singleOrMultiContam === 2 &&
        topPercentageSelect <= 25 &&
        bottomPercentageSelect <= 25 &&
        topPercentageSelect === bottomPercentageSelect
    ) {
        result = Math.min(topRccCodeX, bottomRccCodeX) <= 2 ? 3 : Math.min(topRccCodeX, bottomRccCodeX);
    } else {
        result = "null";
    }
    return {
        result,
        totalPercentage,
        topPercentageSelect,
        bottomPercentageSelect,
        singleOrMultiContam
    };



};


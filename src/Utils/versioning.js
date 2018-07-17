import {findLastIndex, find} from 'lodash';
import {insertAt, replaceAt} from './string';
//001
const firstVersion = "1.0.0";
const removeAllDotsAfterFirstDot = (version) => {
    while (getDotCount(version) > 1) {
        version = removeLastDot(version);
    }
    return version;
};

const addAllDotsAfterFirstDot = (version) => {
    const [firstSection, secondSection] = version.split('.');
    let secondSectionBuilder = secondSection.split("").reduce((builder, nextChar) => builder + `${nextChar}.`, '');
    const dotSeprate = firstSection && secondSectionBuilder ? '.' : ''
    const lastSection = secondSectionBuilder && secondSectionBuilder.substring(0, secondSectionBuilder.length - 1) || ''
    return `${firstSection}${dotSeprate}${lastSection}`;
};

//1.0.0.0
//"1.001"

const removeLastDot = (version) => replaceAt(version, findLastIndex(version, c => c === '.'), '');
const getDotCount = (version) => version.split('.').length - 1;
export const getNextVersion = (currentVersion) => {
    const dotCount = getDotCount(currentVersion);
    const versionAsNumber = parseFloat(removeAllDotsAfterFirstDot(currentVersion));
    const increaseNumber = getIncreaseDecreaseNumber(dotCount);
    if (versionAsNumber && increaseNumber) {
        const newVersion = (versionAsNumber + increaseNumber).toFixed(dotCount);
        return addAllDotsAfterFirstDot(newVersion);
    }
};

const getIncreaseDecreaseNumber = (dotCount) => {
    if (dotCount === 1) return 0.1;
    let increaseNumber = "0.0";
    for (let i = 0; i < dotCount - 2; i++) {
        increaseNumber += '0';
    }

    return parseFloat(increaseNumber + '1');
};

export const getPreviousVersion = (currentVersion) => {
    const dotCount = getDotCount(currentVersion);
    const versionAsNumber = parseFloat(removeAllDotsAfterFirstDot(currentVersion));
    const decreaseNumber = getIncreaseDecreaseNumber(dotCount);
    if (versionAsNumber && decreaseNumber) {
        const newVersion = (versionAsNumber - decreaseNumber).toFixed(dotCount);
        return addAllDotsAfterFirstDot(newVersion);
    }
};
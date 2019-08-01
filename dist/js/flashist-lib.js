// Test data for gulp-js
try {
    !!document;
} catch (error) {
    document = {};
}
// Test data for web-js
try {
    !!module;
} catch (error) {
    module = {};
}

var flashistTools = {};
module.exports = flashistTools;
document.flashistTools = flashistTools;

var StringTools = {

    substituteList: function (sourceText, ...args) {
        return StringTools.substitute(sourceText, args);
    },

    substitute: function (sourceText, substituteParams) {
        var resultStr = sourceText;

        if (ObjectTools.isSimpleType(substituteParams)) {
            substituteParams = [substituteParams];
        }

        if (substituteParams) {
            var tempArgStr;
            var foundPattern;
            var paramName;
            for (paramName in substituteParams) {
                tempArgStr = substituteParams[paramName];

                foundPattern = "{" + paramName + "}";
                resultStr = StringTools.replaceText(resultStr, foundPattern, tempArgStr);
            }
        }

        return resultStr;
    },

    replaceText: function (sourceString, searchString, replaceString) {
        // Split the string (if the search string has been found)
        var replacedString = sourceString.split(searchString).join(replaceString);

        return replacedString;
    }

};
flashistTools.StringTools = StringTools;

var ObjectTools = {

    isSimpleType: function (obj) {
        var isSimple = false;
        if (typeof (obj) == "string" || typeof (obj) == "number" || typeof (obj) == "boolean") {
            isSimple = true;
        }

        return isSimple;
    }

};
flashistTools.ObjectTools = ObjectTools;

var NumberTools = {

    sumOfAllIntegersBeforeIncluding: function (integer) {
        return (integer * (integer + 1)) / 2;
    },

    // Map to lazy-optimization of finding all multiplication values
    hashOfMultiplicationOfAllIntegersBeforeIncluding: {},
    multiplicationOfAllIntegersBeforeIncluding: function (integer) {

        var tempHash = NumberTools.hashOfMultiplicationOfAllIntegersBeforeIncluding;
        var result = 1;
        if (tempHash[integer] || tempHash[integer] === 0) {
            result = tempHash[integer];

        } else {
            for (var i = 2; i <= integer; i++) {
                result = result * i;
            }
        }

        tempHash[integer] = result;
        return result;
    }
};
flashistTools.NumberTools = NumberTools;

var ArrayTools = {
    removeItem: (list, item, removeCount) => {
        if (!removeCount) {
            removeCount = Number.MAX_VALUE;
        }

        let totalRemovedCount = 0;
        let itemIndex = list.indexOf(item);
        while (itemIndex != -1 && totalRemovedCount < removeCount) {
            list.splice(itemIndex, 1);

            itemIndex = list.indexOf(item, itemIndex);
            totalRemovedCount++;
        }
    },

    removeItems: (list, removeItems) => {
        let item;
        for (let itemIndex = 0; itemIndex < removeItems.length; itemIndex++) {
            item = removeItems[itemIndex];
            ArrayTools.removeItem(list, item);
        }
    },

    getUniqueItems: (list) => {
        let result = list.filter(ArrayTools.removeDuplicatesFilter);
        return result;
    },

    removeDuplicatesFilter: (item, index, list) => {
        return (index == 0) ? true : list.lastIndexOf(item, index - 1) == -1;
    }
};
flashistTools.ArrayTools = ArrayTools;

var CombinationTools = {

    generateAllPossibleCombinations: function (input, size) {

        var generateItems = function (predefinedItems) {
            var generateResult = [];

            alert("NOT IMPLEMENTED YET!");

            return generateResult;
        }

    },

    /**
     *
     * @param availableElementsCount (n)
     * @param combinationElementsCount (k)
     * @return {number}
     */
    amountOfAllCombinations: function (availableElementsCount, combinationElementsCount) {
        // Math.pow(n, k)
        return Math.pow(availableElementsCount, combinationElementsCount);
    },

    /**
     *
     * @param availableElementsCount (n)
     * @param combinationElementsCount (k)
     * @return {number}
     */
    amountOfUniqueCombinations: function (availableElementsCount, combinationElementsCount) {
        // n! / (k! * (n - k)!)
        var top = NumberTools.multiplicationOfAllIntegersBeforeIncluding(availableElementsCount);
        var down = (NumberTools.multiplicationOfAllIntegersBeforeIncluding(combinationElementsCount) * NumberTools.multiplicationOfAllIntegersBeforeIncluding(availableElementsCount - combinationElementsCount));
        return top / down;
    },

    /**
     *
     * @param availableElementsCount (n)
     * @param combinationElementsCount (k)
     * @param combinationIndex - 0 <= X < (not including) CombinationTools.amountOfAllCombinations(availableElementsCount, combinationElementsCount)
     *
     * @return {Array}
     */
    generateCombinationElementsByCombinationIndex: function (availableElementsCount, combinationElementsCount, combinationIndex) {
        const result = [];

        let tempLineIndex;
        let tempNumberForCalculation = combinationIndex;
        for (let elementIndex = 0; elementIndex < combinationElementsCount; elementIndex++) {
            tempLineIndex = Math.floor(tempNumberForCalculation % availableElementsCount);
            console.log("tempLineIndex: ", tempLineIndex, "| before floor: ", (tempNumberForCalculation % availableElementsCount), " | tempNumberForCalculation: ", tempNumberForCalculation, " | availableElementsCount: ", availableElementsCount);

            result.push(tempLineIndex);

            //
            tempNumberForCalculation = Math.floor(tempNumberForCalculation / availableElementsCount);
        }

        return result;
    },


    hashOfGenerateUniqueCombinationElementsByCombinationIndex: {},
    hashOfGenerateUniqueCombinationElementsByCombinationIndexFirstColumn: {},

    getFirstColumnIndex: function (availableItemsCount, combinationElementsCount, combinationIndex) {
        var firstColumnIndexResult = {
            value: null,
            processedColumnsIndicesCount: null
        };

        var firstColumnHash = CombinationTools.hashOfGenerateUniqueCombinationElementsByCombinationIndexFirstColumn;
        if (!firstColumnHash[availableItemsCount]) {
            firstColumnHash[availableItemsCount] = {};
        }
        if (!firstColumnHash[availableItemsCount][combinationElementsCount]) {
            firstColumnHash[availableItemsCount][combinationElementsCount] = {};
        }

        if (firstColumnHash[availableItemsCount][combinationElementsCount][combinationIndex] || firstColumnHash[availableItemsCount][combinationElementsCount][combinationIndex] === 0) {
            firstColumnIndexResult = firstColumnHash[availableItemsCount][combinationElementsCount][combinationIndex];

        } else {

            // think about matrices of results
            var totalStepCombinationsCount = 0;
            var prevStepCombinationsCount = 0;
            var maxColumnIndex = availableItemsCount - combinationElementsCount;
            for (var columnIndex = 0; columnIndex <= maxColumnIndex; columnIndex++) {
                totalStepCombinationsCount += CombinationTools.amountOfUniqueCombinations(
                    availableItemsCount - 1 - columnIndex,
                    combinationElementsCount - 1
                );
                if (combinationIndex < totalStepCombinationsCount) {
                    firstColumnIndexResult.value = columnIndex;
                    firstColumnIndexResult.processedColumnsIndicesCount = prevStepCombinationsCount;
                    break;
                }

                prevStepCombinationsCount = totalStepCombinationsCount;
            }
        }

        firstColumnHash[availableItemsCount][combinationElementsCount][combinationIndex] = firstColumnIndexResult;
        return firstColumnIndexResult;
    },

    /**
     *
     * @param availableElementsCount (n)
     * @param combinationElementsCount (k)
     * @param combinationIndex - 0 <= X < (not including) CombinationTools.amountOfUniqueCombinations(availableElementsCount, combinationElementsCount)
     *
     * @return {Array}
     */
    generateUniqueCombinationElementsByCombinationIndex: function (availableItemsCount, combinationElementsCount, combinationIndex) {

        var result = [];

        // First step
        var stepElementData = CombinationTools.getFirstColumnIndex(
            availableItemsCount,
            combinationElementsCount,
            combinationIndex
        );
        result.push(stepElementData.value);

        var prevStepElementData = stepElementData;
        var prevStepShiftedValue = stepElementData.value;
        //
        // Start from 1, as the first one is processed earlier
        for (var elementIndex = 1; elementIndex < combinationElementsCount; elementIndex++) {
            combinationIndex = combinationIndex - prevStepElementData.processedColumnsIndicesCount;

            stepElementData = CombinationTools.getFirstColumnIndex(
                availableItemsCount - prevStepShiftedValue - 1,
                combinationElementsCount - elementIndex,
                combinationIndex
            );

            var stepShiftedValue = stepElementData.value + prevStepShiftedValue + 1;
            result.push(stepShiftedValue);

            prevStepElementData = stepElementData;
            prevStepShiftedValue = stepShiftedValue;
        }

        // console.log("testOrigValues: ", testOrigValues);
        return result;

    },

    generateAllAvailableUniqueCombinationElements: function (availableItemsCount, combinationElementsCount) {
        var result = [];

        var allCombinationsCount = CombinationTools.amountOfUniqueCombinations(
            availableItemsCount,
            combinationElementsCount
        );
        for (var combinationIndex = 0; combinationIndex < allCombinationsCount; combinationIndex++) {
            var singleCombination = CombinationTools.generateUniqueCombinationElementsByCombinationIndex(
                availableItemsCount,
                combinationElementsCount,
                combinationIndex
            );

            result.push(singleCombination);
        }

        return result;
    }
};
flashistTools.CombinationTools = CombinationTools;
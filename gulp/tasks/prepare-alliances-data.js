var gulp = require("gulp");
var fs = require('fs');
// var ArrayTools = require('./array-tools.js');
// var CombinationTools = require('./combination-tools.js');
var flashistTools = require("../../dist/js/flashist-lib.js");
var underlordsHelperTools = require("../../dist/js/underlords-helper-lib.js");
//
var argv = require('yargs').argv;
//

//
// var settings;
var createBuildHashesMap;
//
var generateNextStepUniqueItems = function (items, predefinedItems, ignoreHash) {
    var result = [];

    // var sizeDelta = size - items.length;
    // for (var sizeIndex = 0; sizeIndex < sizeDelta; sizeIndex++) {
    var itemsCount = items.length;
    for (var itemIndex = 0; itemIndex < itemsCount; itemIndex++) {
        var singleItem = items[itemIndex];
        // Only if the item shouldn't be ignored
        if (predefinedItems.indexOf(singleItem) === -1) {
            var uniqueItems = predefinedItems.concat();
            uniqueItems.push(singleItem);
            // Sort, to keep everything in alphabetical order
            uniqueItems.sort();

            var tempHash = underlordsHelperTools.CommonTools.generateHashForItems(uniqueItems);
            if (!ignoreHash[tempHash]) {
                ignoreHash[tempHash] = true;

                result.push(uniqueItems.concat());
            }
        }
    }
    // }

    return result;
};

var generateAllianceDataForStepsCount = function (items, baseItems, stepsCount, ignoreHash) {
    return new Promise(
        (resolve) => {

            var availableItems = items.concat();
            // ArrayTools.removeItems(availableItems, baseItems);
            // console.log("generateAllianceDataForStepsCount __ availableItems: ", availableItems, "| baseItems: ", baseItems, " | stepsCount: ", stepsCount);

            var ignoreItems = [];
            var preCycleGeneratedItems;
            var curCycleGeneratedItems = [baseItems.concat()];
            //
            var processStep = (step) => {
                // console.log("generateAllianceDataForStepsCount __ step: ", step);
                if (step >= stepsCount) {
                    resolve(curCycleGeneratedItems);

                } else {
                    preCycleGeneratedItems = curCycleGeneratedItems.concat();
                    ignoreItems.push(...preCycleGeneratedItems);

                    curCycleGeneratedItems = [];
                    var preItemsCount = preCycleGeneratedItems.length;
                    for (var preItemIndex = 0; preItemIndex < preItemsCount; preItemIndex++) {
                        var preSingleItem = preCycleGeneratedItems[preItemIndex];

                        var stepIds = generateNextStepUniqueItems(
                            availableItems,
                            preSingleItem,
                            ignoreHash
                        );
                        curCycleGeneratedItems.push(...stepIds);
                    }

                    processStep(step + 1);
                }
            };
            // processStep(0);
            processStep(baseItems.length);
        }
    );
};

var prepareAllAllianceData = function () {
    return new Promise(
        (resolve) => {

            var alliancesCount = underlordsHelperTools.CommonTools.settings.alliances.length;
            // var alliancesCount = 1;
            var processAllianceNextStep = (stepIndex) => {
                console.log("- - - - -");
                console.log("processAllianceNextStep __ stepIndex: ", stepIndex);
                if (stepIndex >= alliancesCount) {
                    resolve();

                } else {
                    generateSingleAllianceData(underlordsHelperTools.CommonTools.settings.alliances[stepIndex])
                        .then(
                            () => {
                                processAllianceNextStep(stepIndex + 1);
                            }
                        );
                }
            };
            processAllianceNextStep(0);
        }
    );
};

var generateSingleAllianceData = function (allianceData) {
    console.log("generateSingleAllianceData __ allianceData.name: ", allianceData.name);

    return new Promise(
        (resolve) => {

            generateHeroCombinationsForAlliance(allianceData)
                .then(
                    (generatedData) => {
                        // console.log("sortedAlliances[0]: ", underlordsHelperTools.CommonTools.settings.alliances[0]);
                        // console.log("generatedData: ", generatedData);

                        // var folderPath = `${generatedDataAlliancesBasePath}${generatedData.name}`;
                        var folderPath = underlordsHelperTools.PathTools.getAllianceGeneratedFolderPath(generatedData.name);
                        var filePath = underlordsHelperTools.PathTools.getAllianceGeneratedDataPath(generatedData.name);
                        gulp.src('*.*', {read: false})
                            .pipe(gulp.dest(folderPath))
                            .on('end', function () {
                                //run some code here
                                // console.log("createFolder __ done __ path: " + path);

                                // var resultFilePath = folderPath + "/" + resultFileName;
                                // console.log("createFolder __ done __ filePath: " + filePath);
                                fs.writeFileSync(filePath, JSON.stringify(generatedData));

                                //
                                resolve();
                            });
                    }
                );
        }
    );
};

var readAllianceGeneratedData = (allianceName) => {
    return new Promise(
        (resolve) => {
            var filePath = underlordsHelperTools.PathTools.getAllianceGeneratedDataPath(allianceName);

            var result = JSON.parse(fs.readFileSync(filePath));
            resolve(result);
        }
    );
};

var writeAllHashedHeroGeneratedDataItems = async () => {
    var heroNames = underlordsHelperTools.ReadTools.getAllHashedHeroNames();

    var heroesCount = heroNames.length;

    var startTime = Date.now();
    console.log("writeAllHashedHeroGeneratedDataItems __ hashed heroes: ", heroesCount, " | time: ", startTime);

    for (var heroIndex = 0; heroIndex < heroesCount; heroIndex++) {
        var singleHeroName = heroNames[heroIndex];
        var heroData = await underlordsHelperTools.ReadTools.readHeroGeneratedData(singleHeroName);

        await writeHeroGeneratedData(singleHeroName, heroData);
        console.log("writeAllHashedHeroGeneratedDataItems __ hero written __ heroIndex: ", heroIndex, " | singleHeroName: ", singleHeroName, " | time: ", Date.now());
        // console.log("writeAllHashedHeroGeneratedDataItems __ hero written __ heroData: ", heroData);
    }

    var endTime = Date.now();
    console.log("writeAllHashedHeroGeneratedDataItems __ FINISH __ time: ", endTime, " | duration: ", (endTime - startTime));
};

var writeHeroGeneratedData = (heroName, data) => {
    return new Promise(
        (resolve) => {

            // console.log("writeHeroGeneratedData __ heroName, ", heroName, " | data: ", data);
            var dataText = JSON.stringify(data);
            var folderPath = underlordsHelperTools.PathTools.getHeroGeneratedFolderPath(heroName);
            var filePath = underlordsHelperTools.PathTools.getHeroGeneratedDataPath(heroName);
            console.log("writeHeroGeneratedData __ heroName, ", heroName, " | folderPath: ", folderPath, " | filePath: ", filePath);

            gulp.src('*.*', {read: false})
                .pipe(gulp.dest(folderPath))
                .on('end', function () {
                    console.log("writeHeroGeneratedData __ start write __ heroName, ", heroName);
                    fs.writeFileSync(filePath, dataText);

                    console.log("writeHeroGeneratedData __ end write __ heroName, ", heroName);
                    resolve();
                });
        }
    );
};

var generateHeroCombinationsForAlliance = function (allianceData) {
    return new Promise(
        (resolve) => {

            var levelsCount = allianceData.levels.length;
            // var levelsCount = 1;

            var allianceHeroNames = underlordsHelperTools.CommonTools.getHeroNamesForAlliance(allianceData.name);
            allianceHeroNames.sort();

            var result = {
                name: allianceData.name,
                allianceHeroes: allianceHeroNames.concat(),
                allianceHeroesCount: allianceHeroNames.length,
                levels: [],
                secondLevel: {
                    alliances: [],
                    heroes: []
                    /*combinations: {
                        // index: K - combination length (available space to add other heroes)
                        // value: array of lists of hero names
                    }*/
                }
            };

            // Second-level data
            for (var singleHeroName of allianceHeroNames) {
                var heroData = underlordsHelperTools.CommonTools.getHeroDataByName(singleHeroName);
                for (var secondAllianceName of heroData.alliances) {
                    if (secondAllianceName !== allianceData.name) {
                        result.secondLevel.alliances.push(secondAllianceName);

                        var secondAllianceHeroes = underlordsHelperTools.CommonTools.getHeroNamesForAlliance(secondAllianceName);
                        for (var singleSecondAllianceHeroName of secondAllianceHeroes) {
                            if (result.allianceHeroes.indexOf(singleSecondAllianceHeroName) === -1) {
                                result.secondLevel.heroes.push(singleSecondAllianceHeroName);
                            }
                        }
                        // result.secondLevel.heroes.push(...secondAllianceHeroes);
                    }
                }
            }
            // Leave only unique elements
            result.secondLevel.alliances = flashistTools.ArrayTools.getUniqueItems(result.secondLevel.alliances);
            result.secondLevel.alliances.sort();
            result.secondLevel.heroes = flashistTools.ArrayTools.getUniqueItems(result.secondLevel.heroes);
            result.secondLevel.heroes.sort();
            //
            console.log("result.secondLevel.heroes: ", result.secondLevel.heroes);

            var processLevel = (levelIndex) => {
                console.log("generateHeroCombinationsForAlliance __ levelIndex: ", levelIndex, " | levelsCount: ", levelsCount, " | time: ", Date.now());
                if (levelIndex >= levelsCount) {
                    resolve(result);

                } else {
                    var singleLevelData = allianceData.levels[levelIndex];

                    /*// Second-level filling combinations
                    var secondLevelCombinationElementsCount = underlordsHelperTools.CommonTools.settings.game.maxPlayerHeroes - singleLevelData.count;
                    if (!result.secondLevel.combinations[secondLevelCombinationElementsCount]) {
                        result.secondLevel.combinations[secondLevelCombinationElementsCount] = [];
                    }

                    console.log("generateHeroCombinationsForAlliance __ before second level combinations generation __ result.secondLevel.heroes.length: ", result.secondLevel.heroes.length, " | secondLevelCombinationElementsCount: ", secondLevelCombinationElementsCount, " | time: ", Date.now());
                    var secondLevelCombinationsIndexValues = CombinationTools.generateAllAvailableUniqueCombinationElements(
                        result.secondLevel.heroes.length,
                        secondLevelCombinationElementsCount
                    );

                    var secondLevelCombinationsCount = secondLevelCombinationsIndexValues.length;
                    for (var secondLevelCombinationIndex = 0; secondLevelCombinationIndex < secondLevelCombinationsCount; secondLevelCombinationIndex++) {
                        if (secondLevelCombinationIndex % 10000 === 0) {
                            console.log("generateHeroCombinationsForAlliance __ secondLevelCombinationIndex: ", secondLevelCombinationIndex, " | time: ", Date.now());
                        }

                        var singleSecondLevelCombinationHeroNames = [];

                        var singleSecondLevelCombinationIndexValues = secondLevelCombinationsIndexValues[secondLevelCombinationIndex];
                        for (var singleSecondLevelCombinationIndex of singleSecondLevelCombinationIndexValues) {
                            singleSecondLevelCombinationHeroNames.push(
                                result.secondLevel.heroes[singleSecondLevelCombinationIndex]
                            );
                        }

                        singleSecondLevelCombinationHeroNames.sort();
                        result.secondLevel.combinations[secondLevelCombinationElementsCount].push(singleSecondLevelCombinationHeroNames);
                    }*/

                    var ignoreHash = {};
                    //
                    generateAllianceDataForStepsCount(
                        allianceHeroNames,
                        [],
                        singleLevelData.count,
                        ignoreHash
                    ).then(
                        (uniqueCombinationsForLevel) => {
                            // console.log("uniqueCombinationsForLevel.length: ", uniqueCombinationsForLevel.length);

                            var combinationHashes = {};
                            var filteredCombinationsForLevel = uniqueCombinationsForLevel.filter(
                                (singelCombinationIds) => {
                                    var filterResult = false;

                                    singelCombinationIds.sort();
                                    // var singelCombinationIdsHash = singelCombinationIds.join(" ");
                                    var singelCombinationIdsHash = underlordsHelperTools.CommonTools.generateHashForItems(singelCombinationIds);
                                    if (!combinationHashes[singelCombinationIdsHash]) {
                                        combinationHashes[singelCombinationIdsHash] = true;

                                        filterResult = true;
                                    }

                                    return filterResult;
                                }
                            );
                            console.log("levelIndex: ", levelIndex, " | singleLevelData.count: ", singleLevelData.count, " | filteredCombinationsForLevel.length: ", filteredCombinationsForLevel.length, " | uniqueCombinationsForLevel.length: ", uniqueCombinationsForLevel.length);

                            var levelCombinationData = {
                                count: singleLevelData.count,
                                preCombinations: filteredCombinationsForLevel.concat(),
                                preCombinationsCount: filteredCombinationsForLevel.length
                            };
                            result.levels.push(levelCombinationData);

                            // Next level
                            processLevel(levelIndex + 1);
                        }
                    );
                    // }
                }
            };

            processLevel(0);
        }
    );
};

var generateBuildData = (heroIds) => {

    heroIds.sort();

    var singleBuildData = {
        hash: underlordsHelperTools.CommonTools.generateHashForItems(heroIds),
        name: "",
        heroes: heroIds.concat(),
        alliancesMap: {
            /*a: {
                name:
                count: ,
                level:
            }*/
        },
        alliancesWithLevelsNames: [],
        alliancesValue: 0,
        maxAllianceValue: 0,
        tierValue: 0,
        maxTierValue: 0
    };

    //
    var heroesCount = singleBuildData.heroes.length;
    for (var heroIndex = 0; heroIndex < heroesCount; heroIndex++) {

        var heroName = singleBuildData.heroes[heroIndex];
        var heroData = underlordsHelperTools.CommonTools.getHeroDataByName(heroName);
        for (var allianceName of heroData.alliances) {
            if (!singleBuildData.alliancesMap[allianceName]) {
                singleBuildData.alliancesMap[allianceName] = {
                    name: allianceName,
                    count: 0,
                    level: 0
                };
            }

            singleBuildData.alliancesMap[allianceName].count++;
        }
    }

    // Heroes
    var heroesCount = singleBuildData.heroes.length;
    for (var heroIndex = 0; heroIndex < heroesCount; heroIndex++) {
        var heroId = singleBuildData.heroes[heroIndex];
        var heroData = underlordsHelperTools.CommonTools.getHeroDataByName(heroId);

        singleBuildData.tierValue += heroData.tier;

        if (heroData.tier > singleBuildData.maxTierValue) {
            singleBuildData.maxTierValue = heroData.tier;
        }
    }

    // Alliances
    var allianceKeys = Object.keys(singleBuildData.alliancesMap);
    var alliancesCount = allianceKeys.length;
    // console.log("generateBuildData __ alliancesCount: ", alliancesCount);
    for (var allianceIndex = 0; allianceIndex < alliancesCount; allianceIndex++) {
        // for (var singleAlliance of buildData.alliancesMap) {
        var allianceKey = allianceKeys[allianceIndex];
        var singleAlliance = singleBuildData.alliancesMap[allianceKey];

        var allianceConfigData = underlordsHelperTools.CommonTools.getAllianceDataByName(singleAlliance.name);
        // console.log("generateBuildData __ allianceConfigData: ", allianceConfigData);

        var allianceLevelsCount = allianceConfigData.levels.length;
        for (var levelIndex = allianceLevelsCount - 1; levelIndex >= 0; levelIndex--) {
            var levelConfig = allianceConfigData.levels[levelIndex];

            // console.log("generateBuildData __ singleAlliance.count: ", singleAlliance.count, " | levelConfig.count: ", levelConfig.count);
            if (singleAlliance.count >= levelConfig.count) {
                singleAlliance.level = (levelIndex + 1);

                singleBuildData.alliancesValue += singleAlliance.level;
                // Add additional points to bigger levels
                singleBuildData.alliancesValue += singleAlliance.level * 2;
                // singleBuildData.alliancesValue += Math.pow(singleAlliance.level, 2);

                if (singleAlliance.level > singleBuildData.maxAllianceValue) {
                    singleBuildData.maxAllianceValue = singleAlliance.level;
                }

                break;
            }
        }
    }

    // Create a name of the build (based on the alliances and their levels)
    var alliancesNames = Object.keys(singleBuildData.alliancesMap);
    alliancesNames = alliancesNames.filter(
        function (allianceName, index, array) {
            var filterResult = false;
            if (singleBuildData.alliancesMap[allianceName].level > 0) {
                filterResult = true;
            }

            return filterResult;
        }
    );
    alliancesNames.sort(
        function (allianceName1, allianceName2) {
            var sortResult = 0;

            var level1 = singleBuildData.alliancesMap[allianceName1].level;
            var level2 = singleBuildData.alliancesMap[allianceName2].level;
            if (level1 > level2) {
                sortResult = -1;
            } else if (level1 < level2) {
                sortResult = 1;
            }

            return sortResult;
        }
    );
    singleBuildData.alliancesWithLevelsNames = alliancesNames.concat();

    var levelAlliancesCount = alliancesNames.length;
    for (var levelAllianceIndex = 0; levelAllianceIndex < levelAlliancesCount; levelAllianceIndex++) {
        var singleAllianceName = alliancesNames[levelAllianceIndex];
        if (levelAllianceIndex > 0) {
            singleBuildData.name += " ";
        }
        singleBuildData.name += `[${singleBuildData.alliancesMap[singleAllianceName].level}]${singleAllianceName.toUpperCase()}x${singleBuildData.alliancesMap[singleAllianceName].count}`;
    }

    return singleBuildData;
};


// - - - - -
// Process Alliance Generated Data

var processAllianceGeneratedData = async (allianceName) => {
    return new Promise(
        (resolve) => {
            console.log("- - - - -");
            console.log("processAllianceGeneratedData __ allianceName: ", allianceName);

            readAllianceGeneratedData(allianceName)
                .then(
                    (allianceGeneratedData) => {
                        generateSecondLevelDataForAlliance(allianceName)
                            .then(
                                async (secondLevelCombinationsToCountMap) => {

                                    // console.log("secondLevelCombinationsToCountMap: ", secondLevelCombinationsToCountMap);

                                    // Cycle #1 - go through alliance levels
                                    var levelsCount = allianceGeneratedData.levels.length;
                                    for (var levelIndex = 0; levelIndex < levelsCount; levelIndex++) {
                                        console.log("levelIndex: ", levelIndex, " | time: ", Date.now());
                                        var singleLevelData = allianceGeneratedData.levels[levelIndex];

                                        // Don't process level if its too small
                                        if (singleLevelData.count < underlordsHelperTools.CommonTools.settings.game.minHeroesForCombination) {
                                            console.log("Skip level as not enough heroes in it. levelIndex: ", levelIndex, " | singleLevelData.count: ", singleLevelData.count);
                                            continue;
                                        }

                                        // Cycle #2 - go through level combinations
                                        var levelCombinationsCount = singleLevelData.preCombinations.length;
                                        for (var levelCombinationIndex = 0; levelCombinationIndex < levelCombinationsCount; levelCombinationIndex++) {
                                            console.log("First Level Combination __ levelIndex: ", levelIndex, " | levelCombinationIndex: ", levelCombinationIndex);

                                            var firstLevelCombination = singleLevelData.preCombinations[levelCombinationIndex];

                                            // Cycle #3 - go through all available second-level combinations for the available positions
                                            var secondLevelCombinationElementsCount = underlordsHelperTools.CommonTools.settings.game.maxPlayerHeroes - singleLevelData.count;
                                            var secondLevelCombinations = secondLevelCombinationsToCountMap[secondLevelCombinationElementsCount];
                                            if (!secondLevelCombinations) {
                                                console.log("ERROR! Can't find combinations for secondLevelCombinationElementsCount: ", secondLevelCombinationElementsCount);
                                                console.log("ERROR! Can't find combinations for secondLevelCombinationsToCountMap: ", secondLevelCombinationsToCountMap);
                                            }
                                            var secondLevelCombinationsCount = secondLevelCombinations.length;
                                            /*console.log("secondLevelCombinations: ", secondLevelCombinations);
                                            console.log("secondLevelCombinations[0]: ", secondLevelCombinations[0]);
                                            console.log("allianceGeneratedData.secondLevel.heroes: ", allianceGeneratedData.secondLevel.heroes);*/
                                            for (var secondLevelCombinationIndex = 0; secondLevelCombinationIndex < secondLevelCombinationsCount; secondLevelCombinationIndex++) {
                                                if (secondLevelCombinationIndex % 10000 === 0) {
                                                    console.log("Second Level Combination __ firstLevelIndex: ", levelIndex, " of ", levelsCount, " | levelCombinationIndex: ", levelCombinationIndex, " of ", levelCombinationsCount, " | secondLevelCombinationIndex: ", secondLevelCombinationIndex, " of ", secondLevelCombinationsCount);
                                                }
                                                var secondLevelCombinationHeroNames = secondLevelCombinations[secondLevelCombinationIndex];
                                                // console.log("secondLevelCombinationHeroNames: ", secondLevelCombinationHeroNames);

                                                var wholeCombinationNames = firstLevelCombination.concat();
                                                wholeCombinationNames.push(...secondLevelCombinationHeroNames);
                                                // Make sure hero ids are sorted
                                                wholeCombinationNames.sort();

                                                // console.log("firstLevelCombination: ", firstLevelCombination);
                                                // console.log("secondLevelCombinationHeroNames: ", secondLevelCombinationHeroNames);

                                                await processSingleCombination(wholeCombinationNames);
                                            }
                                        }
                                    }

                                    // Write all hashed hero generated data items
                                    await writeAllHashedHeroGeneratedDataItems();

                                    resolve();
                                }
                            );
                    }
                );
        }
    );
};

var processSingleCombination = (heroNames) => {
    return new Promise(
        async (resolve) => {
            /*var startTime = Date.now();
            console.log("processSingleCombination __ time: ", startTime);*/

            heroNames.sort();

            var singleCombinationData = {
                hash: underlordsHelperTools.CommonTools.generateHashForItems(heroNames),
                heroes: heroNames.concat(),
                alliancesMap: {
                    /*a: {
                        name:
                        count: ,
                        level:
                    }*/
                },
                alliancesWithLevelsNames: [],

                alliancesTotalScore: 0,
                allianceMaxLevel: 0,

                tierTotalValue: 0,
                // smaller - earlier
                tierValues: []
            };

            // Heroes
            var heroesCount = singleCombinationData.heroes.length;
            for (var heroIndex = 0; heroIndex < heroesCount; heroIndex++) {
                var heroId = singleCombinationData.heroes[heroIndex];
                // console.log("heroId: ", heroId);
                // console.log("singleCombinationData.heroes: ", singleCombinationData.heroes);
                var heroData = underlordsHelperTools.CommonTools.getHeroDataByName(heroId);

                singleCombinationData.tierValues.push(heroData.tier);
                singleCombinationData.tierTotalValue += heroData.tier;
            }
            //
            singleCombinationData.tierValues.sort();

            // Alliances Base Data
            var heroesCount = singleCombinationData.heroes.length;
            for (var heroIndex = 0; heroIndex < heroesCount; heroIndex++) {

                var singleHeroName = singleCombinationData.heroes[heroIndex];
                var singleHeroData = underlordsHelperTools.CommonTools.getHeroDataByName(singleHeroName);
                for (var allianceName of singleHeroData.alliances) {
                    if (!singleCombinationData.alliancesMap[allianceName]) {
                        singleCombinationData.alliancesMap[allianceName] = {
                            name: allianceName,
                            count: 0,
                            level: 0
                        };
                    }

                    singleCombinationData.alliancesMap[allianceName].count++;
                }
            }
            // Alliance Levels
            var allianceKeys = Object.keys(singleCombinationData.alliancesMap);
            var alliancesCount = allianceKeys.length;
            // console.log("generateBuildData __ alliancesCount: ", alliancesCount);
            for (var allianceIndex = 0; allianceIndex < alliancesCount; allianceIndex++) {
                // for (var singleAlliance of buildData.alliancesMap) {
                var allianceKey = allianceKeys[allianceIndex];
                var singleAlliance = singleCombinationData.alliancesMap[allianceKey];

                var allianceConfigData = underlordsHelperTools.CommonTools.getAllianceDataByName(singleAlliance.name);
                // console.log("generateBuildData __ allianceConfigData: ", allianceConfigData);

                var allianceLevelsCount = allianceConfigData.levels.length;
                for (var levelIndex = allianceLevelsCount - 1; levelIndex >= 0; levelIndex--) {
                    var levelConfig = allianceConfigData.levels[levelIndex];

                    // console.log("generateBuildData __ singleAlliance.count: ", singleAlliance.count, " | levelConfig.count: ", levelConfig.count);
                    if (singleAlliance.count >= levelConfig.count) {
                        singleAlliance.level = (levelIndex + 1);

                        // singleCombinationData.alliancesTotalScore += singleAlliance.level * 2;
                        //
                        // Add scores according to the amount of heroes required by level
                        singleCombinationData.alliancesTotalScore += levelConfig.count;

                        // Add additional points to bigger levels
                        // singleCombinationData.alliancesTotalScore += singleAlliance.level * 2;
                        // singleBuildData.alliancesTotalScore += Math.pow(singleAlliance.level, 2);

                        if (singleAlliance.level > singleCombinationData.allianceMaxLevel) {
                            singleCombinationData.allianceMaxLevel = singleAlliance.level;
                        }

                        break;
                    }
                }
            }

            // Process heroes in the combinations
            var heroesCount = heroNames.length;
            for (var heroIndex = 0; heroIndex < heroesCount; heroIndex++) {
                var singleHeroName = heroNames[heroIndex];
                var singleHeroGeneratedData = await underlordsHelperTools.ReadTools.readHeroGeneratedData(singleHeroName);

                var isNeedToAddCombination = false;
                var isNeedToRemoveWeakest = false;

                if (!singleHeroGeneratedData.combinationHashes[singleCombinationData.hash]) {
                    if (singleHeroGeneratedData.combinations.length < underlordsHelperTools.CommonTools.settings.game.maxSingleHeroCombinations) {
                        isNeedToAddCombination = true;

                    } else {
                        var weakestCombination = singleHeroGeneratedData.combinations[
                        singleHeroGeneratedData.combinations.length - 1
                            ];

                        var compareResult = underlordsHelperTools.CompareTools.compareCombinations(singleCombinationData, weakestCombination);
                        // If the current combination is better than the weakest one
                        if (compareResult < 0) {
                            isNeedToAddCombination = true;
                            isNeedToRemoveWeakest = true;
                        }
                    }

                    if (isNeedToAddCombination) {
                        singleHeroGeneratedData.combinationHashes[singleCombinationData.hash] = true;

                        if (isNeedToRemoveWeakest) {
                            // Remove the weakest combination
                            var weakestCombinations = singleHeroGeneratedData.combinations.pop();
                            var weakestHash = underlordsHelperTools.CommonTools.generateHashForItems(weakestCombinations.heroes);
                            delete singleHeroGeneratedData.combinationHashes[weakestHash];
                        }

                        // Add the current combination
                        singleHeroGeneratedData.combinations.push(singleCombinationData);
                        // Sort the combinations list, to make sure the strongest ones are earlier
                        singleHeroGeneratedData.combinations.sort(underlordsHelperTools.CompareTools.compareCombinations);

                        // await writeHeroGeneratedData(singleHeroName, singleHeroGeneratedData);
                    }
                }
            }

            /*var endTime = Date.now();
            console.log("processSingleCombination __ time: ", endTime, " | duration: ", (endTime - startTime));*/

            resolve();
        }
    );
};

var generateSecondLevelDataForAlliance = (allianceName) => {
    return new Promise(
        (resolve) => {
            readAllianceGeneratedData(allianceName)
                .then(
                    (allianceGeneratedData) => {

                        var secondLevelStartTime = Date.now();
                        console.log("generateSecondLevelDataForAlliance __ second level generation start __ time: ", secondLevelStartTime);
                        var secondLevelCombinations = {};
                        //
                        var levelsCount = allianceGeneratedData.levels.length;
                        for (var levelIndex = 0; levelIndex < levelsCount; levelIndex++) {

                            var singleLevelData = allianceGeneratedData.levels[levelIndex];
                            if (singleLevelData.count < underlordsHelperTools.CommonTools.settings.game.minHeroesForCombination) {
                                console.log("Skip level as not enough heroes in it. levelIndex: ", levelIndex, " | singleLevelData.count: ", singleLevelData.count);
                                continue;
                            }

                            // Second-level filling combinations
                            var secondLevelCombinationElementsCount = underlordsHelperTools.CommonTools.settings.game.maxPlayerHeroes - singleLevelData.count;
                            if (!secondLevelCombinations[secondLevelCombinationElementsCount]) {
                                secondLevelCombinations[secondLevelCombinationElementsCount] = [];
                            }

                            if (allianceGeneratedData.secondLevel.heroes.length >= secondLevelCombinationElementsCount) {
                                console.log("generateSecondLevelDataForAlliance __ before second level combinations generation __ allianceGeneratedData.allianceHeroes.length: ", allianceGeneratedData.allianceHeroes.length, " | secondLevelCombinationElementsCount: ", secondLevelCombinationElementsCount, " | time: ", Date.now());
                                var secondLevelCombinationsIndexValues = flashistTools.CombinationTools.generateAllAvailableUniqueCombinationElements(
                                    allianceGeneratedData.secondLevel.heroes.length,
                                    secondLevelCombinationElementsCount
                                );
                                console.log("generateSecondLevelDataForAlliance __ after second level combinations generation __ combinations count: ", secondLevelCombinationsIndexValues.length, " | time: ", Date.now());

                                var secondLevelCombinationsCount = secondLevelCombinationsIndexValues.length;
                                for (var secondLevelCombinationIndex = 0; secondLevelCombinationIndex < secondLevelCombinationsCount; secondLevelCombinationIndex++) {
                                    if (secondLevelCombinationIndex % 100000 === 0) {
                                        console.log("generateSecondLevelDataForAlliance __ secondLevelCombinationIndex: ", secondLevelCombinationIndex, " | time: ", Date.now());
                                    }

                                    var singleSecondLevelCombinationIndexValues = secondLevelCombinationsIndexValues[secondLevelCombinationIndex];
                                    var singleSecondLevelCombinationHeroNames = getElementValuesByIndices(
                                        singleSecondLevelCombinationIndexValues,
                                        allianceGeneratedData.secondLevel.heroes
                                    );

                                    singleSecondLevelCombinationHeroNames.sort();
                                    secondLevelCombinations[secondLevelCombinationElementsCount].push(singleSecondLevelCombinationHeroNames.concat());
                                }
                            }

                        }

                        var secondLevelEndTime = Date.now();
                        console.log("generateSecondLevelDataForAlliance __ second level generation end __ endTime: ", secondLevelEndTime, " | duration: ", (secondLevelEndTime - secondLevelStartTime));
                        // console.log("generateSecondLevelDataForAlliance __ secondLevelCombinations: ", secondLevelCombinations);

                        resolve(secondLevelCombinations);
                    }
                );
        }
    );
};

var getElementValuesByIndices = (itemIndices, availableItems) => {
    var result = [];

    var indicesCount = itemIndices.length;
    for (var valueIndex = 0; valueIndex < indicesCount; valueIndex++) {
        var singleValueIndex = itemIndices[valueIndex];
        var singleItem = availableItems[singleValueIndex];
        result.push(singleItem);
    }

    return result;
};

// - - - - -
// Tasks
// - - - - -

gulp.task(
    "async-await-test",
    async () => {
        console.log("test start");

        for (var index = 0; index < 10; index++) {
            console.log("index: ", index, " start");
            var testRestult = await testPromise();

            console.log("index: ", index, " end", " | testRestult: ", testRestult);
        }

        console.log("test end");
        // cb();
    }
);
var testPromise = () => {
    return new Promise(
        (resolve) => {
            setTimeout(
                () => {
                    resolve(Date.now());
                },
                1000
            );
        }
    );
};

gulp.task(
    "init",
    (cb) => {
        createBuildHashesMap = {};

        // settings = JSON.parse(fs.readFileSync('./dist/settings.json'));
        underlordsHelperTools.CommonTools.settings = JSON.parse(fs.readFileSync('./dist/settings.json'));
        // Sort Heroes
        underlordsHelperTools.CommonTools.settings.heroes.sort(
            (hero1, hero2) => {
                var sortResult = 0;
                if (hero1.name < hero2.name) {
                    sortResult = -1;
                } else if (hero1.name > hero2.name) {
                    sortResult = 1;
                }

                return sortResult;
            }
        );
        // Sort Alliances
        underlordsHelperTools.CommonTools.settings.alliances.sort(
            (alliance1, alliance2) => {
                var sortResult = 0;
                if (alliance1.name < alliance2.name) {
                    sortResult = -1;
                } else if (alliance1.name > alliance2.name) {
                    sortResult = 1;
                }

                return sortResult;
            }
        );

        //
        cb();
    }
);

gulp.task(
    "prepare-all-alliances-data",
    ["init"],
    (cb) => {
        prepareAllAllianceData()
            .then(
                () => {
                    cb();
                }
            );
    }
);

gulp.task(
    "process-alliance-generated-data",
    ["init"],
    (cb) => {
        console.log("process-alliance-generated-data __ argv.allianceName: ", argv.allianceName);
        processAllianceGeneratedData(argv.allianceName)
            .then(
                () => {
                    cb();
                }
            );
    }
);

gulp.task(
    "process-all-alliance-generated-data",
    ["init"],
    async () => {
        console.log("process-all-alliance-generated-data");
        /*processAllianceGeneratedData(argv.allianceName)
            .then(
                () => {
                    cb();
                }
            );*/

        var allianceNames = underlordsHelperTools.CommonTools.getAllAllianceNames();
        var alliancesCount = allianceNames.length;

        var startFromIndex = 0;
        if (argv.startFromAllianceIndex) {
            startFromIndex = argv.startFromAllianceIndex;
        }

        for (var allianceIndex = startFromIndex; allianceIndex < alliancesCount; allianceIndex++) {
            var singleAllianceName = allianceNames[allianceIndex];
            console.log("- - - - -");
            var startTime = Date.now();
            console.log("process-all-alliance-generated-data __ singleAllianceName: ", singleAllianceName, " allianceIndex: ", allianceIndex, " | time: ", startTime);
            await processAllianceGeneratedData(singleAllianceName);
            var endTime = Date.now();
            console.log("process-all-alliance-generated-data __ FINISH __ singleAllianceName: ", singleAllianceName, " | time: ", endTime, " | duration: ", (endTime - startTime));
        }

    }
);
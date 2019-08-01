var isWeb = false;
// Test data for gulp-js
try {
    !!require
} catch (error) {
    isWeb = true;
}
try {
    !!document;
} catch (error) {
    isWeb = false;
    document = {};
}
// Test data for web-js
try {
    !!module;
} catch (error) {
    module = {};
}

var underlordsHelperTools = {};
module.exports = underlordsHelperTools;
document.underlordsHelperTools = underlordsHelperTools;

// - - - - -
// Path Tools
var generatedDataFolderPath = "./dist/generated-data/";
if (isWeb) {
    generatedDataFolderPath = "./generated-data/"
}
var generatedDataHeroesBasePath = generatedDataFolderPath + 'heroes/';
var generatedDataHeroesTestBasePath = generatedDataFolderPath + 'heroes_test/';
var generatedDataAlliancesBasePath = generatedDataFolderPath + 'alliances/';
var resultFileName = 'result.json';
//
var CommonTools = {
    // settings.json file
    settings: null,

    generateHashForItems: (items) => {
        items.sort();
        return items.join(" ");
    },

    getHeroesDataByTier: (minTier, maxTier) => {
        var result = [];

        for (var hero of CommonTools.settings.heroes) {
            if (minTier <= hero.tier && hero.tier <= maxTier) {
                result.push(hero);
            }
        }

        return result;
    },

    getHeroDataByName: (name) => {
        var result;

        for (var hero of CommonTools.settings.heroes) {
            if (hero.name == name) {
                result = hero;
                break;
            }
        }

        return result;
    },

    getHeroesByAlliance: (allianceName) => {
        var result = [];

        var heroesCount = CommonTools.settings.heroes.length;
        for (var heroIndex = 0; heroIndex < heroesCount; heroIndex++) {
            var singleHeroData = CommonTools.settings.heroes[heroIndex];
            // console.log("getHeroesForAlliance __ allianceName: ", allianceName, " | singleHeroData.alliances: ", singleHeroData.alliances);
            if (singleHeroData.alliances.indexOf(allianceName) !== -1) {
                result.push(singleHeroData);
            }
        }

        return result;
    },

    getHeroNamesForAlliance: (allianceName) => {
        var result = [];

        var allianceHerosDataList = CommonTools.getHeroesByAlliance(allianceName);
        // console.log("getHeroNamesForAlliance __ allianceName: ", allianceName, " | allianceHerosDataList: ", allianceHerosDataList);
        var heroesCount = allianceHerosDataList.length;
        for (var heroIndex = 0; heroIndex < heroesCount; heroIndex++) {
            var singleHeroData = allianceHerosDataList[heroIndex];

            result.push(singleHeroData.name);
        }

        // Sort alphabetically
        result.sort();

        return result;
    },

    getAllianceDataByName: (name) => {
        var result;

        for (var alliance of CommonTools.settings.alliances) {
            if (alliance.name == name) {
                result = alliance;
                break;
            }
        }

        return result;
    },

    getAllHeroNames: () => {
        var result = [];

        var heroesCount = CommonTools.settings.heroes.length;
        for (var heroIndex = 0; heroIndex < heroesCount; heroIndex++) {
            var singleHeroData = CommonTools.settings.heroes[heroIndex];
            result.push(singleHeroData.name);
        }

        return result;
    },

    getAllAllianceNames: () => {
        var result = [];

        var alliancesCount = CommonTools.settings.alliances.length;
        for (var allianceIndex = 0; allianceIndex < alliancesCount; allianceIndex++) {
            var singleAllianceData = CommonTools.settings.alliances[allianceIndex];
            result.push(singleAllianceData.name);
        }

        return result;
    }
};
underlordsHelperTools.CommonTools = CommonTools;

var PathTools = {

    // TEST
    getHeroTestGeneratedDataPath: (heroName) => {
        var filePath = PathTools.getHeroTestGeneratedFolderPath(heroName) + "/" + resultFileName;
        return filePath;
    },
    getHeroTestGeneratedFolderPath: (heroName) => {
        return `${generatedDataHeroesTestBasePath}${heroName}`;
    },

    // - - - - -
    getHeroGeneratedDataPath: (heroName) => {
        var filePath = PathTools.getHeroGeneratedFolderPath(heroName) + "/" + resultFileName;
        return filePath;
    },

    getHeroGeneratedFolderPath: (heroName) => {
        return `${generatedDataHeroesBasePath}${heroName}`;
    },

    getAllianceGeneratedDataPath: (allianceName) => {
        var filePath = PathTools.getAllianceGeneratedFolderPath(allianceName) + "/" + resultFileName;
        return filePath;
    },

    getAllianceGeneratedFolderPath: (alliancename) => {
        return `${generatedDataAlliancesBasePath}${alliancename}`;
    }
};
underlordsHelperTools.PathTools = PathTools;

// - - - - -
// Read Tools
var ReadTools = {

    readFile: async (filePath) => {
        return new Promise(
            (resolve) => {

                if (isWeb) {
                    $.getJSON(
                        filePath,
                        function (data) {
                            resolve(data);
                        }
                    );

                } else {
                    try {
                        var fs = require('fs');
                        var data = JSON.parse(fs.readFileSync(filePath));
                        resolve(data);

                    } catch (error) {
                        resolve();
                    }
                }
            }
        );
    },

    hashOfReadHeroGeneratedData: {},
    readHeroGeneratedData: async (heroName, force) => {
        return new Promise(
            async (resolve) => {
                var result;

                if (!force && ReadTools.hashOfReadHeroGeneratedData[heroName]) {
                    result = ReadTools.hashOfReadHeroGeneratedData[heroName];

                } else {
                    var filePath = PathTools.getHeroGeneratedDataPath(heroName);

                    /*if (require) {
                        result = JSON.parse(fs.readFileSync(filePath));

                    } else {
                        $.getJSON(
                            filePath,
                            function (data) {
                                resolve(data);
                            }
                        );
                    }*/
                    var result = await ReadTools.readFile(filePath);
                    if (!result) {
                        result = {
                            name: heroName,
                            combinations: [],
                            combinationHashes: {}
                        };
                    }
                    resolve(result);
                }

                ReadTools.hashOfReadHeroGeneratedData[heroName] = result;

                resolve(result);
            }
        );
    },

    getAllHashedHeroNames: () => {
        return Object.keys(ReadTools.hashOfReadHeroGeneratedData);
    }
};
underlordsHelperTools.ReadTools = ReadTools;

// - - - - -
// Compare Tools
var CompareTools = {

    compareCombinations: (combination1, combination2) => {
        var result = 0;

        /*alliancesTotalScore: 0,
        allianceMaxLevel: 0,

        tierTotalValue: 0,
        // smaller - earlier
        tierValues: []*/
        if (combination1.alliancesTotalScore > combination2.alliancesTotalScore) {
            result = -1;
        } else if (combination1.alliancesTotalScore < combination2.alliancesTotalScore) {
            result = 1;

        } else {

            if (combination1.allianceMaxLevel > combination2.allianceMaxLevel) {
                result = -1;
            } else if (combination1.allianceMaxLevel < combination2.allianceMaxLevel) {
                result = 1;

            } else {

                // The lower the total tier value, the easier it would be to form it
                if (combination1.tierTotalValue < combination2.tierTotalValue) {
                    result = -1;
                } else if (combination1.tierTotalValue > combination2.tierTotalValue) {
                    result = 1;

                } else {

                    var maxTierValue1 = combination1.tierValues[combination1.tierValues.length - 1];
                    var maxTierValue2 = combination2.tierValues[combination1.tierValues.length - 1];
                    // The lower the max tier value is, the easier it's to form the build
                    if (maxTierValue1 < maxTierValue2) {
                        result = -1;

                    } else if (maxTierValue1 > maxTierValue2) {
                        result = 1;

                    }
                }
            }
        }

        return result;
    },

    compareHeroes: (heroName1, heroName2) => {
        var result = 0;

        var heroConfig1 = CommonTools.getHeroDataByName(heroName1);
        var heroConfig2 = CommonTools.getHeroDataByName(heroName2);
        if (heroConfig1.tier < heroConfig2.tier) {
            result = -1;
        } else if (heroConfig1.tier > heroConfig2.tier) {
            result = 1;

        } else {
            if (heroName1 < heroName2) {
                result = -1;
            } else if (heroName1 > heroName2) {
                result = 1;
            }
        }

        return result;
    }

};
underlordsHelperTools.CompareTools = CompareTools;


const fetch = require('node-fetch');

async function loadData() {
    const incomeRes = await fetch('us_demographics_income.json');
    const incomeData = await incomeRes.json();
    const heightRes = await fetch('us_demographics_height.json');
    const heightData = await heightRes.json();

    // Compute height distributions from height JSON
    const maleShort = (heightData.height_distribution.male.under_5_0.count_per_10k + heightData.height_distribution.male['5_0_to_5_3'].count_per_10k) / 10000;
    const femaleShort = (heightData.height_distribution.female.under_5_0.count_per_10k + heightData.height_distribution.female['5_0_to_5_3'].count_per_10k) / 10000;
    const maleAverage = (heightData.height_distribution.male['5_4_to_5_7'].count_per_10k + heightData.height_distribution.male['5_8_to_5_11'].count_per_10k) / 10000;
    const femaleAverage = (heightData.height_distribution.female['5_4_to_5_7'].count_per_10k + heightData.height_distribution.female['5_8_to_5_11'].count_per_10k) / 10000;
    const maleTall = (heightData.height_distribution.male['6_0_to_6_3'].count_per_10k + heightData.height_distribution.male.over_6_3.count_per_10k) / 10000;
    const femaleTall = (heightData.height_distribution.female['6_0_to_6_3'].count_per_10k + heightData.height_distribution.female.over_6_3.count_per_10k) / 10000;

    return {
        states: incomeData.states,
        distributions: {
            height: {
                male: { short: maleShort, average: maleAverage, tall: maleTall },
                female: { short: femaleShort, average: femaleAverage, tall: femaleTall }
            },
            weight: { normal: 0.7, overweight: 0.3 },
            marital: { married: 0.5, single: 0.5 },
            kids: { yes: 0.4, no: 0.6 }
        }
    };
}

function getAgeMid(bracket) {
    const ranges = {
        '18_24': 21.5, '25_34': 30.5, '35_44': 40.5,
        '45_54': 50.5, '55_64': 60.5, '65_plus': 72
    };
    return ranges[bracket] || 50;
}

function calculate(data, sex, ageMin, ageMax, salaryMin, salaryMax, heightMin, heightMax, weight, married, hasKids) {
    let heightCat = 'average';
    if (heightMax < 170) heightCat = 'short';
    else if (heightMin > 180) heightCat = 'tall';

    let matches = 0;
    let totalOfSex = 0;

    for (let state of data.states) {
        const sexCount = state.sex[sex];
        totalOfSex += sexCount;

        if (state.median_income < salaryMin || state.median_income > salaryMax) continue;

        const totalPop = state.population;
        for (let [ageGroup, count] of Object.entries(state.age_distribution)) {
            const ageMid = getAgeMid(ageGroup);
            if (ageMid >= ageMin && ageMid <= ageMax) {
                let sexInGroup = (count / totalPop) * sexCount;
                sexInGroup *= data.distributions.height[sex][heightCat];
                sexInGroup *= data.distributions.weight[weight];
                sexInGroup *= data.distributions.marital[married];
                sexInGroup *= data.distributions.kids[hasKids];
                matches += sexInGroup;
            }
        }
    }

    const percent = totalOfSex > 0 ? ((matches / totalOfSex) * 100).toFixed(2) : 0;
    return { percent, matches: Math.round(matches), total: totalOfSex };
}

async function runTest() {
    const data = await loadData();
    // Test case 1: Default values
    const result1 = calculate(data, 'male', 28, 35, 50000, 100000, 172, 180, 'normal', 'single', 'no');
    console.log('Test 1 (male, age 28-35, salary 50k-100k, height 172-180, normal, single, no kids):', result1);

    // Test case 2: Change salary to low
    const result2 = calculate(data, 'male', 28, 35, 30000, 40000, 172, 180, 'normal', 'single', 'no');
    console.log('Test 2 (salary 30k-40k):', result2);

    // Test case 3: Change height to short
    const result3 = calculate(data, 'male', 28, 35, 50000, 100000, 150, 165, 'normal', 'single', 'no');
    console.log('Test 3 (height 150-165):', result3);

    // Test case 4: Female
    const result4 = calculate(data, 'female', 28, 35, 50000, 100000, 172, 180, 'normal', 'single', 'no');
    console.log('Test 4 (female):', result4);
}

runTest().catch(console.error);

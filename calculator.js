let data = null;
let lang = 'ru';

const i18n = {
    ru: {
        title: 'Meet Reality',
        tagline: 'Узнайте, какой процент населения США соответствует вашим параметрам',
        selectYourStandards: 'Выберите свои параметры',
        sex: 'Пол',
        male: 'Мужчина',
        female: 'Женщина',
        age: 'Возраст',
        salary: 'Зарплата',
        height: 'Рост (см)',
        weight: 'Вес',
        normal: 'Нормальный',
        overweight: 'Избыточный вес',
        additional: 'Дополнительно',
        married: 'Женат/Замужем',
        hasKids: 'Есть дети',
        letsFindOut: 'Рассчитать',
        reset: 'Сброс',
        matchPercentage: 'Процент совпадений',
        matching: 'Совпадающие записи:',
        of: 'из',
        adPlaceholder: 'Место для объявлений',
        footerText: '© 2026 Meet Reality. Данные переписи США в целях демонстрации.',
        currencyPrefix: '$',
        heightUnit: 'см'
    },
    en: {
        title: 'Meet Reality',
        tagline: 'Discover what percentage of the US population matches your demographics',
        selectYourStandards: 'Check Your Standards',
        sex: 'Sex',
        male: 'Male',
        female: 'Female',
        age: 'Age Range',
        salary: 'Salary',
        height: 'Height (cm)',
        weight: 'Weight',
        normal: 'Normal',
        overweight: 'Overweight',
        additional: 'Additional',
        married: 'Married',
        hasKids: 'Has Kids',
        letsFindOut: 'Find Out',
        reset: 'Reset',
        matchPercentage: 'Match Percentage',
        matching: 'Matching records:',
        of: 'out of',
        adPlaceholder: 'Ad Space',
        footerText: '© 2026 Meet Reality. US Census demographic data for demonstration purposes.',
        currencyPrefix: '$',
        heightUnit: 'cm'
    }
};

function t(key) {
    return i18n[lang][key] || key;
}

function setLanguage(newLang) {
    lang = newLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.getElementById('sexLabel').textContent = document.getElementById('sexSwitch').classList.contains('active') ? t('female') : t('male');
    document.getElementById('weightLabel').textContent = document.getElementById('weightSwitch').classList.contains('active') ? t('overweight') : t('normal');
    updateAgeSlider();
    updateSalarySlider();
    updateHeightSlider();
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
}

async function loadData() {
    try {
        const incomeRes = await fetch('us_demographics_income.json');
        const incomeData = await incomeRes.json();
        const heightRes = await fetch('us_demographics_height.json');
        const heightData = await heightRes.json();

        data = {
            states: incomeData.states,
            heightData: heightData.height_distribution,
            distributions: {
                weight: { normal: 0.3, overweight: 0.7 },
                marital: { married: 0.5, single: 0.5 },
                kids: { yes: 0.6, no: 0.4 }
            }
        };
    } catch (e) {
        showError('Could not load data');
    }
}

function toggleSex() {
    document.getElementById('sexSwitch').classList.toggle('active');
    document.getElementById('sexLabel').textContent = document.getElementById('sexSwitch').classList.contains('active') ? t('female') : t('male');
}

function toggleWeight() {
    document.getElementById('weightSwitch').classList.toggle('active');
    document.getElementById('weightLabel').textContent = document.getElementById('weightSwitch').classList.contains('active') ? t('overweight') : t('normal');
}

function toggleMarried() {
    document.getElementById('marriedSwitch').classList.toggle('active');
}

function toggleHasKids() {
    document.getElementById('hasKidsSwitch').classList.toggle('active');
}

function updateSliderFill(minId, maxId, fillId, min, max) {
    const minVal = parseInt(document.getElementById(minId).value);
    const maxVal = parseInt(document.getElementById(maxId).value);
    if (minVal > maxVal) {
        [document.getElementById(minId).value, document.getElementById(maxId).value] = [maxVal, minVal];
        return;
    }
    const percent1 = ((minVal - min) / (max - min)) * 100;
    const percent2 = ((maxVal - min) / (max - min)) * 100;
    document.getElementById(fillId).style.left = percent1 + '%';
    document.getElementById(fillId).style.right = (100 - percent2) + '%';
}

function updateAgeSlider() {
    updateSliderFill('ageMin', 'ageMax', 'ageFill', 18, 65);
    const min = parseInt(document.getElementById('ageMin').value);
    const max = parseInt(document.getElementById('ageMax').value);
    const maxLimit = parseInt(document.getElementById('ageMax').max);
    document.getElementById('ageValue').textContent = min + ' - ' + max + (max >= maxLimit ? '+' : '');
}

function updateSalarySlider() {
    updateSliderFill('salaryMin', 'salaryMax', 'salaryFill', 30000, 500000);
    const min = parseInt(document.getElementById('salaryMin').value);
    const max = parseInt(document.getElementById('salaryMax').value);
    const maxLimit = parseInt(document.getElementById('salaryMax').max);
    const prefix = t('currencyPrefix');
    document.getElementById('salaryValue').textContent = prefix + min.toLocaleString() + ' - ' + prefix + max.toLocaleString() + (max >= maxLimit ? '+' : '');
}

function updateHeightSlider() {
    updateSliderFill('heightMin', 'heightMax', 'heightFill', 150, 191);
    const min = parseInt(document.getElementById('heightMin').value);
    const max = parseInt(document.getElementById('heightMax').value);
    const maxLimit = parseInt(document.getElementById('heightMax').max);
    const unit = t('heightUnit');
    document.getElementById('heightValue').textContent = min + ' ' + unit + ' - ' + max + ' ' + unit + (max >= maxLimit ? '+' : '');
}

function calculate() {
    if (!data) return showError('Data not loaded');
    const sex = document.getElementById('sexSwitch').classList.contains('active') ? 'female' : 'male';
    const ageMin = parseInt(document.getElementById('ageMin').value);
    let ageMax = parseInt(document.getElementById('ageMax').value);
    const salaryMin = parseInt(document.getElementById('salaryMin').value);
    let salaryMax = parseInt(document.getElementById('salaryMax').value);
    const heightMin = parseInt(document.getElementById('heightMin').value);
    let heightMax = parseInt(document.getElementById('heightMax').value);
    const weight = document.getElementById('weightSwitch').classList.contains('active') ? 'overweight' : 'normal';
    const married = document.getElementById('marriedSwitch').classList.contains('active') ? 'married' : 'single';
    const hasKids = document.getElementById('hasKidsSwitch').classList.contains('active') ? 'yes' : 'no';

    // Handle max+ logic
    if (ageMax >= parseInt(document.getElementById('ageMax').max)) ageMax = 100;
    if (salaryMax >= parseInt(document.getElementById('salaryMax').max)) salaryMax = 100000000;
    if (heightMax >= parseInt(document.getElementById('heightMax').max)) heightMax = 250;

    let matches = 0;
    let totalOfSex = 0;

    for (let state of data.states) {
        const sexCount = state.sex[sex];
        totalOfSex += sexCount;

        // Salary filter (using log-normal approximation on state median)
        const salaryProb = getSalaryProbability(salaryMin, salaryMax, state.median_income);
        if (salaryProb <= 0) continue;

        const totalPop = state.population;
        for (let [ageGroup, count] of Object.entries(state.age_distribution)) {
            const [groupMin, groupMax] = getAgeRange(ageGroup);
            const ageOverlap = getOverlap(ageMin, ageMax, groupMin, groupMax);
            
            if (ageOverlap > 0) {
                const ageFraction = ageOverlap / (groupMax - groupMin + 1);
                let groupMatches = (count / totalPop) * sexCount * ageFraction;
                
                // Apply probabilities
                groupMatches *= salaryProb;
                groupMatches *= getHeightProbability(sex, heightMin, heightMax);
                groupMatches *= data.distributions.weight[weight];
                groupMatches *= data.distributions.marital[married];
                groupMatches *= data.distributions.kids[hasKids];
                
                matches += groupMatches;
            }
        }
    }

    const percent = totalOfSex > 0 ? ((matches / totalOfSex) * 100).toFixed(4) : 0;
    const sexLabel = sex === 'male' ? t('male') : t('female');
    
    document.getElementById('percentage').textContent = parseFloat(percent).toFixed(2);
    document.getElementById('matchCount').textContent = Math.round(matches).toLocaleString();
    document.getElementById('totalCount').textContent = totalOfSex.toLocaleString();
    document.getElementById('resultsDetail').textContent = lang === 'ru'
        ? `Из всех ${sexLabel.toLowerCase()} в США, ${parseFloat(percent).toFixed(2)}% соответствуют вашим критериям.`
        : `Out of all ${sexLabel.toLowerCase()} in the US, ${parseFloat(percent).toFixed(2)}% match your criteria.`;
    document.getElementById('results').classList.add('show');
    document.getElementById('error').classList.remove('show');
}

function getAgeRange(bracket) {
    const ranges = {
        '18_24': [18, 24], '25_34': [25, 34], '35_44': [35, 44],
        '45_54': [45, 54], '55_64': [55, 64], '65_plus': [65, 85]
    };
    return ranges[bracket] || [0, 0];
}

function getOverlap(minUser, maxUser, minData, maxData) {
    const start = Math.max(minUser, minData);
    const end = Math.min(maxUser, maxData);
    return Math.max(0, end - start + 1);
}

// Log-Normal Cumulative Distribution Function
function logNormalCDF(x, median, sigma) {
    if (x <= 0) return 0;
    const mu = Math.log(median);
    return 0.5 * (1 + erf((Math.log(x) - mu) / (sigma * Math.sqrt(2))));
}

// Error Function Approximation
function erf(x) {
    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}

function getSalaryProbability(min, max, median) {
    const sigma = 0.75; // Approx income inequality parameter
    return Math.max(0, logNormalCDF(max, median, sigma) - logNormalCDF(min, median, sigma));
}

function getHeightProbability(sex, minCm, maxCm) {
    const buckets = {
        'under_5_0': [0, 152],
        '5_0_to_5_3': [152, 160],
        '5_4_to_5_7': [160, 170],
        '5_8_to_5_11': [170, 180],
        '6_0_to_6_3': [180, 191],
        'over_6_3': [191, 250]
    };
    
    let totalProb = 0;
    const dist = data.heightData[sex];
    
    for (let [key, range] of Object.entries(buckets)) {
        const [bMin, bMax] = range;
        const overlap = Math.max(0, Math.min(maxCm, bMax) - Math.max(minCm, bMin));
        if (overlap > 0) {
            const bucketSpan = bMax - bMin;
            const bucketProb = dist[key].count_per_10k / 10000;
            totalProb += bucketProb * (overlap / bucketSpan);
        }
    }
    return totalProb;
}

function reset() {
    document.getElementById('ageMin').value = '28';
    document.getElementById('ageMax').value = '35';
    document.getElementById('salaryMin').value = '50000';
    document.getElementById('salaryMax').value = '100000';
    document.getElementById('heightMin').value = '172';
    document.getElementById('heightMax').value = '180';
    document.getElementById('sexSwitch').classList.remove('active');
    document.getElementById('weightSwitch').classList.remove('active');
    document.getElementById('marriedSwitch').classList.remove('active');
    document.getElementById('hasKidsSwitch').classList.remove('active');
    document.getElementById('sexLabel').textContent = t('male');
    document.getElementById('weightLabel').textContent = t('normal');
    updateAgeSlider();
    updateSalarySlider();
    updateHeightSlider();
    document.getElementById('results').classList.remove('show');
}

function showError(msg) {
    document.getElementById('error').textContent = msg;
    document.getElementById('error').classList.add('show');
}

window.addEventListener('DOMContentLoaded', () => {
    loadData();
    setLanguage('ru');
});
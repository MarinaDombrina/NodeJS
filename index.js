// Чтение файла

const fs = require('fs');
const path = require('path');
const inputFileName = process.argv[2];
const outputDirName = './output';

if (!inputFileName) {
    console.log('Введите название файла в аргументе скрипта!');
    process.exit(1);
}

if (!fs.existsSync(inputFileName)) {
    console.log('Переданного файла не существует!');
    process.exit(1);
}

if (fs.existsSync(outputDirName)) console.log('Директория уже существует!')

else fs.mkdir(outputDirName, function (err) {

    if (err) console.log(err)

    else console.log('Директория создана.')

})

const inputFile = fs.readFileSync(inputFileName).toString();
const rows = inputFile.split('\n');
const rowsData = [];

for (let i = 0; i < rows.length; i++) {
    const rowData = rows[i].replaceAll('"', '').split(';');

    rowData.splice(3, 1);
    rowsData.push(rowData);
}

const header = rowsData[0].join(';');
rowsData.shift();

// Функция записи в CSV файл

const writeToCSV = (header, filteredData, fileName) => {
    const csvFileArray = [];

    csvFileArray.push(header);

    for (let i = 0; i < filteredData.length; i++) {
        csvFileArray.push(filteredData[i].join(';'));
    }

    try {
        fs.writeFileSync(path.join(outputDirName, fileName), csvFileArray.join('\n'));
    } catch (err) {
        console.error(err);
    }
}

// Задание 1

const billionaires = [];

rowsData.forEach(row => {

    if (row[9] >= 1000) {
        billionaires.push(row);
    }

})

writeToCSV(header, billionaires, 'over_1billion.csv');


// Задание 2

const filteredByYears = {
    '2000s': [],
    '2005s': [],
    '2010s': [],
    '2015s': [],
    '2020s': []
}
const byYearsResult = [];
const byYearsHeader = 'Период;Количество фильмов;Средний балл фильмов';

rowsData.forEach(row => {

    if (row[5] >= 2000 && row[5] < 2005) {
        filteredByYears['2000s'].push(row);
    }

    if (row[5] >= 2005 && row[5] < 2010) {
        filteredByYears['2005s'].push(row);
    }

    if (row[5] >= 2010 && row[5] < 2015) {
        filteredByYears['2010s'].push(row);
    }

    if (row[5] >= 2015 && row[5] < 2020) {
        filteredByYears['2015s'].push(row);
    }

    if (row[5] >= 2020 && row[5] < 2025) {
        filteredByYears['2020s'].push(row);
    }

})

const addDataByYears = (movies, period) => {
    const length = movies.length;
    let rating = 0;

    if (length > 0) {

        movies.forEach(movie => {
            rating += +movie[7];
        })

        rating /= length;
        rating = rating.toFixed(2);
    }

    else rating = 'Фильмов не найдено'

    byYearsResult.push([period, length, rating]);
}

for (let year in filteredByYears) {
    writeToCSV(header, filteredByYears[year], year + '.csv')
    addDataByYears(filteredByYears[year], year);
}

writeToCSV(byYearsHeader, byYearsResult, 'by_5_years.csv');

// Задание 3

const filteredByGenre = {};
const byGenreResult = [];
const byGenreHeader = 'Жанр;Количество фильмов;Средние кассовые сборы';

rowsData.forEach(row => {

    if (row[0] == '') return;

    const currentFilmGenres = row[2].split(',')

    currentFilmGenres.forEach(genre => {

        if (!filteredByGenre[genre]) filteredByGenre[genre] = []

        filteredByGenre[genre].push(row);
    })
})

const addDataByGenre = (movies, genre) => {
    const length = movies.length;
    let revenue = 0;

    movies.forEach(movie => {
        revenue += +movie[9];
    })

    revenue /= length;
    revenue = revenue.toFixed(2);

    byGenreResult.push([genre, length, revenue]);
}

for (let genre in filteredByGenre) {
    writeToCSV(header, filteredByGenre[genre], genre + '.csv')
    addDataByGenre(filteredByGenre[genre], genre);
}

writeToCSV(byGenreHeader, byGenreResult, 'by_genres.csv');

// Задание 4

const filteredByActors = [];
const byActorsResult = [];
const byActorsHeader = 'Актер/актриса;Средний балл фильмов;Количество фильмов';

rowsData.forEach(row => {

    if (row[7] > 7.5) {

        const currentFilmActors = row[4].split(',')

        currentFilmActors.forEach(actor => {

            actor = actor.trimStart();

            if (!filteredByActors[actor]) filteredByActors[actor] = []

            filteredByActors[actor].push(row);
        })
    }
})

const addDataByActors = (movies, actor) => {
    const length = movies.length;
    let rating = 0;

    movies.forEach(movie => {
        rating += +movie[7];
    })

    rating /= length;
    rating = rating.toFixed(2);

    byActorsResult.push([actor, rating, length]);
}

for (let actor in filteredByActors) {

    if (filteredByActors[actor].length < 2) delete filteredByActors[actor]

    else addDataByActors(filteredByActors[actor], actor)

}

writeToCSV(byActorsHeader, byActorsResult, 'top_actors.csv');

// Создание итогового файла

const resultFileName = 'result.txt';

fs.writeFile(resultFileName, rows.length.toString() + '\n', (err) => {

    if(err) throw err;

});

fs.readdir(outputDirName, (err, files) => {

    if (err) console.log(err);

    else {

        files.forEach(file => {
            let data = fs.readFileSync(path.join(outputDirName, file)).toString();
            let length = data.split('\n').length;

            fs.appendFile(resultFileName, file + ' ' + length + '\n', (err) => {

                if (err) throw err;

            });
        })
    }
})







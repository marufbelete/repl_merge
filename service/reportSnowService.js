const ExcelJS = require('exceljs');
const removalReportModel = require('../models/removalReport');

function createReport(data) {
    console.log(data)
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    data.createdAt = now;
    data.updatedAt = now;
    return new Promise((res, rej) => {
        removalReportModel
        .create(data)
        .then(report => res(report))
        .catch(err => rej('DB ERROR', err));
    });
}

function findAllReports() {
    return new Promise((res, rej) => {
        removalReportModel
        .findAll()
        .then(report => res(report))
        .catch(err => rej(report))
    });
}

function filterByYear(arr, year) {
    return arr.filter(function(obj) {
        const date = new Date(obj.date);
        const year_d = date.getFullYear();
        return year_d==year
    });
  }

function filterByMonth(arr, year, month) {
    return arr.filter(function(obj) {
        const date = new Date(obj.date);
        const year_d = date.getFullYear();
        const month_d = date.getMonth() + 1;
        return year_d==year&&month_d==month
    });
  }

async function createExcel(req, res) {
    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet("Reports");
    worksheet.columns = [
        { header: "Id", key: "id", width: 5 },
        { header: "Contractor", key: "contractor", width: 25 },
        { header: "Location", key: "location", width: 50 },
        { header: "Snow", key: "snow", width: 15 },
        { header: "Visit", key: "visit", width: 15 },
        { header: "Date", key: "date", width: 50 },
        { header: "SaltedParkingLot", key: "saltedParkingLot", width: 15 },
        { header: "SaltedSidewalks", key: "saltedSidewalks", width: 15 },
        { header: "PlowedParkingLot", key: "plowedParkingLot", width: 15 },
        { header: "ShoveledSidewalks", key: "shoveledSidewalks", width: 15 },
    ];
    const arr = await findAllReports();
    console.log(arr)
    let reports=arr
    
    if(req.query?.year){
       reports= filterByYear(arr,req.query.year)
    }
    if(req.query?.month){
        const year=String(req.query.month).split('-')[0]
        const month=String(req.query.month).split('-')[1]
        reports= filterByMonth(arr,year,month)
    }
    worksheet.addRows(reports);

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "Snow Removal-Reports.xlsx"
    );

    return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
    });
}

module.exports = {
    createReport,
    createExcel
}
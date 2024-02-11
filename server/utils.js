
const sharp = require("sharp");

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

async function resizeImage(imageData, maxSize) {
    return sharp(imageData)
        .resize({ width: maxSize, height: maxSize, fit: 'inside' })
        .toBuffer();
}

function getCurrentDate() {
    const currentDate = new Date();
    const currentDayOfMonth = currentDate.getDate();
    const currentMonth = months[currentDate.getMonth()]; // Be careful! January is 0, not 1
    const currentYear = currentDate.getFullYear();
    const currentHour = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const fullDate = currentDayOfMonth + " " + currentMonth + " " + currentYear+", "+ currentHour + ":" + currentMinutes;
    return fullDate;
};

module.exports = {
    resizeImage,
    getCurrentDate
}
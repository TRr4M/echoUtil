// ==UserScript==
// @name     Echo Util
// @version  1
// @grant    none
// @include  https://echo360.net.au/section/*
// ==/UserScript==

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

setTimeout(function() {
    console.log("[ECHO UTIL] Starting")
    const rows = document.getElementsByClassName("class-row");

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let week = 1;
    let lastDay = -1;
    let lastDate = null;
    for (const row of rows) {
        dateElem = row.querySelector(".date");
        const dateString = dateElem.innerText;
        const parsedDate = new Date(dateString);
        const day = parsedDate.getDay();
        const dayOfWeek = daysOfWeek[day];
        if (day <= lastDay && !(parsedDate.getTime() === lastDate.getTime())) {
            const divider = document.createElement("hr");
            row.parentNode.insertBefore(divider, row);
            week += 1;
        }
        lastDay = day;
        lastDate = parsedDate;
        dateElem.innerText = "Week " + week + " " + dayOfWeek + ", " + dateString;
    }
}, 300);

function downloadFileFromURL(url, fileName) {
    const downloadStatus = document.createElement('div');
    downloadStatus.innerText = "Downloading...";
    document.getElementsByClassName("info-bar")[0].appendChild(downloadStatus);
    
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            downloadStatus.remove();
        })
        .catch(error => console.error('Error downloading file:', error));
}

function tryAddDownloadButton(event) {
    if (!event.isTrusted) { return; }
    sleep(500).then(() => {
        // Find UUID
        const coverImages = document.getElementsByClassName("cover-image");
        if (!coverImages) { return; }
        const coverImage = coverImages[0];
        if (!coverImage) { return; }
        const img = coverImage.querySelector('img');
        const src = img.src;
        const parts = src.split('/');
        const uuid = parts[4];

        // Find lesson ID
        const row = coverImage.closest(".class-row");
        const id = row.getAttribute("data-test-lessonid");
        
        const url = "https://echo360.net.au/media/download/" + uuid + "/hd1.mp4?lessonId=" + id;
        
        // Check for existing download button
        if (row.querySelector(".echoUtilDownload")) { return; }

        // Construct file name
        let date = row.querySelector(".date").innerText;
        date = date.split(",")[0];
        const courseHeader = document
                        .getElementsByClassName("course-section-header")[0]
                        .querySelector("h1");
        const firstTagIdx = courseHeader.innerHTML.indexOf("<");
        const course = (firstTagIdx !== -1
                        ? courseHeader.textContent.slice(0, firstTagIdx)
                        : courseHeader.textContent)
                    .replace(/^\s+/, "")
                    .split(" ")[0]
                    .split("/")[0];
        let filename = course + "_" + date + ".mp4";
        filename = filename
            .replace(/[\r\n]+/g, "")
            .replace(/ /g, "_");
        console.log(filename);

        // Add download button
        const li = document.createElement("li");
        li.classList.add("echoUtilDownload");
        li.onclick = function(event) {
            event.stopPropagation();
            downloadFileFromURL(url, filename);
        }
        row.querySelector("ul").appendChild(li);
        const link = document.createElement("a");
        link.role = "menuitem";
        link.textContent = "Echo Util Download";
        li.appendChild(link);
    });
}

document.addEventListener('click', tryAddDownloadButton, true);

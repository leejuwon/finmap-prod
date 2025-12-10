"use strict";
exports.id = 170;
exports.ids = [170];
exports.modules = {

/***/ 5170:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "downloadPDF": () => (/* binding */ downloadPDF)
/* harmony export */ });
async function downloadPDF(targetId, filename = "compound.pdf") {
    const html2canvas = (await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 7276, 23))).default;
    const jsPDF = (await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 5158, 23))).default;
    const el = document.getElementById(targetId);
    if (!el) return;
    const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
        unit: "px",
        format: "a4",
        orientation: "portrait"
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
}


/***/ })

};
;
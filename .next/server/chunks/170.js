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
// _components/PDFGenerator.js
async function downloadPDF(targetId, filename = "compound-result.pdf") {
    if (true) return;
    const el = document.getElementById(targetId);
    if (!el) return;
    const [{ default: html2canvas  }, { jsPDF  }] = await Promise.all([
        Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 7276, 23)),
        Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 5158, 23)), 
    ]);
    // PDF 설정 (A4, mm)
    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 10; // mm
    const contentW = pageW - margin * 2;
    const contentH = pageH - margin * 2;
    // 캡처 품질 (너무 높이면 메모리/캔버스 제한 때문에 오히려 잘림)
    const scale = 1.5;
    // 캡처 기준 width/height 계산
    const rect = el.getBoundingClientRect();
    const widthPx = Math.ceil(rect.width);
    const totalHeightPx = Math.ceil(el.scrollHeight);
    // "mm 당 px" 환산 (현재 DOM 폭이 PDF contentW(mm)에 맞춰 들어간다고 가정)
    const pxPerMm = widthPx / contentW;
    const pageHeightPx = Math.floor(contentH * pxPerMm);
    // 캡처 전 스크롤/스타일 안정화
    const prevScrollY = window.scrollY;
    window.scrollTo(0, 0);
    // ✅ 핵심: 긴 화면을 페이지 높이씩 잘라서 여러 번 캡처
    let y = 0;
    let pageIndex = 0;
    while(y < totalHeightPx){
        const sliceHeight = Math.min(pageHeightPx, totalHeightPx - y);
        const canvas = await html2canvas(el, {
            backgroundColor: "#ffffff",
            scale,
            useCORS: true,
            logging: false,
            // ✅ 슬라이스 캡처
            width: widthPx,
            height: sliceHeight,
            x: 0,
            y,
            // offscreen 영역 캡처 안정화 옵션
            scrollX: 0,
            scrollY: 0,
            windowWidth: document.documentElement.clientWidth,
            windowHeight: document.documentElement.clientHeight
        });
        const imgData = canvas.toDataURL("image/png", 1.0);
        if (pageIndex > 0) pdf.addPage();
        // 캔버스 비율 유지해서 PDF에 넣기
        const imgH = canvas.height / canvas.width * contentW;
        pdf.addImage(imgData, "PNG", margin, margin, contentW, imgH, undefined, "FAST");
        y += sliceHeight;
        pageIndex += 1;
    }
    // 원복
    window.scrollTo(0, prevScrollY);
    pdf.save(filename);
}


/***/ })

};
;
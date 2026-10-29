function distributionPlan(initial, taxRate, years) {
  const unitPrice=10000, distribution=100, buyFee=.001;
  let units=initial/unitPrice, tax=0, fees=0;
  for(let m=0;m<years*12;m++) {
    const gross=units*distribution, withheld=gross*taxRate, fee=(gross-withheld)*buyFee;
    units+=(gross-withheld-fee)/unitPrice;tax+=withheld;fees+=fee;
  }
  return {years,withdrawFund:initial,withdrawCash:initial*.01*(1-taxRate)*years*12,reinvestFund:units*unitPrice,tax,fees};
}
function routes(initial, fxRatio=1, years=1) {
  const local=initial*(1-.0005)*(1.08*(1-.002))**years*fxRatio*(1-.0005);
  const us=initial*(1-.001)*(1-.0005)*(1.08*(1-.001))**years*fxRatio*(1-.0005)*(1-.001);
  const localGain=local-initial,usGain=us-initial;
  const localTax=Math.max(localGain,0)*.154,usTax=Math.max(usGain-2500000,0)*.22;
  return {initial,fxRatio,years,local,us,localGain,usGain,localTax,usTax,localNet:local-localTax,usNet:us-usTax};
}
module.exports={distributionPlan,routes};
if(require.main===module) {
  console.log(JSON.stringify({ko:[1,3,5].map(y=>distributionPlan(30000000,.154,y)),en:[1,3,5].map(y=>distributionPlan(30000,.2,y)),routes:[10000000,100000000].map(p=>routes(p))},null,2));
  const fs=require('node:fs'),cheerio=require('cheerio');
  for(const key of ['nav','tracking','price','tax']) {
    const file=`reports/investing-krx-${key}-source-2026-10-29.html`;
    const $=cheerio.load(fs.readFileSync(file,'utf8'));$('script,style,nav,header,footer').remove();
    const lines=$.root().text().split(/\n/).map(s=>s.trim()).filter(s=>s.length>25&&(/NAV|추적오차|과세|분배금|괴리율|LP|순자산/.test(s)));
    console.log(key+': '+lines.slice(-10).join('\n').slice(0,2200));
  }
}

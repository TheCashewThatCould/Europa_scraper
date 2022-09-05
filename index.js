const puppeteer = require('puppeteer')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const fsPromises = require('fs').promises;
const path = require('path');
async function main(){
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--window-size=1920,1080',
        ]
      });
    const page = await browser.newPage();
    const url = `https://www.consilium.europa.eu/en/documents-publications/public-register/public-register-search/results/?WordsInSubject&WordsInText&DocumentNumber&InterinstitutionalFiles&DocumentDateFrom&DocumentDateTo&MeetingDateFrom&MeetingDateTo&DocumentLanguage=EN&OrderBy=DOCUMENT_DATE+DESC&ctl00%24ctl00%24cpMain%24cpMain%24btnSubmit`;
    var pdf_urls = []
    await page.goto(url);
    await sleep(5000)
    var next = null
    do{
        const blocks = await page.$$('#main-content > div > div > div:nth-child(3) > ul > li')
        var fails = 0
        for(let i = 0;i< blocks.length;i++){
            try{
                
                const url = await blocks[i].$eval('div:nth-child(2) > div > a', x => x.href)
                const title = await blocks[i].$eval('span', x => x.textContent)
                const date = await blocks[i].$eval('span:nth-child(2)', x => x.textContent)
                console.log(url)
                var block = {
                    url,
                    title,
                    date
                }
                pdf_urls.push(block)
            }
            catch(err){
                /*
                const title = await blocks[i].$eval('span', x => x.href)
                const date = await blocks[i].$eval('span:nth-child(2)', x => x.href)
                var body = {
                    title,
                    date
                }
                try{
                    const list = await blocks[i].$$('table > tbody > tr')

                    for(let i = 0;i < list.length;i++){
                        const temp = await list[i].$eval('td', x => x.textContent)
                        const head = temp.split(":")[0]
                        const info = await list.$eval('td:nth-child(2)', x => x.textContent)
                        var a = {}
                        a[head] = info
                        body.push(a)
                    }
                    console.log(body)
                }catch(err){
                    console.log(err)
                }
                fails+=1
                */
            }
        }
        next = await page.$eval('li[aria-label="Go to the next page"]', x=>x.ariaDisabled)
        try{
            await page.click('li[aria-label="Go to the next page"]')
        }catch(err){
            break
        }
        await sleep(3000)
        console.log(next)
    }while(next===null)
    await fsPromises.writeFile(
        './data.json',
        JSON.stringify(pdf_urls), err => {
            console.log(err)
        }
    );
    await browser.close()
}

main()
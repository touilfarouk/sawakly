import puppeteer from "puppeteer";

const scrapeCategory = async () => {
    const browser = await puppeteer.launch({ headless: false }); // Keep browser open for debugging
    const page = await browser.newPage();

    const loginUrl = "https://sawa9ly.app/login"; // Adjust if needed
    const categoryUrl = "https://sawa9ly.app/category/4/";

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // Step 1: Go to the login page
    await page.goto(loginUrl, { waitUntil: "networkidle2" });

    // Step 2: Fill in login credentials
    await page.type("input[name='email']", "", { delay: 100 }); // Replace with your email
    await page.type("input[name='password']", "", { delay: 100 }); // Replace with your password

    // Step 3: Click the login button
    await page.click("button[type='submit']"); // Adjust selector if needed
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("✅ Logged in successfully!");

    // Step 4: Go to the category page
    await page.goto(categoryUrl, { waitUntil: "networkidle2" });

    // Step 5: Scrape products
    const products = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("div[class*='bg-white']")).map(product => ({
            title: product.querySelector("span.mt-2")?.innerText.trim() || "N/A",
            price: product.querySelector(".text-center.font-bold")?.innerText.trim() || "N/A",
            image: product.querySelector("img")?.src || "N/A",
            url: product.querySelector("a")?.href || "N/A"
        }));
    });

    console.log(products);

    await browser.close();
};

scrapeCategory();

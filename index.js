import puppeteer from "puppeteer";

const scrapeProducts = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const loginUrl = "https://sawa9ly.app/login";
    const productUrls = [
        "https://sawa9ly.app/product/3792",
        "https://sawa9ly.app/product/3793",
        "https://sawa9ly.app/product/3794",
        "https://sawa9ly.app/product/3795"
    ];

    const commissionAmounts = {
        "https://sawa9ly.app/product/3792": 5,
        "https://sawa9ly.app/product/3793": 10,
        "https://sawa9ly.app/product/3794": 15,
        "https://sawa9ly.app/product/3795": 20
    };

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // Login process
    await page.goto(loginUrl, { waitUntil: "networkidle2" });
    await page.type("input[name='email']", "farouktouil@hotmail.com", { delay: 100 });
    await page.type("input[name='password']", "1234Moonlight?!", { delay: 100 });
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    console.log("✅ Logged in successfully!");

    let allProducts = [];

    for (const productUrl of productUrls) {
        await page.goto(productUrl, { waitUntil: "networkidle2" });

        const productData = await page.evaluate((url, commissions) => {
            // Helper function to clean price values
            const cleanPrice = (price) => {
                if (!price || price === 'N/A') return 0;
                return parseFloat(price.replace(/[^\d.]/g, '')) || 0;
            };

            // Extract product title
            const title = document.getElementById('product-title')?.innerText.trim() || 'N/A';

            // Extract prices
            const priceElement = document.querySelector('.text-center .font-bold');
            const oldPriceElement = document.querySelector('.font-bold.line-through');
            
            const currentPriceText = priceElement?.innerText.trim() || 'N/A';
            const oldPriceText = oldPriceElement?.innerText.trim() || 'N/A';
            
            const currentPrice = cleanPrice(currentPriceText);
            const oldPrice = cleanPrice(oldPriceText);
            const commission = commissions[url] || 0;
            const totalPrice = currentPrice + commission;

            // Extract commission text
            const commissionText = document.querySelector('.text-center .text-sm')?.innerText.trim() || 'N/A';

            // Extract categories
            const categoryElements = document.querySelectorAll('.pt-3.pb-4.border-b a');
            const categories = Array.from(categoryElements).map(el => el.innerText.trim());

            // Extract all product images from galleries
            const getGalleryImages = () => {
                const images = [];
                // Main product images
                const mainGallery = document.querySelector('.bigImageSwiper');
                if (mainGallery) {
                    const mainImages = mainGallery.querySelectorAll('img');
                    mainImages.forEach(img => images.push(img.src));
                }
                
                // Thumbnail images
                const thumbGallery = document.querySelector('.thumbsSliderSwiper');
                if (thumbGallery) {
                    const thumbImages = thumbGallery.querySelectorAll('img');
                    thumbImages.forEach(img => {
                        if (!images.includes(img.src)) images.push(img.src);
                    });
                }
                
                // Real images section
                const realGallery = document.querySelector('.real_bigImageSwiper');
                if (realGallery) {
                    const realImages = realGallery.querySelectorAll('img');
                    realImages.forEach(img => images.push(img.src));
                }
                
                // Real images thumbnails
                const realThumbs = document.querySelector('.real_thumbsSliderSwiper');
                if (realThumbs) {
                    const realThumbImages = realThumbs.querySelectorAll('img');
                    realThumbImages.forEach(img => {
                        if (!images.includes(img.src)) images.push(img.src);
                    });
                }
                
                return [...new Set(images)]; // Remove duplicates
            };

            const allImages = getGalleryImages();

            // Also check for images in download script as fallback
            const scriptImages = [];
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const content = script.textContent;
                if (content.includes('forceDownload')) {
                    const matches = content.match(/https:\/\/[^"]+\.(jpg|jpeg|png|gif)/gi) || [];
                    matches.forEach(url => {
                        if (!allImages.includes(url) && !scriptImages.includes(url)) {
                            scriptImages.push(url);
                        }
                    });
                }
            }

            return {
                url,
                title,
                currentPrice: currentPriceText,
                currentPriceValue: currentPrice,
                oldPrice: oldPriceText,
                oldPriceValue: oldPrice,
                commission,
                commissionText,
                totalPrice,
                categories,
                galleryImages: allImages,
                scriptImages: scriptImages,
                allImages: [...allImages, ...scriptImages].filter((v, i, a) => a.indexOf(v) === i) // Combine and dedupe
            };
        }, productUrl, commissionAmounts);

        allProducts.push(productData);
    }

    console.log("Scraped Products Data:");
    console.log(JSON.stringify(allProducts, null, 2));

    await browser.close();
    return allProducts;
};

scrapeProducts().then(data => {
    console.log("Scraping completed!");
    // You can process the data further here if needed
});

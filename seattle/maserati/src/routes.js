import { createPlaywrightRouter } from "crawlee";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
export const router = createPlaywrightRouter();

// /**** Scrapping maseratiSeattle Website ****/
router.addHandler("DETAIL", async ({ request, page, log, dataset }) => {
  //when in the car details page
  log.debug(`Extracting data: ${request.url}`);

  //Car Make and Model
  const carName =
    (await page.locator("span.vehicle-title__make-model").textContent()) ||
    "Not Available";

  const Trim =
    (await page.locator("span.vehicle-title__trim").textContent()) ||
    "Not Available";

  function getCarMakeAndModel(carName, carTrim) {
    const [make, ...modelParts] = carName.split(" ");
    const model = modelParts.join(" ") + " " + carTrim;
    return { make, model };
  }

  const { make: Make, model: Model } = getCarMakeAndModel(carName, Trim);

  //Car Year
  const Year =
    (await page.locator("span.vehicle-title__year").textContent()) ||
    "No Year Found";

  //Car Location
  const Location = "Seattle";

  //Car Price
  const Price =
    (await page
      .locator(
        ".beforeLeadSubmission .priceBlockResponsiveDesktop span.priceBlocItemPriceValue.priceStakText--bold"
      )
      .textContent()) || "Not Available";

  //Car Images

  await page.click("#thumbnail--desktop--0 img.thumbnail__image");

  await page.waitForSelector(".gallery-thumbnails img");

  const otherCarImages = await page.$$eval(".gallery-thumbnails img", (imgs) =>
    imgs.map((img) => img.src)
  );

  //cover image
  const CoverImage = otherCarImages[0];

  //Car Body Type
  const BodyType =
    (await page
      .locator(".info__item--body-style span.info__value")
      .textContent()) || "Not Available";

  //Car Color
  const ExteriorColor =
    (
      await page
        .locator(".info__item--exterior-color span.info__value")
        .textContent()
    )
      ?.trim()
      .replace(/\n+/g, " ") || "Not Available";

  const InteriorColor =
    (
      await page
        .locator(".info__item--interior-color span.info__value")
        .textContent()
    )
      ?.trim()
      .replace(/\n+/g, " ") || "Not Available";

  //Car Fuel Type
  const FuelType =
    (await page
      .locator(".info__item--fuel-type span.info__value")
      .textContent()) || "Not Available";

  //Car Transmission
  const Transmission =
    (await page
      .locator(".info__item--transmission span.info__value")
      .textContent()) || "Not Available";

  //Car Stock_Number
  const Stock_Number =
    (await page
      .locator(
        ".vehicle-identifiers__item--stock-number span.vehicle-identifiers__value"
      )
      .textContent()) || "Not Available";

  //Car VIN
  const VIN =
    (await page
      .locator(
        ".vehicle-identifiers__item--vin span.vehicle-identifiers__value"
      )
      .textContent()) || "Not Available";

  const carDetails = {
    car_url: request.url,
    car_id: uuidv4(),
    Location,
    Make,
    Model,
    Trim,
    BodyType,
    Year,
    Price,
    ExteriorColor,
    InteriorColor,
    Transmission,
    FuelType,
    CoverImage,
    otherCarImages,
    Stock_Number,
    VIN,
  };

  log.debug(`Saving data: ${request.url}`);
  await dataset.pushData(carDetails);

  console.log(carDetails);
});

router.addHandler("CATEGORY", async ({ page, enqueueLinks, request, log }) => {
  //when in the new cars page
  log.debug(`Enqueueing pagination for: ${request.url}`);

  const carSelector = "a.hero-carousel__item--viewvehicle";

  await page.waitForSelector(carSelector);
  await enqueueLinks({
    selector: carSelector,
    label: "DETAIL",
  });
});

router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
  log.debug(`Enqueueing categories from page: ${request.url}`);

  // await page.click("a.newdropdown");

  const newCarLink = "a#\\32 _child_1";

  await enqueueLinks({
    selector: newCarLink,
    label: "CATEGORY",
  });
});

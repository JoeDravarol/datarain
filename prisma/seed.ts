import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

createReadStream('data/sampleData.csv')
  .pipe(parse({ from_line: 2 }))
  .on('data', async (row) => {
    const [
      date,
      retailer,
      ean,
      category,
      manufacturer,
      brand,
      productTitle,
      image,
      onPromotion,
      promotionDescription,
      basePrice,
      shelfPrice,
      promotedPrice,
    ] = row;

    const { id: retailerId } = await db.retailer.upsert({
      create: { name: retailer },
      where: { name: retailer },
      update: { name: retailer },
    });

    const { id: manufacturerId } = await db.manufacturer.upsert({
      create: { name: manufacturer },
      where: { name: manufacturer },
      update: { name: manufacturer },
    });

    const { id: categoryId } = await db.category.upsert({
      create: { name: category },
      where: { name: category },
      update: { name: category },
    });

    const { id: brandId } = await db.brand.upsert({
      create: { name: brand },
      where: { name: brand },
      update: { name: brand },
    });

    const { id: productId } = await db.product.upsert({
      create: {
        title: productTitle,
        ean,
        image,
        manufacturerId,
        categoryId,
        brandId,
        retailers: {
          connect: [{ id: retailerId }],
        },
      },
      where: { ean },
      update: {
        ean,
        retailers: {
          connect: [{ id: retailerId }],
        },
      },
    });

    const record = await db.record.create({
      data: {
        date: new Date(date),
        basePrice: parseFloat(basePrice),
        shelfPrice: parseFloat(shelfPrice),
        promotedPrice: parseFloat(promotedPrice),
        onPromotion: onPromotion === 'TRUE',
        promotionDescription,
        productId,
        retailerId,
      },
    });
  })
  .on('end', async () => {
    console.log('CSV file succesfully processed');
  })
  .on('error', (error) => {
    console.error(error.message);
  });

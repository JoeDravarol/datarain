import type { MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
import { useLoaderData } from '@remix-run/react';

import RecordsTable from '~/components/RecordsTable';

export const loader = async () => {
  const db = new PrismaClient();

  const records = await db.record.findMany({
    take: 100,
    include: {
      product: {
        select: { title: true },
      },
      retailer: {
        select: { name: true },
      },
    },
  });

  return json({ records });
};

export default function Index() {
  const { records } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <RecordsTable records={records} />
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Brand analysis - Datarain' },
    {
      name: 'description',
      content:
        'Welcome to Datarain! We monitor the performance of your brand and help you to "know more to sell more".',
    },
  ];
};

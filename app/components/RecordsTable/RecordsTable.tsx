import React from 'react';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { FilterMatchMode } from 'primereact/api';
import { Record, Prisma } from '@prisma/client';

type RecordsWithProductAndRetailer = Prisma.RecordGetPayload<{
  include: {
    product: {
      select: { title: true };
    };
    retailer: {
      select: { name: true };
    };
  };
}>;

type RecordsTable = {
  records: RecordsWithProductAndRetailer[];
};

type Price = 'basePrice' | 'shelfPrice' | 'promotedPrice';

const RecordsTable = ({ records }: RecordsTable) => {
  const [filters, setFilters] = React.useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = React.useState('');

  // Filter Logic
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };

    // @ts-expect-error Example PrimeReact doc
    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // UTILS
  const formatDate = (value: string | Date) => {
    return new Date(value).toLocaleDateString('en-UK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-UK', {
      style: 'currency',
      currency: 'GBP',
    });
  };

  // UI
  const dateBodyTemplate = (rowData: Record) => {
    return formatDate(rowData.date);
  };

  // basePrice | shelfPrice | promotedPrice

  const priceBodyTemplate = (type: Price) => {
    return (rowData: Record) => {
      return formatCurrency(rowData[type]);
    };
  };

  const onPromotionBodyTemplate = (rowData: Record) => {
    if (!rowData.onPromotion) return;

    return (
      <Tag icon="pi pi-info-circle" severity="info" value="On Promotion" />
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 justify-content-between align-items-center">
      <h4 className="m-0">Records</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Keyword Search"
        />
      </span>
    </div>
  );

  return (
    <DataTable
      value={records}
      header={header}
      virtualScrollerOptions={{
        itemSize: 100,
      }}
      filters={filters}
      globalFilterFields={[
        'retailer.name',
        'product.title',
        'basePrice',
        'shelfPrice',
        'promotedPrice',
      ]}
      emptyMessage="No records found."
      stateStorage="session"
      showGridlines
      stripedRows
      removableSort
      resizableColumns
    >
      <Column
        field="date"
        header="Date"
        sortable
        filterField="date"
        dataType="date"
        body={dateBodyTemplate}
      />
      <Column field="retailer.name" header="Retailer" sortable filter />
      <Column field="product.title" header="Product" sortable />
      <Column
        field="basePrice"
        header="Base Price"
        dataType="numeric"
        body={priceBodyTemplate('basePrice')}
        sortable
        filter
      />
      <Column
        field="shelfPrice"
        header="Shelf Price"
        dataType="numeric"
        body={priceBodyTemplate('shelfPrice')}
        sortable
        filter
      />
      <Column
        field="promotedPrice"
        header="Promoted Price"
        dataType="numeric"
        body={priceBodyTemplate('promotedPrice')}
        sortable
        filter
      />
      <Column
        field="onPromotion"
        header="On Promotion"
        dataType="boolean"
        body={onPromotionBodyTemplate}
        sortable
      />
      <Column field="promotionDescription" header="Promotion Description" />
    </DataTable>
  );
};

export default RecordsTable;

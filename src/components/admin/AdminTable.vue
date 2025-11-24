<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string }[];
  rows: Record<string, unknown>[];
  emptyText?: string;
}>();

const formatDateTimeLocal = (value: unknown): string => {
  if (!value) return '-';

  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const formatDateLocal = (value: unknown): string => {
  if (!value) return '-';

  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
};

const formatCell = (colKey: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';

  if (colKey === 'createdAt' || colKey === 'updatedAt') {
    return formatDateTimeLocal(value);
  }

  if (colKey === 'visibleUntil') {
    return formatDateLocal(value);
  }

  return String(value);
};
</script>

<template>
  <div class="admin-table-wrap">
    <table
      v-if="rows.length"
      class="admin-table"
    >
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in rows"
          :key="i"
        >
          <td
            v-for="col in columns"
            :key="col.key"
          >
            {{ formatCell(col.key, row[col.key]) }}
          </td>
        </tr>
      </tbody>
    </table>

    <p
      v-else
      class="admin-table-empty"
    >
      {{ emptyText || 'Nema podataka.' }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.admin-table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;

  &-wrap {
    margin-top: 10px;
    width: 100%;
    max-height: calc(100vh - 260px);
    overflow-y: auto;
    overflow-x: auto;
  }

  &-empty {
    margin-top: 10px;
    text-align: center;
    color: #6b7280;
    font-weight: 600;
  }

  th,
  td {
    padding: 10px 12px;
    font-size: 14px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
    color: var(--text-color-black);
  }

  th {
    background: #f9fafb;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
}
</style>

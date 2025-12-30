<template>
  <div class="invoices">
    <h1>Invoices</h1>

    <div class="card">
      <div v-if="invoices.length === 0" class="empty">
        No invoices yet.
      </div>
      <table v-else class="invoice-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Invoice #</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoices" :key="invoice.id">
            <td>{{ invoice.date }}</td>
            <td>{{ invoice.number }}</td>
            <td>{{ invoice.amount }}</td>
            <td>
              <span :class="['status', invoice.status]">{{ invoice.status }}</span>
            </td>
            <td>
              <button class="download-btn" @click="downloadInvoice(invoice.id)">
                Download
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Invoice {
  id: string;
  date: string;
  number: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
}

const invoices = ref<Invoice[]>([]);

function downloadInvoice(id: string) {
  console.log('Download invoice:', id);
}
</script>

<style scoped>
.invoices {
  max-width: 1000px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.empty {
  text-align: center;
  padding: 40px;
  color: #666;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
}

.invoice-table th,
.invoice-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.invoice-table th {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.status.paid {
  background-color: #d4edda;
  color: #155724;
}

.status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status.overdue {
  background-color: #f8d7da;
  color: #721c24;
}

.download-btn {
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.download-btn:hover {
  background-color: #2980b9;
}
</style>

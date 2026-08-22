@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 font-sans antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green-600 px-5 py-2.5 font-medium text-white transition-all hover:bg-brand-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50;
  }

  .btn-danger {
    @apply inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-5 py-2.5 font-medium text-white transition-all hover:bg-brand-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50;
  }

  .btn-orange {
    @apply inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange-500 px-5 py-2.5 font-medium text-white transition-all hover:bg-brand-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50;
  }

  .btn-outline {
    @apply inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition-all hover:border-brand-green-600 hover:text-brand-green-700 active:scale-[0.98];
  }

  .card {
    @apply rounded-xl bg-white shadow-sm ring-1 ring-gray-200/60 transition-all;
  }

  .input-field {
    @apply w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-green-600 focus:outline-none focus:ring-2 focus:ring-brand-green-600/20;
  }

  .label-text {
    @apply mb-1.5 block text-sm font-medium text-gray-700;
  }

  .badge {
    @apply inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

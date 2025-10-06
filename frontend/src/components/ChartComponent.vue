<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController,
  PieController
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController,
  PieController
);

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['line', 'bar', 'doughnut', 'pie'].includes(value)
  },
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  height: {
    type: String,
    default: '300px'
  }
});

const canvasRef = ref(null);
let chartInstance = null;

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, system-ui, sans-serif'
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif'
        },
        color: '#6B7280'
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif'
        },
        color: '#6B7280'
      }
    }
  }
};

const createChart = () => {
  if (!canvasRef.value) return;

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  const mergedOptions = {
    ...defaultOptions,
    ...props.options
  };

  chartInstance = new ChartJS(canvasRef.value, {
    type: props.type,
    data: props.data,
    options: mergedOptions
  });
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.data = props.data;
    chartInstance.update('active');
  }
};

onMounted(() => {
  nextTick(() => {
    createChart();
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

watch(() => props.data, updateChart, { deep: true });
watch(() => props.type, createChart);
</script>

<template>
  <div class="relative" :style="{ height: height }">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

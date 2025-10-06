<script setup>
import { computed } from 'vue';
import ChartComponent from './ChartComponent.vue';

const props = defineProps({
  applications: {
    type: Array,
    required: true
  }
});

// Weekly trends data
const weeklyTrendsData = computed(() => {
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }
  
  const labels = last7Days.map(date => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });
  
  const applicationsData = last7Days.map(date => {
    return props.applications.filter(app => {
      const appDate = new Date(app.date).toISOString().split('T')[0];
      return appDate === date;
    }).length;
  });
  
  const interviewsData = last7Days.map(date => {
    return props.applications.filter(app => {
      const appDate = new Date(app.date).toISOString().split('T')[0];
      return appDate === date && app.status === 'Interview';
    }).length;
  });
  
  const offersData = last7Days.map(date => {
    return props.applications.filter(app => {
      const appDate = new Date(app.date).toISOString().split('T')[0];
      return appDate === date && app.status === 'Offer';
    }).length;
  });
  
  return {
    labels,
    datasets: [
      {
        label: 'Applications',
        data: applicationsData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Interviews',
        data: interviewsData,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Offers',
        data: offersData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };
});

// Status distribution data
const statusDistributionData = computed(() => {
  const statusCounts = props.applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});
  
  const colors = {
    'Applied': 'rgb(59, 130, 246)',
    'Interview': 'rgb(245, 158, 11)',
    'Offer': 'rgb(34, 197, 94)',
    'Rejected': 'rgb(239, 68, 68)'
  };
  
  return {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: Object.keys(statusCounts).map(status => colors[status] || 'rgb(156, 163, 175)'),
      borderColor: 'white',
      borderWidth: 3,
      hoverOffset: 10
    }]
  };
});

// Monthly overview data
const monthlyOverviewData = computed(() => {
  const last6Months = [];
  const today = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    last6Months.push(date);
  }
  
  const labels = last6Months.map(date => 
    date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  );
  
  const applicationsData = last6Months.map(month => {
    return props.applications.filter(app => {
      const appDate = new Date(app.date);
      return appDate.getMonth() === month.getMonth() && 
             appDate.getFullYear() === month.getFullYear();
    }).length;
  });
  
  return {
    labels,
    datasets: [{
      label: 'Applications',
      data: applicationsData,
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false
    }]
  };
});

// Chart options
const weeklyTrendsOptions = {
  plugins: {
    title: {
      display: true,
      text: 'Weekly Trends',
      font: {
        size: 14,
        weight: 'bold',
        family: 'Inter, system-ui, sans-serif'
      },
      color: '#1F2937'
    },
    legend: {
      labels: {
        font: {
          size: 11
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: {
          size: 10
        }
      }
    },
    x: {
      ticks: {
        font: {
          size: 10
        }
      }
    }
  }
};

const statusDistributionOptions = {
  plugins: {
    title: {
      display: true,
      text: 'Status Distribution',
      font: {
        size: 14,
        weight: 'bold',
        family: 'Inter, system-ui, sans-serif'
      },
      color: '#1F2937'
    },
    legend: {
      labels: {
        font: {
          size: 11
        }
      }
    }
  }
};

const monthlyOverviewOptions = {
  plugins: {
    title: {
      display: true,
      text: 'Monthly Overview',
      font: {
        size: 14,
        weight: 'bold',
        family: 'Inter, system-ui, sans-serif'
      },
      color: '#1F2937'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: {
          size: 10
        }
      }
    },
    x: {
      ticks: {
        font: {
          size: 10
        }
      }
    }
  }
};

// Rejection trends data
const rejectionTrendsData = computed(() => {
  const last8Weeks = [];
  const currentDate = new Date();
  
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - (currentDate.getDay() + 7 * i));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
    last8Weeks.push(weekLabel);
  }

  const rejectionCounts = last8Weeks.map((_, index) => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - (currentDate.getDay() + 7 * (7 - index)));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return props.applications.filter(app => {
      const appDate = new Date(app.date);
      return app.status === 'Rejected' && appDate >= weekStart && appDate <= weekEnd;
    }).length;
  });

  return {
    labels: last8Weeks,
    datasets: [{
      label: 'Rejections',
      data: rejectionCounts,
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };
});

const rejectionTrendsOptions = {
  plugins: {
    title: {
      display: true,
      text: 'Rejection Trends (Last 8 Weeks)',
      font: {
        size: 14,
        weight: 'bold',
        family: 'Inter, system-ui, sans-serif'
      },
      color: '#1F2937'
    },
    legend: {
      labels: {
        font: {
          size: 11
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: {
          size: 10
        }
      }
    },
    x: {
      ticks: {
        font: {
          size: 10
        }
      }
    }
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- Weekly Trends Chart -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <ChartComponent
        type="line"
        :data="weeklyTrendsData"
        :options="weeklyTrendsOptions"
        height="200px"
      />
    </div>

    <!-- Status Distribution and Monthly Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Status Distribution -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <ChartComponent
          type="doughnut"
          :data="statusDistributionData"
          :options="statusDistributionOptions"
          height="200px"
        />
      </div>

      <!-- Monthly Overview -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <ChartComponent
          type="bar"
          :data="monthlyOverviewData"
          :options="monthlyOverviewOptions"
          height="200px"
        />
      </div>
    </div>

    <!-- Rejection Analysis -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Rejection Analysis</h3>
        <p class="text-sm text-gray-600">Track rejection patterns to improve your application strategy</p>
      </div>
      <ChartComponent
        type="line"
        :data="rejectionTrendsData"
        :options="rejectionTrendsOptions"
        height="200px"
      />
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">Total</p>
            <p class="text-2xl font-bold text-blue-900">{{ props.applications.length }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-yellow-600 uppercase tracking-wide">Interviews</p>
            <p class="text-2xl font-bold text-yellow-900">{{ props.applications.filter(a => a.status === 'Interview').length }}</p>
          </div>
          <div class="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-600 uppercase tracking-wide">Offers</p>
            <p class="text-2xl font-bold text-green-900">{{ props.applications.filter(a => a.status === 'Offer').length }}</p>
          </div>
          <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Applied</p>
            <p class="text-2xl font-bold text-gray-900">{{ props.applications.filter(a => a.status === 'Applied').length }}</p>
          </div>
          <div class="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
